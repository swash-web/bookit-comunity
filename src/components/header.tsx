import Link from "next/link";
import { getSession } from "@/lib/session";
import { UserRound, ArrowUpRight } from "lucide-react";

export async function Header() {
  const user = await getSession();
  const dashboard = user?.role === "ADMIN" ? "/admin" : user?.role === "SERVICE_PROVIDER" ? "/provider/dashboard" : "/dashboard";
  return <header className="sticky top-0 z-40 border-b border-black/[.06] bg-white/90 backdrop-blur-xl">
    <div className="shell flex h-[70px] items-center justify-between gap-4">
      <Link href="/" className="flex items-center gap-2.5" aria-label="BOOKIT home">
        <span className="grid h-9 w-9 place-items-center rounded-[13px] bg-[#17191c] text-sm font-black tracking-tight text-white">B.</span>
        <span className="text-[19px] font-bold tracking-[-.055em]">BOOKIT</span>
      </Link>
      <nav className="hidden items-center gap-7 md:flex">
        <Link className="nav-link" href="/services">Find a service</Link>
        <Link className="nav-link" href="/marketplace">Products & rentals</Link>
        <Link className="nav-link" href="/community">Community</Link>
        <Link className="nav-link" href="/#how-it-works">How it works</Link>
        <Link className="nav-link" href="/become-provider">Become a provider</Link>
      </nav>
      <div className="flex items-center gap-2">
        <Link className="text-xs font-semibold text-[#146c55] md:hidden" href="/community">Community</Link>
        {user ? <Link className="btn btn-secondary !px-3 !py-2.5" href={dashboard}><UserRound size={16}/><span className="hidden sm:inline">My account</span><ArrowUpRight size={14}/></Link> :
          <><Link className="hidden px-3 py-2 text-sm font-semibold sm:inline" href="/login">Sign in</Link><Link className="btn btn-primary !px-4 !py-2.5" href="/register">Get started <ArrowUpRight size={15}/></Link></>}
      </div>
    </div>
  </header>;
}
