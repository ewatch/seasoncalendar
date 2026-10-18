import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import alpinejs from "@astrojs/alpinejs";
import { SITE_URL } from "./src/consts.ts";

// https://astro.build/config
export default defineConfig({
	site: SITE_URL,
	trailingSlash: "always",
	build: {
		format: "directory",
	},
	vite: {
		logLevel: "error",
		define: {
			__DATE__: `'${new Date()}'`,
		},
	},
	integrations: [
		sitemap(),
		alpinejs(),
	],
});
