export default function Footer() {
  return (
    <footer className="bg-primary text-on-primary py-10 px-4 md:px-10 mt-16">
      <div className="max-w-site mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="text-[18px] font-bold">Delar</span>
          <p className="text-xs text-white/60 leading-relaxed">
            The decentralised home for the creator economy.
          </p>
        </div>
        <p className="text-xs text-white/50">
          © 2026 Delar · Built on Sui · Powered by Walrus · Protected by Seal
        </p>
      </div>
    </footer>
  )
}
