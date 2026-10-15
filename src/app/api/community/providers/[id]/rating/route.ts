import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await requireRole("CUSTOMER");
  if (!user) return NextResponse.json({ error: "Sign in with a customer account to rate a provider." }, { status: 401 });
  const { id } = await context.params;
  let body: { rating?: unknown; comment?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Choose a rating from 1 to 5." }, { status: 400 }); }
  const rating = Number(body.rating);
  const comment = typeof body.comment === "string" ? body.comment.trim().slice(0, 500) : "";
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return NextResponse.json({ error: "Choose a rating from 1 to 5." }, { status: 400 });
  const provider = await prisma.providerProfile.findFirst({ where: { id, approvalStatus: "APPROVED" }, select: { id: true } });
  if (!provider) return NextResponse.json({ error: "Provider not found." }, { status: 404 });
  await prisma.providerRating.upsert({ where: { providerId_userId: { providerId: id, userId: user.id } }, create: { providerId: id, userId: user.id, rating, comment }, update: { rating, comment } });
  const aggregate = await prisma.providerRating.aggregate({ where: { providerId: id }, _avg: { rating: true }, _count: { rating: true } });
  return NextResponse.json({ ok: true, rating, averageRating: aggregate._avg.rating, ratingCount: aggregate._count.rating });
}
