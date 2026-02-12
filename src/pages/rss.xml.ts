import type { APIRoute } from "astro";
import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE_TITLE, SITE_DESCRIPTION, BLOG_FALLBACK_LOCALE } from "../consts";

export const GET: APIRoute = async function get({ site }) {
	const posts = await getCollection("blog", (entry) => entry.slug.startsWith(BLOG_FALLBACK_LOCALE));

	const { body } = await rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: site!.href,
		items: posts.map((post) => ({
			...post.data,
			link: `/blog/${post.slug.replace(`${BLOG_FALLBACK_LOCALE}/`, "")}/`,
		})),
	});

	return new Response(body, {
		status: 200,
		statusText: "OK",
	});
};
