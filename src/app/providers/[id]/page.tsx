import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, ShieldCheck, ArrowLeft, ImageIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { money } from "@/lib/format";
import { RequestForm } from "@/components/request-form";

export const dynamic = "force-dynamic";
export default async function ProviderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const provider = await prisma.providerProfile.findFirst({ where: { id, approvalStatus: "APPROVED" }, include: { user: { select: { name: true } }, services: { include: { category: true } }, portfolio: { orderBy: { createdAt: "desc" } }, reviews: true } });
  if (!provider) notFound();
  const user = await getSession();
  return <main className="shell min-h-[65vh] py-10 sm:py-14">
    <Link href="/services" className="inline-flex items-center gap-2 text-sm text-[#686d75]"><ArrowLeft size={15}/> All providers</Link>
    <div className="mt-6 grid items-start gap-8 lg:grid-cols-[1fr_350px]">
      <div>
        <div className="rounded-[28px] border border-[#e7e8eb] bg-[#f5f7f5] p-7 sm:p-10">
          <span className="badge bg-[#e4f2ea] text-[#146c55]"><ShieldCheck size={12} className="mr-1"/> Approved profile</span>{provider.providerKind==="TRANSPORT"&&<span className="ml-2 inline-flex rounded-full bg-[#eaf0ff] px-3 py-1 text-xs font-semibold text-[#3154a4]">{provider.transportPartnerType==="AGENCY"?"Transport agency":"Independent transport agent"}</span>}
          <div className="mt-5 flex items-center gap-4"><div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white text-xl font-bold text-[#146c55]">{provider.avatarUrl?<img src={provider.avatarUrl} alt="Provider profile" className="h-full w-full object-cover"/>:(provider.businessName||provider.user.name).split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase()}</div><h1 className="text-4xl font-semibold tracking-[-.06em]">{provider.businessName || provider.user.name}</h1></div>
          <p className="mt-3 flex items-center gap-1.5 text-sm text-[#686d75]"><MapPin size={15}/>{provider.location}, Cameroon</p>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#525861]">{provider.bio || "Contact this provider to discuss your service requirements."}</p>
          <div className="mt-6 flex flex-wrap gap-2">{provider.services.map(s=><span key={s.id} className="badge bg-white">{s.category.name}</span>)}</div>
        </div>
        <section className="mt-8"><h2 className="text-xl font-semibold tracking-tight">Services offered</h2>{provider.services.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{provider.services.map(s=><div key={s.id} className="rounded-2xl border border-[#e7e8eb] p-5"><p className="text-xs font-semibold text-[#146c55]">{s.category.name}</p><h3 className="mt-2 font-semibold">{s.title}</h3><p className="mt-2 text-sm leading-6 text-[#686d75]">{s.description}</p><p className="mt-4 text-sm font-semibold">{s.quoteOnly ? "Request a quote" : money(s.priceFrom)}</p></div>)}</div> : <p className="mt-3 text-sm text-[#686d75]">No individual services listed yet. You can still send a request below.</p>}</section>
        <section className="mt-8"><h2 className="text-xl font-semibold tracking-tight">Previous work</h2>{provider.portfolio.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{provider.portfolio.map(item=><div key={item.id} className="overflow-hidden rounded-2xl border border-[#e7e8eb]"><img src={item.imageUrl} alt={item.title} className="h-48 w-full object-cover"/><div className="p-4"><p className="font-semibold">{item.title}</p><p className="mt-1 text-sm text-[#686d75]">{item.description}</p></div></div>)}</div> : <div className="mt-4 rounded-2xl border border-dashed border-[#d7ddd9] p-7 text-sm text-[#686d75]"><ImageIcon className="mb-2" size={20}/>Portfolio examples will appear here when this provider adds them.</div>}</section>
      </div>
      <aside className="lg:sticky lg:top-24"><div className="rounded-[24px] border border-[#e7e8eb] p-5 shadow-[0_12px_35px_rgba(20,30,25,.04)]"><h2 className="text-lg font-semibold">Request this service</h2><p className="mt-2 text-sm leading-6 text-[#686d75]">Describe what you need. The provider can respond to discuss the details and price.</p>{user?.role === "CUSTOMER" ? <RequestForm providerId={provider.id} services={provider.services.map(s=>s.title)}/> : user ? <p className="mt-5 rounded-xl bg-[#f6f7f8] p-3 text-sm text-[#686d75]">Sign in with a customer account to submit a request.</p> : <Link href={`/login?next=${encodeURIComponent(`/providers/${provider.id}`)}`} className="btn btn-primary mt-5 w-full">Sign in to request</Link>}<p className="mt-4 text-xs leading-5 text-[#8a8e95]">BOOKIT does not process payments in this MVP. Agree on the scope and price directly with the provider.</p></div></aside>
    </div>
  </main>;
}
