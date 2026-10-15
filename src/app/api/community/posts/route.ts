import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/session";

export const runtime = "nodejs";
export async function GET() {
  try {
    const session = await getSession();
    const posts = await prisma.providerPost.findMany({
      where: { provider: { approvalStatus: "APPROVED" } },
      orderBy: { createdAt: "desc" }, take: 60,
      include: {
        provider: { include: { user: { select: { id: true, name: true } }, ratings: { where: session ? { userId: session.id } : { id: "__no_signed_in_user__" }, select: { rating: true } }, _count: { select: { ratings: true } } } },
        _count: { select: { likes: true, comments: true } },
        likes: { where: session ? { userId: session.id } : { id: "__no_signed_in_user__" }, select: { id: true } },
        comments: { orderBy: { createdAt: "desc" }, take: 3, include: { user: { select: { name: true } } } }
      }
    });
    const providerIds = [...new Set(posts.map(p => p.provider.id))];
    const aggregates = providerIds.length ? await prisma.providerRating.groupBy({ by: ["providerId"], where: { providerId: { in: providerIds } }, _avg: { rating: true }, _count: { rating: true } }) : [];
    const ratingsByProvider = new Map(aggregates.map(a => [a.providerId, { average: a._avg.rating, count: a._count.rating }]));
    return NextResponse.json({ posts: posts.map(p => ({ id: p.id, content: p.content, imageUrl: p.imageUrl, origin: p.origin, destination: p.destination, category: p.category, createdAt: p.createdAt, provider: { id: p.provider.id, name: p.provider.businessName || p.provider.user.name, avatarUrl: p.provider.avatarUrl, providerKind: p.provider.providerKind, transportPartnerType: p.provider.transportPartnerType, location: p.provider.location, averageRating: ratingsByProvider.get(p.provider.id)?.average ?? null, ratingCount: ratingsByProvider.get(p.provider.id)?.count ?? 0, userRating: p.provider.ratings[0]?.rating ?? null }, likes: p._count.likes, commentsCount: p._count.comments, liked: p.likes.length > 0, comments: p.comments.map(c => ({ id: c.id, content: c.content, name: c.user.name, createdAt: c.createdAt })) })) });
  } catch (e) { console.error("community feed", e); return NextResponse.json({ error: "The community feed is temporarily unavailable." }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  const user = await requireRole("SERVICE_PROVIDER");
  if (!user) return NextResponse.json({ error: "Sign in with a provider account to post updates." }, { status: 403 });
  try {
    const profile = await prisma.providerProfile.findUnique({ where: { userId: user.id } });
    if (!profile || profile.approvalStatus !== "APPROVED") return NextResponse.json({ error: "Your provider profile must be approved before posting." }, { status: 403 });
    let subscription = await prisma.subscription.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
    if (!subscription) subscription = await prisma.subscription.create({ data: { userId: user.id, plan: "TRIAL", status: "TRIALING", trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) } });
    const trialValid = subscription.status === "TRIALING" && !!subscription.trialEndsAt && subscription.trialEndsAt > new Date();
    if (!trialValid && subscription.status !== "ACTIVE") return NextResponse.json({ error: "Your free trial has ended or your subscription is not active. Visit Subscription to choose a plan." }, { status: 402 });
    const body = await req.json();
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const imageUrl = typeof body.imageUrl === "string" && body.imageUrl.trim() ? body.imageUrl.trim() : null;
    const origin = typeof body.origin === "string" ? body.origin.trim().slice(0, 100) || null : null;
    const destination = typeof body.destination === "string" ? body.destination.trim().slice(0, 100) || null : null;
    const category = typeof body.category === "string" && ["UPDATE", "DELIVERY", "PROJECT", "ANNOUNCEMENT"].includes(body.category) ? body.category : "UPDATE";
    if (content.length < 3 || content.length > 2000) return NextResponse.json({ error: "Write an update between 3 and 2,000 characters." }, { status: 400 });
    if (imageUrl) { try { const u = new URL(imageUrl); if (!['http:', 'https:'].includes(u.protocol)) throw new Error(); } catch { return NextResponse.json({ error: "Choose a valid image URL." }, { status: 400 }); } }
    const post = await prisma.providerPost.create({ data: { providerId: profile.id, content, imageUrl, origin, destination, category } });
    return NextResponse.json({ ok: true, id: post.id }, { status: 201 });
  } catch (e) { console.error("community post create", e); return NextResponse.json({ error: "Could not publish this update. Please try again." }, { status: 500 }); }
}
