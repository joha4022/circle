# circle

Circle is a birthday gift planning app where friend groups can:

- Sign in with Google
- Save birthday + shipping address
- Create groups with friends
- Auto-create a private birthday planning chat that excludes the birthday person
- Propose and vote on gift options
- Mark a winning gift and hand off to payment integration

## Stack

- Next.js (App Router + TypeScript)
- NextAuth (Google provider)
- Prisma + SQLite
- Server route handlers for profile/group/chat/voting flows

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Copy environment file and fill OAuth values:

```bash
cp .env.example .env
```

3. Set up database:

```bash
npm run prisma:generate
npm run db:push
```

4. Run app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Google OAuth setup

Create OAuth credentials in Google Cloud Console and add:

- Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

Then place credentials in `.env`:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

## Product behavior implemented

- Group creation selects the nearest upcoming birthday in that group.
- Circle auto-creates a private planning discussion excluding that birthday person.
- Participants can post messages, add gift options, and vote.
- "Finalize gift" creates/updates an order record with a payment provider placeholder.

## Payment integration note

Payment is intentionally provider-agnostic right now. Route `POST /api/discussions/:id/checkout` stores provider + pending status and is ready for Stripe/PayPal integration.
