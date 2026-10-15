# BOOKIT MVP

A full-stack, mobile-first service-provider discovery and request platform for Buea, Cameroon. Built with Next.js App Router, TypeScript, Tailwind CSS, Prisma, PostgreSQL, and signed HTTP-only session cookies.

## Current MVP capabilities

- Public marketing page and approved-provider directory
- Customer and provider registration/login for services, products, rentals, and transport agencies or independent transport agents
- Server-side role checks and secure password hashing
- Provider application status: pending, approved, rejected; applications include business name, offering type, contact phone, category, area, description, and optional listing/portfolio image URL. Transport applications include partner type, vehicle/capacity, coverage area, and optional starting rate
- Admin review dashboard for provider applications
- Provider profile, primary service listing, portfolio URL management, and provider dashboard shortcuts to marketplace listings
- Optional image uploads through Supabase Storage
- Customer service requests and request history
- Provider accept/decline/complete workflow
- Marketplace registration can create a first product or rental listing that remains hidden until the provider is approved
- Seed script for categories and clearly illustrative demo profiles
- Vercel-compatible deployment structure

## Requirements

- Node.js 20.9 or newer
- PostgreSQL database (Neon is the recommended option for this deployment; Supabase PostgreSQL is also possible)
- npm

## Local setup

1. Copy `.env.example` to `.env`.
2. Create a PostgreSQL database and set `DATABASE_URL`.
3. Set `SESSION_SECRET` to a unique random string of at least 32 characters.
4. Install packages and generate Prisma client:

   ```bash
   npm install
   npx prisma generate
   ```

5. For a fresh local development database, create a migration with `npx prisma migrate dev --name init`. If connecting to the existing Neon database for this MVP, back it up and apply the current schema with `npx prisma db push` instead. Do not run both against a database without first checking its current schema.

6. (Optional) To seed demo providers and a demo admin, set `DEMO_PASSWORD` to a unique password of at least 12 characters in your shell environment, then run:

   ```bash
   npm run db:seed
   ```

   The seed script uses `admin@bookit.local`, `plumber-demo@bookit.local`, `electrician-demo@bookit.local`, and `carpenter-demo@bookit.local`. Their password is the value you supplied as `DEMO_PASSWORD`. Do not use these accounts or this password on a public deployment. Delete demo accounts and records before real launch, or use a private pitch database.

7. Start the development server:

   ```bash
   npm run dev
   ```

8. Open `http://localhost:3000`.

## Environment variables

- `DATABASE_URL`: PostgreSQL connection string.
- `SESSION_SECRET`: secret for signing the HTTP-only session cookie; use a long random value.
- `NEXT_PUBLIC_APP_URL`: canonical app URL.
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`: optional server-side image storage. Never expose the service-role key to client code.

## Recommended deployment: Vercel + Neon

Use Vercel for the Next.js app and Neon for PostgreSQL. Do not use both Neon CLI deployment and Vercel app deployment as if they were the same step: deploy the web app from GitHub to Vercel, and manage the database in Neon.

### Step-by-step deployment

1. **Back up your Neon database first.** Open the correct Neon project/branch and confirm it is the database you intend BOOKIT to use.
2. **Update the schema.** From the project root on a computer with Node.js installed, configure `DATABASE_URL` locally using the Neon connection string, then run `npx prisma db push`. This applies the current Prisma schema, including transport, community, ratings, profile photo, and subscription tables. Never paste secrets into chat or commit `.env` files.
3. **Run locally before deploying.** Run `npm install`, then `npx prisma generate`, then `npm run build`. If the build fails, fix the first reported error before deploying. To test locally, set `SESSION_SECRET` to a random secret of at least 32 characters and `NEXT_PUBLIC_APP_URL=http://localhost:3000`, then run `npm run dev`.
4. **Push the source to GitHub.** Commit the updated project folder, excluding `.env`, `node_modules`, `.next`, and local secrets. Confirm `package.json`, `prisma/schema.prisma`, and `src/` are in the repository root (inside the project folder).
5. **Import to Vercel.** In Vercel, choose Add New → Project → import the BOOKIT GitHub repository. Use the project root containing `package.json`; Framework Preset should be Next.js. The package build command is `npm run build`. Apply the schema to the same Neon database before deploying; for a ZIP-based MVP deployment, use `npx prisma generate && npx prisma db push && npm run build` only after backing up the database and confirming the Vercel `DATABASE_URL` is the intended database.
6. **Add Vercel environment variables** under Project → Settings → Environment Variables, for Production and Preview as needed:
   - `DATABASE_URL`: the Neon pooled/runtime connection string recommended by Neon for serverless apps.
   - `SESSION_SECRET`: a long random secret, at least 32 characters; use a different value from any development secret.
   - `NEXT_PUBLIC_APP_URL`: the actual deployed Vercel URL, for example `https://your-project.vercel.app` (replace with your real URL).
   - Optional Supabase Storage variables only if you configure image storage.
7. **Deploy.** Click Deploy or push a new commit. Wait for the build to finish. If it fails, open the Vercel build log and fix the first real error; do not keep changing database settings blindly.
8. **Create/verify the administrator.** A normal signup cannot create an admin. Use a private one-time seed or controlled database procedure. If using the included seed script, set a unique `DEMO_PASSWORD` of at least 12 characters privately and run `npm run db:seed` against the intended database. Never use demo accounts/passwords on a public site; do not publish credentials in the README, GitHub, or pitch slides.
9. **Test the live deployment** in a private/incognito window: create a customer account; sign out and sign in; register one service provider; register one product seller; register one rental provider; register both a transport agency and an independent transport agent; confirm all provider applications are pending; sign in as admin and approve a test provider; confirm only approved offerings appear publicly; submit a test service request and marketplace request. Also test on a phone.
10. **Only then share the URL.** For a pitch, use a small set of real providers who explicitly consent to being listed. Keep transport documents private and verify them manually before approving providers; this app does not yet perform automated ID, insurance, or vehicle-permit checks.

### Deploy to Vercel (overview)

1. Push this project to a GitHub repository.
2. Import that repository in Vercel.
3. Configure `DATABASE_URL`, `SESSION_SECRET`, and `NEXT_PUBLIC_APP_URL` in Vercel Project Settings → Environment Variables.
4. Provision PostgreSQL and run migrations against it before presenting the app. For a release pipeline, run `npx prisma migrate deploy` as a controlled deployment step, not on every request.
5. Deploy, then verify registration, login, provider approval, public search, and service request workflows against the deployed database.
6. If enabling image upload, create a Supabase Storage bucket named `bookit-portfolio` (or set another bucket name), configure public read access for portfolio images, and add the server-side storage environment variables.
7. Configure a real administrator securely. For a pitch database, run the seed script with a private, strong `DEMO_PASSWORD`; do not publish the password. For production, create the initial admin with a controlled one-time script or manually elevate a verified user through a secure database operation, then remove any setup path.

## Important security notes before public launch

- The admin role is never accepted from public registration.
- Provider records are only discoverable when their approval status is `APPROVED`.
- API routes enforce roles and record ownership on the server.
- Session cookie is HTTP-only, SameSite=Lax, and Secure in production.
- Review the threat model, add rate limiting, email verification, password reset, CSRF review for state-changing routes, monitoring, backup/restore tests, and a full privacy policy before real production use.
- Provider approval is not a guarantee of professional competence. Establish a transparent verification process.
- Terms/privacy pages are MVP placeholders and require local legal review before public launch.
- The MVP does not collect online payments.
- Demo accounts and demo data are for a controlled pitch environment only.
- Never share the Supabase service-role key or database credentials with users or judges.

## Known limitations

- One primary service listing per provider is edited in the initial UI, although the database supports multiple.
- Provider profile photos and community post photos use the Supabase Storage upload endpoint; image uploads require the bucket and server-side storage environment variables.
- Service-request reviews remain in the existing schema; the community adds customer provider ratings. Rating submissions are limited to signed-in customer accounts.
- Admin can approve/reject applications; a full user moderation interface and category CRUD screen remain future work.
- Request status forms use server POST endpoints and redirect back to the provider dashboard.
- The project has not been deployed from this workspace. Configure credentials, install dependencies, run migrations, and verify the production build before sharing the URL.

## Marketplace schema update (provider listings and bookings)

The current version adds `ProviderProfile.providerKind` (default `SERVICE`) to distinguish service providers from product sellers and rental providers. Apply the schema update to the same PostgreSQL database before deploying the new build. Existing providers automatically receive the default value.

The marketplace models (`MarketplaceListing` and `MarketplaceRequest`) are defined in `prisma/schema.prisma`. The Vercel build runs `prisma generate` before `next build`, so the generated Prisma client includes these models.

Before using the marketplace against your production PostgreSQL database, apply the schema update against the same `DATABASE_URL` configured in Vercel. From a trusted local terminal, with that environment variable set, run:

```bash
npx prisma db push
```

After applying the schema update, redeploy the application. Verify `/api/health`, customer registration/login, provider registration for all three offering types, admin approval, and marketplace listing visibility. A provider application review is not the same as government-ID KYC verification. Do not collect identity document images or full ID numbers until a private document-storage and restricted reviewer-access flow has been configured.

Review the target database and back it up before applying schema changes. Do not expose `DATABASE_URL` in client-side code or commit real secrets to GitHub.

## Neon project setup

The repository includes `neon.ts` using the requested Neon Config entry point. To link and deploy it, run these commands in an authenticated terminal with network access:

```bash
npm i -g neon@latest
neon login
neon skills -y
neon mcp -y
neon link --project-id quiet-sea-15783546 --branch production -y
neon config init
```

After `neon config init`, ensure `neon.ts` contains:

```ts
import { defineConfig } from "@neon/config/v1";

export default defineConfig({});
```

Then run `neon deploy`. The Neon CLI login/link/deploy steps require access to the Neon account and cannot be completed without successful authentication. Once linked, copy the actual PostgreSQL connection string from Neon into Vercel's `DATABASE_URL` environment variable, and apply the Prisma schema/migrations to the database before using provider and marketplace features.


### Transport partner registration

The provider signup form includes a Transport option with a required partner type (transport agency/company or independent agent/driver). Applicants provide service type, vehicle type/capacity, coverage area, service description/safety practices, and an optional starting rate. The application remains pending until an administrator reviews it. The admin review card displays the transport partner type and submitted service details. Vehicle/insurance permits are not automatically verified; the platform does not dispatch drivers or process transport payments in this MVP. The `ProviderProfile.transportPartnerType` field is a schema addition and must be applied to the database before deployment.


## Community, provider photos, and subscriptions (October 2026 update)

This version adds `/community` with approved-provider updates, photo attachments through the existing Supabase Storage upload route, transport route fields, likes, comments, native share/copy-link, and customer provider ratings. Provider profile photos are stored in `ProviderProfile.avatarUrl`. Provider accounts receive a 14-day trial record; the `/subscription` page offers Starter (free), Growth (3,500 FCFA/month), and Business / Professional (10,000 FCFA/month). The free Starter plan can be activated without payment. Paid subscriptions remain `PENDING_PAYMENT` until a real payment gateway confirms payment. Do not manually represent a pending plan as paid. The displayed prices are agreed launch pricing, but paid entitlement enforcement, checkout, and recurring billing still require integration with a verified payment gateway.

### Apply the database schema before using the new features

The Prisma schema now includes `ProviderPost`, `PostLike`, `PostComment`, `ProviderRating`, `Subscription`, and `ProviderProfile.avatarUrl`. Back up the Neon database first. With the same `DATABASE_URL` used by Vercel configured in a trusted terminal, run:

```bash
npx prisma generate
npx prisma db push
npm run build
```

If deploying by ZIP upload, make sure the Vercel build command applies the schema before `next build`, or apply the schema from a trusted terminal first. Do not put database credentials in frontend code or commit `.env` files.

### Required for photo uploads

Create a public-read Supabase Storage bucket named `bookit-portfolio` (or set `SUPABASE_STORAGE_BUCKET`) and configure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` as server-side Vercel environment variables. The service-role key must never be exposed to the browser. Without these settings, text-only community posts can work, but photo/profile uploads will return a clear configuration error.

### Subscription payment limitation

The plan selector records a selected plan as `PENDING_PAYMENT`; it does not collect money or activate a paid subscription. Configure a supported payment provider and verify payment callbacks server-side before activating paid subscriptions. Trial posting ends after the trial expiry unless the subscription is `ACTIVE`.
