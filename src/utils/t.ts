/**
 * From https://github.com/trktml/lotusforafrica/blob/main/src/utils/translationTools.ts
 */

import { DEFAULT_LOCALE, LOCALES } from "@src/consts";
import { getLocale } from "astro-i18n-aut";

import de from "@src/locales/de/de.json";
import it from "@locales/it.json";

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
const itProxy = new Proxy(it as TranslationMap, handler) as unknown as Locales;

export const defaultLocale = DEFAULT_LOCALE;
export const locales = LOCALES;

/**
 * Return the locale object with all the translations for a specific locale
 * @param astroUrl
 * @returns
 */
export default function t(astroUrl: URL): Locales {
	const locale = getLocale(astroUrl);

	switch (locale) {
		case "it":
			return itProxy;
		default:
			return deProxy;
	}
}

export function tFn(astroUrl: URL) {
	const locale = getLocale(astroUrl);
	let translations: Locales;

	switch (locale) {
		case "it":
			translations = itProxy;
			break;
		default:
			translations = deProxy;
			break;
	}

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
