export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-6 py-16">
      <div className="max-w-3xl w-full">
        {/* Wordmark */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-gradient-to-br from-[#D4AF37] to-[#B8941F] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
              <span className="text-black font-bold text-xl">A</span>
            </div>
            <span className="text-2xl font-semibold tracking-tight">
              Aragon <span className="text-[#D4AF37]">Media</span>
            </span>
          </div>
        </div>

        {/* Hero */}
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
          The creator portal,<br />
          <span className="text-[#D4AF37]">rebuilt from scratch.</span>
        </h1>

        <p className="text-lg text-neutral-400 mb-10 max-w-2xl">
          One home for verification orders, commission tracking, and payouts.
          Private beta launching soon.
        </p>

        {/* Status strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-5">
            <div className="text-xs uppercase tracking-wider text-neutral-500 mb-2">Build status</div>
            <div className="text-sm font-medium">Foundation phase</div>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-5">
            <div className="text-xs uppercase tracking-wider text-neutral-500 mb-2">Infrastructure</div>
            <div className="text-sm font-medium text-[#4ade80]">$0 / month</div>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-5">
            <div className="text-xs uppercase tracking-wider text-neutral-500 mb-2">Next milestone</div>
            <div className="text-sm font-medium">Database + auth</div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-900 pt-6">
          <p className="text-sm text-neutral-600">
            © {new Date().getFullYear()} Aragon Media · Portal under active development
          </p>
        </div>
      </div>
    </main>
  );
}
