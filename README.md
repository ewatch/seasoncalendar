# Seasoncalendar

Astro-based seasonal food calendar focused on Germany, with month navigation and multilingual blog support.

## Requirements

-   Node.js 18+
-   npm

## Development

```sh
npm install
npm run dev
```

App runs by default at `http://localhost:4321`.

## Build

```sh
npm run build
npm run preview
```

`npm run build` runs Astro type checks, generates PWA assets, and builds the production site.

## Project structure

-   `src/components/`: reusable Astro components
-   `src/pages/`: routes
-   `src/locales/`: translation files and seasonal food data
-   `src/content/blog/`: blog content collections
-   `public/admin/`: CMS configuration

## Configuration to review before production

-   `src/consts.ts`: site URL, SEO defaults, locale settings
-   `public/admin/config.yml`: CMS backend/auth settings
-   `src/components/blog/Comments.astro`: Giscus identifiers
