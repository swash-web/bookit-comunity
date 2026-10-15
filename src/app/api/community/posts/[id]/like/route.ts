import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Sign in to like updates." }, { status: 401 });
  const { id } = await context.params;
  const post = await prisma.providerPost.findFirst({ where: { id, provider: { approvalStatus: "APPROVED" } }, select: { id: true } });
  if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });
  const existing = await prisma.postLike.findUnique({ where: { postId_userId: { postId: id, userId: user.id } } });
  if (existing) await prisma.postLike.delete({ where: { id: existing.id } });
  else await prisma.postLike.create({ data: { postId: id, userId: user.id } });
  const likes = await prisma.postLike.count({ where: { postId: id } });
  return NextResponse.json({ liked: !existing, likes });
}
