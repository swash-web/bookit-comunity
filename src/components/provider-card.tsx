import Link from "next/link";
import { MapPin, ArrowUpRight, Wrench } from "lucide-react";
import { initials } from "@/lib/format";

type Provider = { id: string; businessName: string | null; avatarUrl: string | null; bio: string; location: string; user: { name: string }; services: { title: string; category: { name: string }; priceFrom: number | null; quoteOnly: boolean }[]; portfolio: { imageUrl: string; title: string }[] };
export function ProviderCard({ provider }: { provider: Provider }) {
  const title = provider.businessName || provider.user.name;
  return <Link href={`/providers/${provider.id}`} className="card group overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-[0_14px_45px_rgba(20,30,25,.08)]">
    <div className="relative h-36 overflow-hidden bg-[#edf3f0]">
      {provider.portfolio[0]?.imageUrl ? <img src={provider.portfolio[0].imageUrl} alt={provider.portfolio[0].title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" /> : <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#eef5f1] to-[#e4e9e6]"><div className="grid h-16 w-16 place-items-center rounded-3xl border border-white/70 bg-white/80 text-xl font-bold text-[#146c55]">{initials(title)}</div></div>}
      <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-[10px] font-bold text-[#146c55]">✓ Approved provider</span><div className="absolute bottom-3 right-3 grid h-14 w-14 place-items-center overflow-hidden rounded-2xl border-2 border-white bg-white text-lg font-bold text-[#146c55] shadow-md">{provider.avatarUrl?<img src={provider.avatarUrl} alt={`${title} profile`} className="h-full w-full object-cover"/>:initials(title)}</div>
    </div>
    <div className="p-5">
      <div className="flex items-start justify-between gap-2"><div><h3 className="font-semibold tracking-[-.02em]">{title}</h3><p className="mt-1 flex items-center gap-1 text-xs text-[#747982]"><MapPin size={12}/>{provider.location}</p></div><ArrowUpRight size={17} className="text-[#969ba1] transition group-hover:text-[#146c55]"/></div>
      <p className="mt-3 line-clamp-2 min-h-[40px] text-sm leading-5 text-[#686d75]">{provider.bio || "Local professional ready to discuss your service needs."}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">{provider.services.slice(0, 2).map(s => <span key={s.title} className="badge">{s.category.name}</span>)}{!provider.services.length && <span className="badge"><Wrench size={11} className="mr-1"/> General services</span>}</div>
      <div className="mt-5 flex items-center justify-between border-t border-[#eff0f1] pt-4"><span className="text-xs text-[#777d84]">{provider.services.length} listed service{provider.services.length === 1 ? "" : "s"}</span><span className="text-sm font-semibold">{provider.services[0]?.quoteOnly || provider.services[0]?.priceFrom == null ? "Request a quote" : `From ${provider.services[0].priceFrom.toLocaleString("fr-FR")} FCFA`}</span></div>
    </div>
  </Link>;
}
