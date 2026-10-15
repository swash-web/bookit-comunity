import { PrismaClient, Role, ApprovalStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();
async function main(){
 const categories=[
  ["Plumbing","plumbing","droplets"],["Carpentry","carpentry","hammer"],["Electrical","electrical","zap"],["Painting","painting","paintbrush"],["Cleaning","cleaning","sparkles"],["Repairs","repairs","wrench"],["Gardening","gardening","sprout"],["Mechanics","mechanics","car-front"],["Appliance Repair","appliance-repair","plug"],["Moving","moving","truck"]
 ];
 for(const [name,slug,icon] of categories)await prisma.serviceCategory.upsert({where:{slug},update:{name,icon},create:{name,slug,icon}});
 const demoPassword=process.env.DEMO_PASSWORD;
 if(!demoPassword||demoPassword.length<12){console.log("DEMO_PASSWORD not set to a 12+ character value; category seed completed, demo accounts skipped.");return;}
 const passwordHash=await bcrypt.hash(demoPassword,12);
 const admin=await prisma.user.upsert({where:{email:"admin@bookit.local"},update:{passwordHash},create:{name:"BOOKIT Demo Admin",email:"admin@bookit.local",passwordHash,role:Role.ADMIN}});
 const demoProviders=[
  {name:"Mola Plumbing",email:"plumber-demo@bookit.local",businessName:"Mola Plumbing & Repairs",bio:"Demo profile for residential plumbing, leak repairs, tap replacement, and water-system maintenance.",location:"Molyko, Buea",category:"Plumbing",title:"Home plumbing repairs",description:"Leak detection, tap installation, pipe repairs, and maintenance.",priceFrom:5000,quoteOnly:false},
  {name:"BrightWire Services",email:"electrician-demo@bookit.local",businessName:"BrightWire Electrical",bio:"Demo profile for electrical installation, lighting, socket repairs, and routine troubleshooting.",location:"Great Soppo, Buea",category:"Electrical",title:"Electrical repairs and installations",description:"Lighting, sockets, switches, and general electrical work.",priceFrom:null,quoteOnly:true},
  {name:"CraftWood Studio",email:"carpenter-demo@bookit.local",businessName:"CraftWood Carpentry",bio:"Demo profile for shelves, furniture repairs, custom woodwork, and fitting.",location:"Muea, Buea",category:"Carpentry",title:"Furniture and carpentry",description:"Custom shelves, furniture repairs, and woodwork.",priceFrom:null,quoteOnly:true}
 ];
 for(const p of demoProviders){
  const user=await prisma.user.upsert({where:{email:p.email},update:{passwordHash},create:{name:p.name,email:p.email,passwordHash,role:Role.SERVICE_PROVIDER}});
  const profile=await prisma.providerProfile.upsert({where:{userId:user.id},update:{businessName:p.businessName,bio:p.bio,location:p.location,approvalStatus:ApprovalStatus.APPROVED,approvedAt:new Date()},create:{userId:user.id,businessName:p.businessName,bio:p.bio,location:p.location,approvalStatus:ApprovalStatus.APPROVED,approvedAt:new Date()}});
  const category=await prisma.serviceCategory.findUniqueOrThrow({where:{name:p.category}});
  const existing=await prisma.providerService.findFirst({where:{providerId:profile.id}});
  const data={title:p.title,description:p.description,categoryId:category.id,priceFrom:p.priceFrom,quoteOnly:p.quoteOnly};
  if(existing)await prisma.providerService.update({where:{id:existing.id},data});else await prisma.providerService.create({data:{...data,providerId:profile.id}});
 }
 console.log("Seeded categories, demo admin, and demo providers. Demo records are illustrative.");
}
main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect());
