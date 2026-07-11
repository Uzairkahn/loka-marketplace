export default function Footer() {
  return (
    <footer className="border-t border-white/5 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-ink-faint sm:flex-row">
        <p>© {new Date().getFullYear()} Loka. Built for local communities.</p>
        <p className="font-mono">Loka Marketplace Platform</p>
      </div>
    </footer>
  );
}
