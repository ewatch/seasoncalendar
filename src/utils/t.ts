/**
 * From https://github.com/trktml/lotusforafrica/blob/main/src/utils/translationTools.ts
 */

import { DEFAULT_LOCALE, LOCALES } from "@src/consts";
import { getLocale } from "astro-i18n-aut";

import de from "@src/locales/de/de.json";

type TranslationMap = Record<string, string>;

const handler: ProxyHandler<TranslationMap> = {
	get(target, prop) {
		if (typeof prop !== "string") {
			return "";
		}

		const value = target[prop];
		if (typeof value !== "string") {
			return "";
		}

		return value.replaceAll("\n", "<br/>");
	},
};

const deProxy = new Proxy(de as TranslationMap, handler) as unknown as Locales;

export const defaultLocale = DEFAULT_LOCALE;
export const locales = LOCALES;

/**
 * Return the locale object with all the translations for a specific locale
 * @param astroUrl
 * @returns
 */
export default function t(_astroUrl: URL): Locales {
	return deProxy;
}

export function tFn(_astroUrl: URL) {
	const translations = deProxy;

	return (key: string): string => {
		if (key in translations) {
			return translations[key as keyof Locales];
		}
		console.warn(`Missing translation key: ${key}`);
		return key;
	};
}

/**
 *
 * @param link Localize a specific path
 * @param astroUrl
 * @returns
 */
export function localizePath(link: string | URL, astroUrl: string | URL): string {
	const locale = getLocale(astroUrl);
	let localizedLink = "";
	if (locale && locale !== defaultLocale) {
		const localeLink = `/${getLocale(astroUrl) ?? ""}/${link}`.replaceAll("//", "/") ?? "";
		localizedLink = localeLink;
	} else {
		localizedLink = String(link);
	}

	// localizedLink add last slash
	if (!localizedLink.endsWith("/")) {
		localizedLink += "/";
	}

	return localizedLink;
}
