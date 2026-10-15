import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
const plans = ["STARTER", "GROWTH", "BUSINESS"];
export async function GET() {
  const user = await requireRole("SERVICE_PROVIDER");
  if (!user) return NextResponse.json({ error: "Provider sign-in required." }, { status: 403 });
  const subscription = await prisma.subscription.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ subscription });
}
export async function POST(req: NextRequest) {
  const user = await requireRole("SERVICE_PROVIDER");
  if (!user) return NextResponse.json({ error: "Provider sign-in required." }, { status: 403 });
  let body: { plan?: string } = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Choose a plan." }, { status: 400 }); }
  if (!body.plan || !plans.includes(body.plan)) return NextResponse.json({ error: "Choose a valid plan." }, { status: 400 });
  // Preserve a live trial or paid period when a user selects a future plan.
  const current = await prisma.subscription.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  // Starter is a genuinely free tier, so it can be activated without payment.
  if (body.plan === "STARTER") {
    const subscription = current
      ? await prisma.subscription.update({ where: { id: current.id }, data: { plan: "STARTER", requestedPlan: null, status: "ACTIVE", trialEndsAt: null, currentPeriodEnd: null } })
      : await prisma.subscription.create({ data: { userId: user.id, plan: "STARTER", status: "ACTIVE" } });
    return NextResponse.json({ ok: true, subscription, message: "Your free Starter plan is active. You can upgrade whenever you are ready." });
  }
  const trialActive = current?.status === "TRIALING" && !!current.trialEndsAt && current.trialEndsAt > new Date();
  const paidActive = current?.status === "ACTIVE" && (!current.currentPeriodEnd || current.currentPeriodEnd > new Date());
  if (current && (trialActive || paidActive)) {
    const subscription = await prisma.subscription.update({ where: { id: current.id }, data: { requestedPlan: body.plan } });
    return NextResponse.json({ ok: true, subscription, message: trialActive ? "Plan preference saved. Your free trial remains active; paid activation will require a confirmed payment." : "Plan preference saved. Your current paid period remains active until a verified payment changes the plan." });
  }
  // Payment is intentionally not simulated; a real payment gateway must confirm payment before activation.
  const subscription = await prisma.subscription.create({ data: { userId: user.id, plan: body.plan, status: "PENDING_PAYMENT" } });
  return NextResponse.json({ ok: true, subscription, message: "Plan selected. Payment activation requires the configured payment gateway." }, { status: 201 });
}
