# AutoFlow GCC

Basic Next.js App Router setup with JavaScript, React, Tailwind CSS, ESLint, and npm.

## Local development

Use Node.js 20.9 or later and npm. From this directory:

```sh
npm install
npm run dev
```

Open http://localhost:3000. No environment variables are required yet.

```text
src/
  app/
    api/           # Reserved for future Route Handlers
    favicon.ico
    globals.css
    layout.js      # Required App Router root layout
    page.js
  components/      # Reusable frontend components
public/            # Static assets
.env.example       # Future server-side environment variables
```

## Future server-side work

Use Next.js Route Handlers at `src/app/api/<endpoint>/route.js` for future API endpoints. Keep server-side logic in Route Handlers, Server Components, or server-only modules; no separate backend is needed.

When implementing Zoho integration, copy `.env.example` to `.env.local`, uncomment the needed variables, and fill them locally. Access credentials through `process.env` only in server-side code. Never expose secrets through `NEXT_PUBLIC_` variables, Client Components, API responses, or logs. Local environment files are ignored by Git; the example contains no credentials.

No Zoho integration, authentication, database, or business features are implemented.

## Checks

```sh
npm run lint
npm run build
```

Run a production build with `npm start` after building. The Next.js configuration is unchanged from the generated starter.
