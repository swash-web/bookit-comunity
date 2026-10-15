import { NextRequest,NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
const schema=z.object({email:z.string().email(),password:z.string().min(1).max(128)});
export async function POST(req:NextRequest){try{const parsed=schema.safeParse(await req.json());if(!parsed.success)return NextResponse.json({error:"Enter a valid email and password."},{status:400});const user=await prisma.user.findUnique({where:{email:parsed.data.email.toLowerCase()}});if(!user||!(await bcrypt.compare(parsed.data.password,user.passwordHash)))return NextResponse.json({error:"Email or password is incorrect."},{status:401});await createSession({id:user.id,name:user.name,email:user.email,role:user.role});const redirect=user.role==="ADMIN"?"/admin":user.role==="SERVICE_PROVIDER"?"/provider/dashboard":"/dashboard";return NextResponse.json({ok:true,redirect});}catch(e){console.error("login error",e);return NextResponse.json({error:"Sign-in is temporarily unavailable."},{status:500});}}
