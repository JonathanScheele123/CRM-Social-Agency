const DRIVE_API = "https://www.googleapis.com/drive/v3";
const UPLOAD_API = "https://www.googleapis.com/upload/drive/v3";
const NO_COMPRESS = { "Accept-Encoding": "identity" };

function b64url(data: string | ArrayBuffer): string {
  const bytes =
    typeof data === "string"
      ? new TextEncoder().encode(data)
      : new Uint8Array(data);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function getAccessToken(): Promise<string> {
  const clientEmail = process.env.GOOGLE_SA_CLIENT_EMAIL;
  const rawKey = process.env.GOOGLE_SA_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !rawKey) {
    throw new Error("Google Drive-Zugangsdaten fehlen (GOOGLE_SA_CLIENT_EMAIL, GOOGLE_SA_PRIVATE_KEY).");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = b64url(
    JSON.stringify({
      iss: clientEmail,
      scope: "https://www.googleapis.com/auth/drive",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    })
  );
  const toSign = `${header}.${payload}`;

  const pemBody = rawKey
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s/g, "");

  const derBytes = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    derBytes,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(toSign)
  );

  const jwt = `${toSign}.${b64url(sig)}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", ...NO_COMPRESS },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => null) as { error?: string; error_description?: string } | null;
    throw new Error(`Drive-Auth fehlgeschlagen: ${errData?.error_description ?? errData?.error ?? `HTTP ${res.status}`}`);
  }

  const { access_token } = (await res.json()) as { access_token: string };
  return access_token;
}

async function drivePost(token: string, path: string, body: unknown): Promise<{ id: string }> {
  const res = await fetch(`${DRIVE_API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...NO_COMPRESS,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: `HTTP ${res.status}` } })) as { error?: { message?: string } };
    throw new Error(err?.error?.message ?? `Drive API Fehler ${res.status}`);
  }
  return res.json();
}

async function driveGet(token: string, path: string): Promise<{ id: string }> {
  const res = await fetch(`${DRIVE_API}${path}`, {
    headers: { Authorization: `Bearer ${token}`, ...NO_COMPRESS },
  });
  if (!res.ok) throw new Error(`Drive GET Fehler ${res.status}`);
  return res.json();
}

async function createFolder(token: string, name: string, parentId?: string): Promise<string> {
  const data = await drivePost(token, "/files?supportsAllDrives=true&fields=id", {
    name,
    mimeType: "application/vnd.google-apps.folder",
    ...(parentId ? { parents: [parentId] } : {}),
  });
  return data.id;
}

async function getRootFolderId(token: string): Promise<string | undefined> {
  const envId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
  if (!envId) return undefined;
  try {
    await driveGet(token, `/files/${envId}?supportsAllDrives=true&fields=id`);
    return envId;
  } catch {
    return undefined;
  }
}

export async function erstelleKundenOrdner(unternehmensname: string): Promise<string> {
  const token = await getAccessToken();
  const parentId = await getRootFolderId(token);

  const hauptId = await createFolder(token, unternehmensname, parentId);
  await createFolder(token, "Arbeitsmaterial", hauptId);
  await createFolder(token, "Rohdateien", hauptId);

  const fertigId = await createFolder(token, "Fertige Projekte", hauptId);
  await createFolder(token, "Alt Reels", fertigId);
  await createFolder(token, "Alt Stories", fertigId);
  await createFolder(token, "Alt Karussell", fertigId);
  await createFolder(token, "Alt Bild", fertigId);

  const adminEmail = process.env.SMTP_USER;
  if (adminEmail) {
    await drivePost(
      token,
      `/files/${hauptId}/permissions?supportsAllDrives=true&sendNotificationEmail=false`,
      { type: "user", role: "writer", emailAddress: adminEmail }
    );
  }

  return `https://drive.google.com/drive/folders/${hauptId}`;
}

export async function getDriveFiles(folderId: string): Promise<unknown[]> {
  const token = await getAccessToken();
  const q = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  const fields = encodeURIComponent("files(id,name,mimeType,size,modifiedTime,webViewLink,thumbnailLink)");
  const res = await fetch(
    `${DRIVE_API}/files?q=${q}&fields=${fields}&orderBy=folder%2Cname&pageSize=200&supportsAllDrives=true&includeItemsFromAllDrives=true`,
    { headers: { Authorization: `Bearer ${token}`, ...NO_COMPRESS } }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: `HTTP ${res.status}` } })) as { error?: { message?: string } };
    throw new Error(err?.error?.message ?? `Drive Fehler ${res.status}`);
  }
  const data = (await res.json()) as { files?: unknown[] };
  return data.files ?? [];
}

export async function uploadDriveFile(
  folderId: string,
  fileName: string,
  mimeType: string,
  buffer: Buffer
): Promise<unknown> {
  const token = await getAccessToken();
  const metadata = JSON.stringify({ name: fileName, parents: [folderId] });
  const boundary = "bound_" + Math.random().toString(36).slice(2);
  const body = [
    `--${boundary}\r\nContent-Type: application/json\r\n\r\n${metadata}\r\n`,
    `--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`,
    buffer,
    `\r\n--${boundary}--`,
  ];
  const combined = Buffer.concat(
    body.map((p) => (Buffer.isBuffer(p) ? p : Buffer.from(p as string)))
  );
  const res = await fetch(
    `${UPLOAD_API}/files?uploadType=multipart&supportsAllDrives=true&fields=id,name,mimeType,size,modifiedTime,webViewLink`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
        ...NO_COMPRESS,
      },
      body: combined,
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: `HTTP ${res.status}` } })) as { error?: { message?: string } };
    throw new Error(err?.error?.message ?? `Upload Fehler ${res.status}`);
  }
  return res.json();
}

export async function createDriveFolder(folderId: string, name: string): Promise<unknown> {
  const token = await getAccessToken();
  return drivePost(token, "/files?supportsAllDrives=true&fields=id,name,mimeType,modifiedTime", {
    name,
    mimeType: "application/vnd.google-apps.folder",
    parents: [folderId],
  });
}

export async function deleteDriveFile(fileId: string): Promise<void> {
  const token = await getAccessToken();
  const res = await fetch(`${DRIVE_API}/files/${fileId}?supportsAllDrives=true`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}`, ...NO_COMPRESS },
  });
  if (!res.ok && res.status !== 204) {
    throw new Error(`Löschen fehlgeschlagen: HTTP ${res.status}`);
  }
}

export async function moveDriveFile(
  fileId: string,
  targetFolderId: string,
  sourceFolderId: string
): Promise<void> {
  const token = await getAccessToken();
  const res = await fetch(
    `${DRIVE_API}/files/${fileId}?addParents=${targetFolderId}&removeParents=${sourceFolderId}&supportsAllDrives=true&fields=id`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...NO_COMPRESS },
      body: "{}",
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: `HTTP ${res.status}` } })) as { error?: { message?: string } };
    throw new Error(err?.error?.message ?? `Verschieben fehlgeschlagen ${res.status}`);
  }
}

export async function shareDriveFile(fileId: string): Promise<string> {
  const token = await getAccessToken();
  await drivePost(token, `/files/${fileId}/permissions?supportsAllDrives=true`, {
    role: "reader",
    type: "anyone",
  });
  return `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
}

export async function getDriveFileMeta(
  fileId: string
): Promise<{ thumbnailLink?: string; mimeType?: string }> {
  const token = await getAccessToken();
  const res = await fetch(
    `${DRIVE_API}/files/${fileId}?fields=thumbnailLink,mimeType,name&supportsAllDrives=true`,
    { headers: { Authorization: `Bearer ${token}`, ...NO_COMPRESS } }
  );
  if (!res.ok) throw new Error(`Meta-Abruf fehlgeschlagen: HTTP ${res.status}`);
  return res.json();
}

export async function downloadDriveFile(fileId: string): Promise<{ buffer: ArrayBuffer; mimeType: string }> {
  const token = await getAccessToken();
  const meta = await getDriveFileMeta(fileId);
  const res = await fetch(`${DRIVE_API}/files/${fileId}?alt=media&supportsAllDrives=true`, {
    headers: { Authorization: `Bearer ${token}`, ...NO_COMPRESS },
  });
  if (!res.ok) throw new Error(`Download fehlgeschlagen: HTTP ${res.status}`);
  return { buffer: await res.arrayBuffer(), mimeType: meta.mimeType ?? "application/octet-stream" };
}

export async function findOrCreateDriveFolder(parentId: string, name: string): Promise<string> {
  const token = await getAccessToken();
  const q = encodeURIComponent(
    `name='${name.replace(/'/g, "\\'")}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
  );
  const searchRes = await fetch(
    `${DRIVE_API}/files?q=${q}&fields=files(id)&supportsAllDrives=true&includeItemsFromAllDrives=true`,
    { headers: { Authorization: `Bearer ${token}`, ...NO_COMPRESS } }
  );
  if (searchRes.ok) {
    const data = (await searchRes.json()) as { files?: { id: string }[] };
    if (data.files?.length) return data.files[0].id;
  }
  const folder = await drivePost(token, "/files?supportsAllDrives=true&fields=id", {
    name,
    mimeType: "application/vnd.google-apps.folder",
    parents: [parentId],
  });
  return folder.id;
}

export async function updateDriveFile(
  fileId: string,
  options: { name?: string; addParents?: string; removeParents?: string }
): Promise<void> {
  const token = await getAccessToken();
  const params = new URLSearchParams({ supportsAllDrives: "true", fields: "id" });
  if (options.addParents) params.set("addParents", options.addParents);
  if (options.removeParents) params.set("removeParents", options.removeParents);
  const res = await fetch(`${DRIVE_API}/files/${fileId}?${params}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...NO_COMPRESS },
    body: JSON.stringify(options.name ? { name: options.name } : {}),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: `HTTP ${res.status}` } })) as { error?: { message?: string } };
    throw new Error(err?.error?.message ?? `Update fehlgeschlagen ${res.status}`);
  }
}

