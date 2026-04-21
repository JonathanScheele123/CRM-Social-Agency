import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-divider/50 py-4 px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted">
        <span>© {new Date().getFullYear()} Jonathan Scheele · JS Media</span>
        <div className="flex items-center gap-4">
          <Link href="/impressum" className="hover:text-fg transition-colors">Impressum</Link>
          <Link href="/agb" className="hover:text-fg transition-colors">AGB</Link>
          <Link href="/datenschutz" className="hover:text-fg transition-colors">Datenschutz</Link>
        </div>
      </div>
    </footer>
  );
}
