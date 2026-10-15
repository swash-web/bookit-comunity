import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProviderCard } from "@/components/provider-card";

export const dynamic = "force-dynamic";
export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ q?: string; location?: string }> }) {
  const params = await searchParams;
  const q = (params.q || "").trim();
  const location = (params.location || "").trim();
  const providers = await prisma.providerProfile.findMany({
    where: { approvalStatus: "APPROVED", ...(location ? { location: { contains: location, mode: "insensitive" as const } } : {}), ...(q ? { OR: [{ businessName: { contains: q, mode: "insensitive" as const } }, { bio: { contains: q, mode: "insensitive" as const } }, { user: { name: { contains: q, mode: "insensitive" as const } } }, { services: { some: { OR: [{ title: { contains: q, mode: "insensitive" as const } }, { category: { name: { contains: q, mode: "insensitive" as const } } }] } } }] } : {}) },
    include: { user: { select: { name: true } }, services: { include: { category: true } }, portfolio: { take: 1, orderBy: { createdAt: "desc" } } },
    orderBy: { approvedAt: "desc" }
  });
  return <main className="shell min-h-[65vh] py-12 sm:py-16">
    <div className="max-w-2xl"><p className="eyebrow">BOOKIT directory</p><h1 className="mt-3 text-4xl font-semibold tracking-[-.06em] sm:text-5xl">Find the right person<br className="hidden sm:block"/> for the job.</h1><p className="mt-4 text-base leading-7 text-[#686d75]">Search approved local professionals by service, skill, or business name.</p></div>
    <form className="mt-8 grid gap-3 rounded-2xl border border-[#e7e8eb] bg-[#fafbfa] p-3 sm:grid-cols-[1fr_220px_auto]"><label className="flex items-center gap-3 rounded-xl border border-[#e4e6e5] bg-white px-3"><Search size={18} className="text-[#737982]"/><input name="q" defaultValue={q} placeholder="Plumber, carpenter, painting..." className="w-full bg-transparent py-3 text-sm outline-none"/></label><label className="flex items-center gap-3 rounded-xl border border-[#e4e6e5] bg-white px-3"><SlidersHorizontal size={17} className="text-[#737982]"/><input name="location" defaultValue={location} placeholder="Area (e.g. Molyko)" className="w-full bg-transparent py-3 text-sm outline-none"/></label><button className="btn btn-primary !rounded-xl">Search</button></form>
    <div className="mt-8 flex items-center justify-between"><p className="text-sm text-[#686d75]"><strong className="text-[#17191c]">{providers.length}</strong> approved provider{providers.length===1?"":"s"} found</p><Link href="/become-provider" className="text-sm font-semibold text-[#146c55]">Offer a service →</Link></div>
    {providers.length ? <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{providers.map(p=><ProviderCard key={p.id} provider={p}/>)}</div> : <div className="mt-6 rounded-3xl border border-dashed border-[#d7ddd9] p-10 text-center"><h2 className="text-lg font-semibold">No matching providers yet</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#686d75]">Try another keyword or location. If you provide services in Buea, you can apply to join BOOKIT.</p><Link href="/become-provider" className="btn btn-primary mt-5">Apply as a provider</Link></div>}
  </main>;
}
