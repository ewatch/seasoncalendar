// Builds public/trade-map.svg: a light world map (Natural Earth 1:110m via world-atlas) whose supplier
// countries carry their ISO code, plus projected country centres for drawing routes in the browser.
// Run once after changing the projection or the country list: node scripts/build-trade-map.mjs
import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";

const require = createRequire(import.meta.url);
const topology = JSON.parse(await readFile(require.resolve("world-atlas/countries-110m.json"), "utf8"));
const OUTPUT = new URL("../public/trade-map.svg", import.meta.url);
const WIDTH = 1000;
const HEIGHT = 520;

// ISO 3166 numeric → Comext partner code, with an approximate centre [longitude, latitude] for route ends.
// Centres are set by hand so that e.g. France is not pulled towards French Guiana.
const COUNTRIES = {
	"032": ["AR", -64, -34], "040": ["AT", 14.5, 47.5], "036": ["AU", 134, -25], "031": ["AZ", 47.7, 40.3], "056": ["BE", 4.6, 50.6],
	"854": ["BF", -1.6, 12.3], "100": ["BG", 25.3, 42.7], "076": ["BR", -52, -10], "112": ["BY", 28, 53.7], "124": ["CA", -106, 56],
	"152": ["CL", -71, -33], "156": ["CN", 104, 35], "170": ["CO", -73, 4], "188": ["CR", -84, 10], "203": ["CZ", 15.5, 49.8],
	"208": ["DK", 9.5, 56], "214": ["DO", -70.7, 19], "218": ["EC", -78, -1.5], "233": ["EE", 25.5, 58.7], "818": ["EG", 30.8, 26.8],
	"724": ["ES", -3.7, 40.2], "250": ["FR", 2.4, 46.6], "826": ["GB", -2, 53], "268": ["GE", 43.4, 42.3], "288": ["GH", -1, 7.9],
	"300": ["GR", 22, 39.3], "191": ["HR", 15.6, 45.4], "348": ["HU", 19.5, 47.2], "372": ["IE", -8, 53.4], "376": ["IL", 35, 31.4],
	"356": ["IN", 78, 21], "380": ["IT", 12.6, 42.8], "404": ["KE", 37.9, 0.2], "440": ["LT", 23.9, 55.2], "428": ["LV", 24.6, 56.9],
	"504": ["MA", -7.1, 31.8], "498": ["MD", 28.4, 47.4], "807": ["MK", 21.7, 41.6], "484": ["MX", -102.5, 23.6], "528": ["NL", 5.3, 52.2],
	"554": ["NZ", 174, -41], "604": ["PE", -75, -9.2], "586": ["PK", 69.3, 30.4], "616": ["PL", 19.4, 52], "620": ["PT", -8, 39.6],
	"642": ["RO", 25, 45.9], "643": ["RU", 38, 56], "705": ["SI", 14.8, 46.1], "760": ["SY", 38.5, 35], "764": ["TH", 101, 15.9],
	"792": ["TR", 35.2, 39], "804": ["UA", 32, 49], "840": ["US", -98, 39], "688": ["XS", 20.9, 44], "710": ["ZA", 24.7, -29],
	"894": ["ZM", 27.8, -13.1], "276": ["DE", 10.4, 51.2], "703": ["SK", 19.7, 48.7], "756": ["CH", 8.2, 46.8], "442": ["LU", 6.1, 49.8],
	"752": ["SE", 15, 62], "578": ["NO", 9, 61], "246": ["FI", 26, 64], "008": ["AL", 20, 41.1], "070": ["BA", 17.8, 44.2],
	"499": ["ME", 19.3, 42.7], "012": ["DZ", 2.6, 28], "788": ["TN", 9.5, 34], "434": ["LY", 17, 27], "686": ["SN", -14.5, 14.5],
	"384": ["CI", -5.5, 7.5], "231": ["ET", 39.5, 9], "800": ["UG", 32.3, 1.4], "834": ["TZ", 34.9, -6.4], "320": ["GT", -90.2, 15.8],
	"340": ["HN", -86.5, 14.8], "591": ["PA", -80, 8.5], "858": ["UY", -56, -32.8], "600": ["PY", -58, -23.4], "068": ["BO", -64.7, -16.7],
	"862": ["VE", -66, 7], "360": ["ID", 117, -2.5], "704": ["VN", 106, 16], "458": ["MY", 102, 4], "608": ["PH", 122, 12], "392": ["JP", 138, 36],
	"410": ["KR", 127.8, 36.3], "364": ["IR", 53.7, 32.4], "682": ["SA", 45, 24], "784": ["AE", 54, 24], "398": ["KZ", 67, 48],
	"860": ["UZ", 64.6, 41.4], "566": ["NG", 8.7, 9.1], "120": ["CM", 12.4, 5.7], "450": ["MG", 46.9, -19],
};

const land = feature(topology, topology.objects.countries);
land.features = land.features.filter((country) => country.id !== "010"); // no Antarctica
// Keep only metropolitan France, so colouring France does not also colour French Guiana.
const france = land.features.find((country) => country.id === "250");
france.geometry.coordinates = france.geometry.coordinates.filter(([ring]) => ring.every(([lon]) => lon > -10));
const projection = geoNaturalEarth1().fitExtent(
	[
		[4, 4],
		[WIDTH - 4, HEIGHT - 4],
	],
	land,
);
const path = geoPath(projection).digits(1);

const paths = land.features
	.map((country) => {
		const code = COUNTRIES[country.id]?.[0];
		return `<path class="trade-land"${code ? ` data-c="${code}"` : ""} d="${path(country)}"/>`;
	})
	.join("");
const centres = Object.fromEntries(
	Object.values(COUNTRIES).map(([code, lon, lat]) => [code, projection([lon, lat]).map((value) => Math.round(value * 10) / 10)]),
);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}"><metadata id="trade-map-centres">${JSON.stringify(centres)}</metadata><g class="trade-countries">${paths}</g></svg>\n`;
await writeFile(OUTPUT, svg);
console.log(`wrote ${OUTPUT.pathname} (${(svg.length / 1024).toFixed(0)} KB, ${land.features.length} countries)`);
