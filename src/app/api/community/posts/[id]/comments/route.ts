import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Sign in to comment." }, { status: 401 });
  const { id } = await context.params;
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Enter a comment." }, { status: 400 }); }
  const content = body && typeof body === "object" && "content" in body && typeof body.content === "string" ? body.content.trim() : "";
  if (content.length < 1 || content.length > 1000) return NextResponse.json({ error: "Comments must be 1–1,000 characters." }, { status: 400 });
  const post = await prisma.providerPost.findFirst({ where: { id, provider: { approvalStatus: "APPROVED" } }, select: { id: true } });
  if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });
  const comment = await prisma.postComment.create({ data: { postId: id, userId: user.id, content }, include: { user: { select: { name: true } } } });
  return NextResponse.json({ comment: { id: comment.id, content: comment.content, name: comment.user.name, createdAt: comment.createdAt } }, { status: 201 });
}
