OpenWrite – Project Handoff Summary (Updated July 27 2025)
1 Project goal
OpenWrite is a minimal, habit-forming creative-writing web app. Every user—guest or registered—receives the same writing prompt each day, writes for exactly three minutes and either submits early or waits for the timer to expire. When the timer stops, the input is locked and the submission is recorded. The long-term vision is to grow a community of writers by letting authenticated users read each other’s daily responses. The current product focuses on the single-prompt writing experience and a simple onboarding flow.

2 Key technical decisions
Architecture and deployment

Framework & deployment – The app uses Next.js 14 with the App Router. It is deployed on Vercel and connected to a GitHub repository for CI/CD. Page components (e.g., the homepage at src/app/page.tsx) are client components, while data-fetching functions (e.g., API routes) run on the server.

Data storage – Supabase (PostgreSQL) is the only database. Row-level security (RLS) is enabled, and policies ensure users can only access and modify their own records. Key tables:

auth.users (private): stores Supabase authentication information.

profiles (public): holds a user’s public data (username, email) and is linked to auth.users via id. A database trigger automatically inserts a profiles row when a new user registers.

prompts: contains prompt_text and date_shown columns. The /api/get-prompt API selects the prompt for the current UTC date and returns its id and prompt_text GitHub. If no row matches the date, it returns a 404 error GitHub.

submissions: stores a user’s writing (submission_text) along with foreign keys user_id and prompt_id. Each row also has an is_anonymous flag. The /api/save-submission route ensures the caller is authenticated, validates the payload and inserts the row GitHub.

registered_users: stores newsletter subscriptions (email only).

Authentication & session management – Supabase Auth provides passwordless magic-link login. The AuthForm component calls supabase.auth.signInWithOtp() to send the magic link. A global AuthProvider uses the Supabase client to listen for auth state changes. When a session is present it fetches the user’s profile GitHub and, if the profile is missing a username, redirects the user to /onboarding to complete setup GitHub. Sessions are persisted in a cookie named openwrite-auth-token and refreshed server-side via @supabase/ssr. The server.ts helper constructs a Supabase server client with this cookie GitHub, and a src/middleware.ts middleware calls supabase.auth.getUser() on each request to refresh the session GitHub.

API routes – All backend logic lives in Next.js API routes under src/app/api/…:

Fetch daily prompt – /api/get-prompt selects today’s prompt from the prompts table GitHub.

Save a submission – /api/save-submission verifies the caller is logged in, validates promptId, submissionText and isAnonymous, then inserts the row into submissions GitHub.

Update profile – /api/profile validates the username (3-20 lowercase characters, numbers or underscores) and updates the row in profiles. It returns an error if the user is unauthenticated or the username is already taken GitHub.

Email subscription & copy – /api/subscribe uses Upstash Ratelimit to limit to five requests per minute GitHub. It upserts the email into the registered_users table GitHub and, if a prompt and submission are provided, renders the SubmissionEmail React component and sends it via Resend GitHub. A separate /api/send-submission route can also send the submission copy; it validates the payload, renders the email using @react-email/render and sends via Resend GitHub.

Email – Transactional emails use Resend with a React-based template (src/emails/SubmissionEmail.tsx). The template includes the recipient’s username, the prompt and the submission and is rendered to HTML before sending.

3 Current implementation state
The core writing experience and user flows are functional:

Daily prompt & writing – When users visit / the frontend fetches the day’s prompt via /api/get-prompt and displays it. The WritingArea component implements a three-minute timer and a textarea. Users can start writing, pause, or submit early. A “Post anonymously” checkbox stores an isAnonymous flag that is passed to the parent on submission. When time expires or the user clicks Submit, the text is locked and the onTimeUp callback is invoked.

Persistence – The main page stores submissions in localStorage (namespaced by date and prompt ID) to prevent data loss and determine whether the user has already completed the prompt for the day. When a logged-in user submits, the app calls handleSaveSubmissionToDb(), which posts to /api/save-submission to persist the entry in Supabase.

Guest flow – Guests can complete the writing exercise and see the “CompletionView” containing their writing. They cannot save to the database. The EmailForm on this view lets them subscribe to updates and optionally receive a copy of their submission. Submissions are stored only in the browser.

Registered-user flow – Users can sign in at /login using a magic-link email. After verifying the link, the AuthProvider loads the session and fetches the user’s profile GitHub. If the profile lacks a username, the user is redirected to /onboarding, where an OnboardingForm asks for a unique username (validated by /api/profile) GitHub. Once the username is saved, the user is returned to the main page.

Navigation & auth buttons – The AuthButton component displays a “Sign In / Register” link when there is no user, and a “Welcome, <username>” with a “Log Out” button when the user is authenticated.

Email & subscription – The EmailForm posts the user’s email to /api/subscribe, which rate-limits the request, upserts the email into registered_users, and sends the prompt/submission copy if provided GitHub. The form then calls /api/send-submission to send the submission copy to the same email GitHub. Rate limiting prevents abuse.

Resolved issues – The app previously suffered a blank-screen bug after magic-link redirection due to misconfigured Supabase Auth settings and missing session refresh. The bug was resolved by ensuring Supabase URLs were set correctly and adding src/middleware.ts to refresh sessions on each request GitHub.

4 Known issues and limitations
Prompt availability – If there is no row in prompts matching the current date, /api/get-prompt returns a 404 and the homepage shows an error message. Prompt scheduling must be maintained to keep the app functional GitHub.

No moderation – There is no content moderation. When the community responses feature is implemented, all non-anonymous submissions will be visible by default. This is a deliberate decision for early prototypes and will need to be revisited for public release.

Time zone considerations – The server uses new Date().toISOString().split('T')[0] to compute the current date GitHub. Because this uses UTC, prompts may roll over at midnight UTC rather than at the user’s local midnight. Adjust this if local time matters.

Duplicate email sending – Both /api/subscribe and /api/send-submission can send copies of submissions. The current implementation first subscribes the email, then separately calls /api/send-submission. Future refactoring could consolidate this logic to avoid duplicate code.

### Seeding upcoming prompts
To avoid 404 errors, ensure the `prompts` table always has entries scheduled for future dates. A helper script `npm run seed-prompts` seeds 30 days of prompts starting from today. It requires the environment variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to point to your Supabase project.

Limited error handling – API routes return basic JSON error messages but do not distinguish between different database errors (e.g., network vs. RLS violations). Additional logging and user-friendly messages would improve the UX.

5 Next steps (Phase 4)
The next major milestone is to build the community responses page, which will allow authenticated users to see other people’s writings for the current prompt. Recommended tasks:

Protected route – Create src/app/responses/page.tsx. Use the AuthProvider to ensure only authenticated users with a completed username can access this page. If the user is not logged in or has not completed onboarding, redirect them to /login or /onboarding.

Secure data API – Add an API route src/app/api/get-submissions/route.ts to fetch the non-anonymous submissions for the current prompt. The route should:

Read the current prompt ID (similar to /api/get-prompt).

Query the submissions table for rows where prompt_id matches and is_anonymous is false.

Join with profiles to obtain usernames.

Enforce RLS so users can only read submissions for the prompt of the day.

Return an array of objects with username and submission_text.

Responses UI – On the /responses page, call the new API route and render each submission with the author’s username. Consider simple styling (e.g., a list or cards). Show a message if no community submissions exist yet.

Completion page link – Add a button or link to the CompletionView that navigates to /responses when the user is logged in and has completed onboarding. Hide the link for guests or users without a username.

Moderation & scaling – Plan for optional features like content moderation (flagging or filtering inappropriate submissions) and pagination or infinite scroll if the number of daily submissions becomes large.

By implementing these steps, the project will move from a single-user writing tool to an interactive community space while maintaining the existing architecture and security practices.
