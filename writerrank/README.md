# OpenWrite

OpenWrite is a Next.js application that delivers a daily three‑minute writing challenge. It uses Supabase for data storage, Clerk for user authentication, Upstash Redis for rate limiting and Resend for transactional emails.

## Prerequisites

- **Node.js** 18.17 or newer
- The following environment variables must be provided:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `RESEND_API_KEY`
  - `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
  - `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

## Running locally

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Building and deploying

For a production build run:

```bash
npm run build
npm start
```

When deploying to **Vercel**, provide the same environment variables in your project settings. Pushing the code to a connected repository or running `vercel` with the CLI will trigger the build.

## Architecture overview

- **Next.js App Router** serves all pages and API routes.
- **Supabase** stores user profiles, prompts and submissions. `src/lib/supabase` exposes browser and server clients.
- **Clerk** handles authentication and user sessions via middleware in `src/middleware.ts`.
- **Upstash Redis** prevents spamming of the subscribe endpoint using rate limiting.
- **Resend** and React Email generate and send confirmation emails.

## Daily writing workflow

1. The home page retrieves the current prompt from `/api/get-prompt`.
2. Users write for three minutes in `WritingArea`. Text is saved to `localStorage` and, if logged in, persisted through `/api/save-submission`.
3. After submission, `CompletionView` allows users to subscribe via `/api/subscribe`, which stores their email and sends a copy using `/api/send-submission`.
4. Returning the next day loads a new prompt and the cycle repeats.
