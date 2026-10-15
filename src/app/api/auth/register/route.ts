import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

const schema = z.object({
  name: z.string().trim().min(2).max(80), email: z.string().trim().email().max(254), password: z.string().min(8).max(128),
  phone: z.string().trim().max(30).optional().default(""), role: z.enum(["CUSTOMER", "SERVICE_PROVIDER"]),
  providerKind: z.enum(["SERVICE", "PRODUCT", "RENTAL", "TRANSPORT"]).optional().default("SERVICE"),
  transportPartnerType: z.enum(["AGENCY", "INDEPENDENT_AGENT"]).optional(),
  vehicleDetails: z.string().trim().max(120).optional().default(""), serviceCoverage: z.string().trim().max(160).optional().default(""),
  businessName: z.string().trim().max(100).optional().default(""), serviceTitle: z.string().trim().max(120).optional().default(""),
  category: z.string().trim().max(80).optional().default(""), location: z.string().trim().max(100).optional().default("Buea"),
  bio: z.string().trim().max(1000).optional().default(""), imageUrl: z.string().url().optional().or(z.literal("")).default(""),
  listingPrice: z.preprocess(value => value === "" || value === undefined ? undefined : value, z.coerce.number().int().min(0).max(100000000).optional()), priceUnit: z.enum(["item","hour","day","week","month","event","night","trip"]).optional().default("item")
});
function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "general-services"; }
export async function POST(req: NextRequest) {
 try {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Check your details and try again. Passwords must be at least 8 characters." }, { status: 400 });
  const d = parsed.data;
  if (d.role === "SERVICE_PROVIDER" && (!d.phone || !d.businessName || d.serviceTitle.length < 2 || d.category.length < 2 || d.location.length < 2 || d.bio.length < 20 || (d.providerKind === "TRANSPORT" && (!d.vehicleDetails || d.vehicleDetails.length < 3 || !d.serviceCoverage || d.serviceCoverage.length < 2)))) return NextResponse.json({ error: "Complete all required provider application fields." }, { status: 400 });
  if (d.role === "SERVICE_PROVIDER" && (d.providerKind === "PRODUCT" || d.providerKind === "RENTAL") && d.listingPrice === undefined) return NextResponse.json({ error: "Enter a price for your first listing." }, { status: 400 });
  const normalized = d.email.toLowerCase();
  if (await prisma.user.findUnique({ where: { email: normalized } })) return NextResponse.json({ error: "An account with this email already exists. Try signing in instead." }, { status: 409 });
  const passwordHash = await bcrypt.hash(d.password, 12);
  const user = await prisma.$transaction(async tx => {
   const created = await tx.user.create({ data: { name: d.name, email: normalized, passwordHash, phone: d.phone || null, role: d.role,
    ...(d.role === "SERVICE_PROVIDER" ? { provider: { create: { businessName: d.businessName, providerKind: d.providerKind, transportPartnerType: d.providerKind === "TRANSPORT" ? (d.transportPartnerType || "INDEPENDENT_AGENT") : null, bio: d.bio, location: d.location || "Buea", approvalStatus: "PENDING" } } } : {}) }, select: { id: true, name: true, email: true, role: true } });
   if (d.role === "SERVICE_PROVIDER") {
    await tx.subscription.create({ data: { userId: created.id, plan: "TRIAL", status: "TRIALING", trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) } });
    const profile = await tx.providerProfile.findUniqueOrThrow({ where: { userId: created.id } });
    if (d.providerKind === "SERVICE" || d.providerKind === "TRANSPORT") {
     const categorySlug = slugify(d.category);
     let category = await tx.serviceCategory.findFirst({ where: { OR: [{ slug: categorySlug }, { name: { equals: d.category, mode: "insensitive" } }] } });
     if (!category) category = await tx.serviceCategory.create({ data: { name: d.category, slug: categorySlug } });
     const transportDescription = d.providerKind === "TRANSPORT" ? `${d.bio}\n\nVehicle and capacity: ${d.vehicleDetails}.\nService coverage: ${d.serviceCoverage}. Rate unit: ${d.priceUnit || "trip"}. Starting rate: ${d.listingPrice === undefined ? "quote required" : `${d.listingPrice} FCFA`}.` : d.bio;
     await tx.providerService.create({ data: { providerId: profile.id, categoryId: category.id, title: d.serviceTitle, description: transportDescription, priceFrom: d.listingPrice, quoteOnly: d.listingPrice === undefined } });
     if (d.imageUrl && d.providerKind === "SERVICE") await tx.portfolioItem.create({ data: { providerId: profile.id, title: "Previous work", imageUrl: d.imageUrl, description: "Submitted with provider application." } });
    } else {
     await tx.marketplaceListing.create({ data: { providerId: profile.id, type: d.providerKind, title: d.serviceTitle, description: d.bio, category: d.category, location: d.location || "Buea", price: d.listingPrice ?? 0, priceUnit: d.providerKind === "PRODUCT" ? "item" : d.priceUnit, imageUrl: d.imageUrl || null, available: true } });
    }
   }
   return created;
  });
  await createSession(user);
  return NextResponse.json({ ok: true, redirect: d.role === "SERVICE_PROVIDER" ? "/provider/pending" : "/dashboard" }, { status: 201 });
 } catch (e) { console.error("register error", e); return NextResponse.json({ error: "Registration is temporarily unavailable. Check that the database is configured and its schema is up to date." }, { status: 500 }); }
}
