// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

// Website metadata
export const SITE_URL: string = "https://seasoncalendar.example.com";
export const SITE_TITLE: string = "Saisonkalender";
export const SITE_DESCRIPTION: string = "Willkommen zum Saisonkalender für Deutschland!";

// SEO metadata
export const TWITTER_CREATOR: string = "";

// Navigation
type Page = {
	title: string;
	href: string;
	children?: Page[];
};

export const PAGES: Page[] = [
	{
		title: "home",
		href: "/",
	},
	{
		title: "about",
		href: "/about",
	},
];

// i18n
export const DEFAULT_LOCALE = "de";
export const BLOG_FALLBACK_LOCALE = "en";
export const LOCALES = {
	de: "de", // the `defaultLocale` value must present in `locales` keys
	it: "it",
};
