import Link from "next/link";
export function Footer() {
  return <footer className="mt-20 border-t border-[#e7e8eb] bg-[#fafbfb]">
    <div className="shell grid gap-8 py-10 sm:grid-cols-[1fr_auto] sm:items-center">
      <div><Link href="/" className="text-lg font-bold tracking-[-.05em]">BOOKIT<span className="text-[#146c55]">.</span></Link><p className="mt-2 max-w-md text-sm leading-6 text-[#686d75]">Find a service. Book with confidence. Connecting people in Buea with skilled local professionals.</p><p className="mt-4 text-xs text-[#8a8e95]">© 2026 BOOKIT. All rights reserved.</p></div>
      <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm text-[#686d75]"><Link href="/services">Find a service</Link><Link href="/become-provider">For providers</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/contact">Contact</Link></div>
    </div>
  </footer>;
}
