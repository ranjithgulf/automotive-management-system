# AutoFlow GCC brand assets

Designed 8 November 2026 from the existing AutoFlow GCC automotive website. Business name, tagline and website content are unchanged.

## Concept

A custom geometric A suggests an open road; its forward crossbar represents flow and connection. This replaces the generic car pictogram while keeping the existing teal/navy identity. It supports the site's vehicle, service, parts and fleet journeys without claiming a new business activity.

## Variants

All paths are relative to public/assets/branding.

| Asset | Use |
| --- | --- |
| primary.svg | Stacked icon + wordmark, 320 x 190 |
| horizontal.svg | Horizontal lockup, 390 x 72 |
| logo-light.svg | Teal/navy transparent lockup for light surfaces |
| logo-dark.svg | White/light-teal transparent lockup for dark surfaces |
| icon.svg | Standalone vector mark |
| favicon.svg | Rounded teal browser-icon tile |
| social-profile.svg / .png / .webp | Square 1024 x 1024 profile artwork |
| social-card.svg / .png | 1200 x 630 branded sharing card |

The framework favicon is src/app/icon.svg. The 180 x 180 Apple touch icon is src/app/apple-icon.png. WebsiteBrand in src/components/website/brand.js supplies the same mark and existing localized tagline to header and footer. The SVG mark is decorative next to the visible brand name.

## Palette and typography

- Mark teal: #0f766e.
- Navy: #0f172a.
- Dark-surface accent: #5eead4.
- Existing warm page surface: #fcfcf9.
- Existing website typography remains Geist and Noto Sans Arabic, with font-display: swap.
- Portable SVG wordmark exports use Arial/sans-serif fallback. Keep the exact business name and English tagline in those exports.
- Do not stretch the artwork or recolor it with low-contrast colors. Leave at least one quarter of the icon height as clear space. Use the icon-only version at small sizes; do not shrink the full lockup until its tagline is unreadable.

## Implementation boundaries

No addresses, phone numbers, ratings, social accounts, certifications or live-stock claims were invented. Social-profile artwork is an upload asset, not a claim that an account exists. The photo catalogue remains explicitly illustrative.

Keep the original photo backup folder .asset-backups/2026-11-08 while reviewing optimized imagery; it is intentionally Git-ignored. The script node scripts/optimize-website-assets.mjs regenerates responsive variants using those originals where available, otherwise the checked-in full-size WebP images. Review focal points when replacing the hero photograph.
