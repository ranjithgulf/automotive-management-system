# AutoFlow GCC

Bilingual public automotive showcase website built with Next.js App Router, JavaScript, React and Tailwind CSS. Zoho One is the planned operational business platform. This website does not recreate its CRM, workshop, inventory, finance, HR or administration functionality.

## Run

Use Node.js 24 LTS and npm.

```sh
npm install
npm run dev
```

Open http://localhost:3000, /en/, or /ar/.

```sh
npm run lint
npm run test:website
npm run build
npm start
```

The build creates out/ for Cloudflare Pages. npm start serves that static output locally. Forms are clearly labelled demonstrations: no messages, appointments or customer data are sent or stored. Vehicle listings, product information and photographs are illustrative. Zoho and SalesIQ are not connected.

## Documentation

- [Rebuild report, file structure, data boundaries and deployment setup](docs/website-rebuild.md)
- [Generated image assets and original prompts](docs/visual-assets.md)

Set the optional SITE_URL build variable to the verified public origin before publication, so canonical URLs, social images and sitemap entries use the real domain. No company history, contact information, verified availability, integrations or domain details are invented.

The existing ignored .env and dormant PostgreSQL/Prisma foundation were retained. No database tables or business records are created by this website. Real Zoho submission requires confirmed configuration and an approved secure server endpoint.
