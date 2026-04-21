"use client";

import { usePathname } from "next/navigation";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="relative flex flex-col min-h-full page-enter-content" style={{ zIndex: 1 }}>
      {children}
    </div>
  );
}
