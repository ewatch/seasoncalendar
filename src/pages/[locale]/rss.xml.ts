import type { APIRoute } from "astro";
import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE_TITLE, SITE_DESCRIPTION, BLOG_FALLBACK_LOCALE, DEFAULT_LOCALE, LOCALES } from "../../consts";

export function getStaticPaths() {
	return Object.keys(LOCALES).map((locale) => ({ params: { locale } }));
}

export const GET: APIRoute = async function get({ params, redirect, site }) {
	const locale = params.locale;

	if (!locale) {
		return new Response(null, {
			status: 400,
			statusText: "Bad Request",
		});
	}

	if (locale === DEFAULT_LOCALE) {
		return redirect("/rss.xml");
	}

	const localePosts = await getCollection("blog", (entry) => entry.slug.startsWith(locale));
	const posts = localePosts.length > 0 ? localePosts : await getCollection("blog", (entry) => entry.slug.startsWith(BLOG_FALLBACK_LOCALE));

	const { body } = await rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: site!.href,
		items: posts.map((post) => ({
			...post.data,
			link: `/blog/${post.slug.replace(/^[^/]+\//, "")}/`,
		})),
	});

	return new Response(body, {
		status: 200,
		statusText: "OK",
	});
};
