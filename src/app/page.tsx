import Link from "next/link";
import { ArrowRight, ArrowUpRight, CheckCircle2, ShieldCheck, Search, Hammer, Zap, Droplets, Paintbrush, Sparkles, Wrench, Star, ClipboardCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProviderCard } from "@/components/provider-card";
export const dynamic="force-dynamic";

const categories = [
  { name: "Plumbing", icon: Droplets, desc: "Leaks, taps & installations" },
  { name: "Carpentry", icon: Hammer, desc: "Furniture & woodwork" },
  { name: "Electrical", icon: Zap, desc: "Repairs & installations" },
  { name: "Painting", icon: Paintbrush, desc: "Fresh finishes & touch-ups" },
  { name: "Cleaning", icon: Sparkles, desc: "Homes & workspaces" },
  { name: "Repairs", icon: Wrench, desc: "Everyday fixes" }
];
export default async function Home() {
  const providers = await prisma.providerProfile.findMany({ where: { approvalStatus: "APPROVED" }, include: { user: { select: { name: true } }, services: { include: { category: true } }, portfolio: { take: 1, orderBy: { createdAt: "desc" } } }, take: 3, orderBy: { approvedAt: "desc" } });
  return <main>
    <section className="hero-glow overflow-hidden">
      <div className="shell grid min-h-[590px] items-center gap-12 py-16 lg:grid-cols-[1.05fr_.95fr] lg:py-20">
        <div className="relative z-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#dcebe4] bg-white/80 px-3 py-2 text-xs font-semibold text-[#146c55]"><span className="h-2 w-2 rounded-full bg-[#299773]"/> Built for Buea, Cameroon</div>
          <h1 className="max-w-[650px] text-5xl font-semibold leading-[1.02] tracking-[-.07em] sm:text-6xl lg:text-[76px]">Good work starts with <span className="text-[#146c55]">the right person.</span></h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-[#626871]">Find skilled local professionals, shop useful products, and rent the things you need. One simple marketplace, built for Cameroon.</p>
          <form action="/services" className="mt-8 flex max-w-[550px] gap-2 rounded-2xl border border-[#e2e6e3] bg-white p-2 shadow-[0_12px_40px_rgba(20,40,30,.06)]">
            <Search className="ml-3 mt-3 shrink-0 text-[#777d84]" size={20}/><input name="q" placeholder="What do you need help with?" className="min-w-0 flex-1 bg-transparent px-1 text-sm outline-none" aria-label="Search services"/><button className="btn btn-primary !rounded-xl !px-5">Search <ArrowRight size={15}/></button>
          </form>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#6d737b]"><span className="flex items-center gap-1.5"><ShieldCheck size={15} className="text-[#146c55]"/> Admin-reviewed providers</span><span className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-[#146c55]"/> Clear service profiles</span></div>
        </div>
        <div className="relative mx-auto w-full max-w-[480px]">
          <div className="absolute -inset-8 rounded-[50%] bg-[#dceee5]/60 blur-3xl"/>
          <div className="relative rotate-[1deg] rounded-[32px] border border-white bg-white p-3 shadow-[0_28px_90px_rgba(24,48,36,.13)]">
            <div className="overflow-hidden rounded-[24px] bg-[#f4f6f5]">
              <div className="flex items-center justify-between border-b border-[#e5e8e6] bg-white px-5 py-4"><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#146c55]">Explore services</p><p className="mt-1 text-lg font-semibold tracking-tight">Find your person.</p></div><span className="grid h-10 w-10 place-items-center rounded-full bg-[#eef5f1] text-[#146c55]"><Search size={18}/></span></div>
              <div className="grid grid-cols-2 gap-3 p-4">
                {categories.slice(0,4).map((c,i)=>{const Icon=c.icon;return <Link key={c.name} href={`/services?q=${encodeURIComponent(c.name)}`} className={`rounded-2xl border border-[#e7e9e8] p-4 transition hover:bg-white ${i===0?"bg-white":"bg-[#fafbfa]"}`}><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e7f2ec] text-[#146c55]"><Icon size={19}/></span><p className="mt-4 text-sm font-semibold">{c.name}</p><p className="mt-1 text-[11px] leading-4 text-[#7a8087]">{c.desc}</p></Link>})}
              </div>
              <div className="mx-4 mb-4 flex items-center gap-3 rounded-2xl border border-[#e3e7e4] bg-white p-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-[#eaf2ed] text-xs font-bold text-[#146c55]">BK</div><div className="flex-1"><p className="text-xs font-semibold">Profiles reviewed before listing</p><p className="mt-1 text-[10px] text-[#7a8087]">A more confident way to choose.</p></div><ShieldCheck size={18} className="text-[#146c55]"/></div>
            </div>
          </div>
          <div className="absolute -bottom-6 -left-5 hidden rounded-2xl border border-[#e5e9e6] bg-white px-4 py-3 shadow-lg sm:block"><div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#e8f4ed] text-[#146c55]"><ClipboardCheck size={16}/></span><div><p className="text-xs font-semibold">Reviewed profiles</p><p className="text-[10px] text-[#7a8087]">Approval before discovery</p></div></div></div>
        </div>
      </div>
    </section>
    <section className="shell py-16 sm:py-20">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="eyebrow">Find your service</p><h2 className="mt-3 text-3xl font-semibold tracking-[-.055em] sm:text-4xl">Help for the things<br className="hidden sm:block"/> that need doing.</h2></div><Link href="/services" className="inline-flex items-center gap-2 text-sm font-semibold text-[#146c55]">Explore all services <ArrowUpRight size={16}/></Link></div>
      <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{categories.map(c=>{const Icon=c.icon;return <Link key={c.name} href={`/services?q=${encodeURIComponent(c.name)}`} className="group rounded-2xl border border-[#e7e8eb] p-4 transition hover:-translate-y-1 hover:border-[#b7d5c8] hover:bg-[#f8fbf9]"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#edf5f0] text-[#146c55] transition group-hover:bg-[#dcefe5]"><Icon size={20}/></span><p className="mt-4 text-sm font-semibold">{c.name}</p><p className="mt-1 text-xs leading-5 text-[#737982]">{c.desc}</p></Link>})}</div>
    </section>
    <section className="bg-[#f7f8f7] py-16 sm:py-20">
      <div className="shell"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="eyebrow">Meet local professionals</p><h2 className="mt-3 text-3xl font-semibold tracking-[-.055em] sm:text-4xl">Skilled people. Real work.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-[#686d75]">Browse profiles that have been reviewed by the BOOKIT team before appearing publicly.</p></div><Link href="/services" className="btn btn-secondary">Browse providers <ArrowRight size={15}/></Link></div>
      {providers.length ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{providers.map(p=><ProviderCard key={p.id} provider={p}/>)}</div> : <div className="mt-8 rounded-3xl border border-dashed border-[#d7ddd9] bg-white p-10 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#edf5f0] text-[#146c55]"><Star size={20}/></div><h3 className="mt-4 text-lg font-semibold">Your local directory starts here.</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#686d75]">Approved provider profiles will appear here. Register as a provider to submit your application or use the demo seed data for a presentation.</p><Link href="/become-provider" className="btn btn-primary mt-5">Become a provider <ArrowRight size={15}/></Link></div>}
      </div>
    </section>
    <section className="shell py-10 sm:py-14"><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{[{href:"/services",title:"Book a service",text:"Find reviewed local professionals for everyday work.",label:"Services",symbol:"01"},{href:"/marketplace?type=PRODUCT",title:"Shop local products",text:"Explore products from local sellers and small businesses.",label:"Products",symbol:"02"},{href:"/marketplace?type=RENTAL",title:"Rent what you need",text:"Discover equipment, tools and event essentials for hire.",label:"Rentals",symbol:"03"},{href:"/community",title:"Community updates",text:"See recent work, deliveries, photos and provider updates.",label:"Community",symbol:"04"}].map(item=><Link href={item.href} key={item.symbol} className="group rounded-3xl border border-[#e7e8eb] p-6 transition hover:-translate-y-1 hover:border-[#b7d5c8] hover:bg-[#fafcfb]"><p className="text-xs font-bold tracking-[.14em] text-[#146c55]">{item.label} · {item.symbol}</p><h3 className="mt-4 text-xl font-semibold tracking-tight">{item.title}</h3><p className="mt-2 text-sm leading-6 text-[#686d75]">{item.text}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">Explore <ArrowRight size={15}/></span></Link>)}</div></section>
    <section id="how-it-works" className="shell py-16 sm:py-20"><div className="max-w-2xl"><p className="eyebrow">Simple by design</p><h2 className="mt-3 text-3xl font-semibold tracking-[-.055em] sm:text-4xl">A better way to get things done.</h2></div><div className="mt-9 grid gap-4 md:grid-cols-3">{[{n:"01",title:"Find the right fit",text:"Search by service, browse provider profiles, and review skills and examples of previous work."},{n:"02",title:"Send a request",text:"Describe what you need, where you need it, and when you would like the work done."},{n:"03",title:"Connect with confidence",text:"The provider responds to your request so you can discuss scope, timing, and price directly."}].map(x=><div key={x.n} className="rounded-3xl border border-[#e7e8eb] p-6 sm:p-7"><p className="text-sm font-bold text-[#146c55]">{x.n}</p><h3 className="mt-6 text-xl font-semibold tracking-tight">{x.title}</h3><p className="mt-3 text-sm leading-6 text-[#686d75]">{x.text}</p></div>)}</div></section>
    <section className="shell pb-10"><div className="overflow-hidden rounded-[28px] bg-[#17191c] px-6 py-10 text-white sm:px-10 sm:py-12"><div className="grid gap-7 sm:grid-cols-[1fr_auto] sm:items-center"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-[#a8d5c0]">For skilled professionals</p><h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-[-.05em] sm:text-4xl">Your skills deserve to be seen.</h2><p className="mt-3 max-w-lg text-sm leading-6 text-white/65">Create a profile, showcase your work, and reach people looking for the services you provide. Profiles go live after review.</p></div><Link href="/become-provider" className="btn !bg-white !text-[#17191c]">Join as a provider <ArrowRight size={15}/></Link></div></div></section>
  </main>;
}
