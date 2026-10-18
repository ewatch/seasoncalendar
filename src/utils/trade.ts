import { escapeHtml } from "./foodList";

export type Partner = [country: string, tonnes: number];

export type TradeGroup = {
	id: string;
	label: string;
	category: "vegetables" | "fruits" | "nuts";
	importOnly: boolean;
	foods: string[];
	codes: string[];
	imports: number;
	production: number | null;
	partners: Partner[];
	monthly: Array<{ total: number; partners: Partner[] }>;
};

export type TradeData = {
	meta: { year: number; productionYear: number; fetched: string; sources: { trade: string; production: string } };
	groups: TradeGroup[];
};

const MONTHS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

// Colour follows the country, never its rank. The eight largest supplier countries get the validated
// categorical slots in this fixed order; every other country is neutral and identified by its label.
export const COUNTRY_COLORS: Record<string, string> = {
	NL: "#2a78d6",
	ES: "#eb6834",
	IT: "#1baf7a",
	BE: "#eda100",
	FR: "#e87ba4",
	PL: "#008300",
	CO: "#6250d6",
	EC: "#e34948",
};
const OTHER_COLOR = "#a8a29e";
// Germany is neutral dark, like on the map, so it never competes with a supplier colour.
export const HOME_COLOR = "#44403c";
const SLOT_ORDER = Object.keys(COUNTRY_COLORS);

const regionNames = new Intl.DisplayNames("de", { type: "region" });
// Comext uses XS for Serbia instead of the ISO code RS.
export const countryName = (code: string) => (code === "XS" ? "Serbien" : (regionNames.of(code) ?? code));
export const countryColor = (code: string) => COUNTRY_COLORS[code] ?? OTHER_COLOR;

// Dative form after "aus": "aus den Niederlanden", "aus der Türkei", otherwise the plain name.
const DATIVE: Record<string, string> = {
	NL: "den Niederlanden",
	US: "den USA",
	TR: "der Türkei",
	SK: "der Slowakei",
	UA: "der Ukraine",
	DO: "der Dominikanischen Republik",
	GB: "dem Vereinigten Königreich",
	AE: "den Vereinigten Arabischen Emiraten",
	PH: "den Philippinen",
	MD: "der Republik Moldau",
	CH: "der Schweiz",
};
export const dativeCountry = (code: string) => DATIVE[code] ?? countryName(code);

const numberFormat = new Intl.NumberFormat("de-DE");
export const formatTonnes = (tonnes: number) => {
	if (tonnes >= 1_000_000) return `${(tonnes / 1_000_000).toLocaleString("de-DE", { maximumFractionDigits: 2 })} Mio. t`;
	if (tonnes >= 1_000) return `${numberFormat.format(Math.round(tonnes / 1_000) * 1_000)} t`;
	return `${numberFormat.format(Math.round(tonnes))} t`;
};
const percent = (part: number, total: number) => (total > 0 ? Math.round((part / total) * 100) : 0);

export const groupForFood = (data: TradeData, food: string) => data.groups.find((group) => group.foods.includes(food));

/* German share of the total supply (harvest + imports), or null when Eurostat publishes no harvest. */
export const domesticShare = (group: TradeGroup) => (group.production ? group.production / (group.production + group.imports) : null);

// Segments in fixed slot order (so neighbouring colours stay distinguishable), then other countries, then the rest.
function segments(partners: Partner[], total: number, limit: number) {
	const shown = partners.slice(0, limit);
	const ordered = [
		...SLOT_ORDER.flatMap((code) => shown.filter(([country]) => country === code)),
		...shown.filter(([country]) => !COUNTRY_COLORS[country]),
	];
	const rest = total - shown.reduce((sum, [, tonnes]) => sum + tonnes, 0);
	return { ordered, rest: rest > total * 0.005 ? rest : 0 };
}

const tip = (text: string) => `data-tip="${escapeHtml(text)}" tabindex="0"`;

/* Horizontal 100 % bar of the supply: German harvest first, then the import countries.
   The legend doubles as the table view. */
export function renderSupplyBar(group: TradeGroup, limit = 5): string {
	const home = group.production ?? 0;
	const total = group.imports + home;
	// Countries below 1 % of the supply only add noise; they fall into "weitere Länder".
	const partners = group.partners.slice(0, limit).filter(([, tonnes]) => tonnes / total >= 0.01);
	const { ordered, rest } = segments(partners, group.imports, limit);
	const bar = [
		home ? `<span class="trade-seg" style="flex-grow:${home};background:${HOME_COLOR}" ${tip(`Deutsche Ernte: ${percent(home, total)} % · ${formatTonnes(home)}`)}></span>` : "",
		...ordered.map(
			([country, tonnes]) =>
				`<span class="trade-seg" style="flex-grow:${tonnes};background:${countryColor(country)}" ${tip(`${countryName(country)}: ${percent(tonnes, total)} % · ${formatTonnes(tonnes)}`)}></span>`,
		),
		rest ? `<span class="trade-seg trade-seg--rest" style="flex-grow:${rest}" ${tip(`Weitere Länder: ${percent(rest, total)} % · ${formatTonnes(rest)}`)}></span>` : "",
	].join("");
	const legendItem = (color: string, name: string, tonnes: number) =>
		`<li class="flex items-center gap-1.5"><span aria-hidden="true" class="h-2.5 w-2.5 shrink-0 rounded-sm" style="background:${color}"></span>${escapeHtml(name)} <span class="tabular-nums text-stone-500">${percent(tonnes, total)} %</span></li>`;
	const legend = [
		home ? legendItem(HOME_COLOR, "Deutschland", home) : "",
		...partners.map(([country, tonnes]) => legendItem(countryColor(country), countryName(country), tonnes)),
	].join("");
	return `<div class="trade-bar" role="img" aria-label="Angebot nach Herkunft">${bar}</div><ul class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-700">${legend}</ul>`;
}

/* Twelve stacked columns: height = monthly import volume, segments = supplier countries. */
export function renderMonthStrip(group: TradeGroup, highlightMonth: number): string {
	const max = Math.max(...group.monthly.map((month) => month.total), 1);
	const columns = group.monthly
		.map((month, index) => {
			const { ordered, rest } = segments(month.partners, month.total, 4);
			const stack = [
				rest ? `<span class="trade-col-seg" style="flex-grow:${rest};background:${OTHER_COLOR}"></span>` : "",
				...ordered.reverse().map(([country, tonnes]) => `<span class="trade-col-seg" style="flex-grow:${tonnes};background:${countryColor(country)}"></span>`),
			].join("");
			const summary = month.partners
				.slice(0, 3)
				.map(([country, tonnes]) => `${countryName(country)} ${percent(tonnes, month.total)} %`)
				.join(", ");
			const label = `${MONTHS[index]}: ${formatTonnes(month.total)}${summary ? ` – ${summary}` : ""}`;
			return `<div class="trade-col${index === highlightMonth ? " is-current" : ""}" ${tip(label)}><div class="trade-col-track"><div class="trade-col-stack" style="height:${Math.max((month.total / max) * 100, month.total ? 2 : 0)}%">${stack}</div></div><span class="trade-col-label">${MONTHS[index]}</span><span class="sr-only">${escapeHtml(label)}</span></div>`;
		})
		.join("");
	return `<div class="trade-strip">${columns}</div>`;
}

/* One sentence on how much of the supply comes from Germany. */
export function renderSupplySummary(group: TradeGroup, year: number): string {
	const share = domesticShare(group);
	// Import-only foods already say so in the drawer's intro.
	if (group.importOnly) return "";
	const text =
		share === null
			? `Für ${escapeHtml(group.label)} veröffentlicht Eurostat keine deutsche Erntemenge, der Balken zeigt deshalb nur die Importe.`
			: `Rechnerisch stammen <strong class="font-semibold text-stone-900">${Math.round(share * 100)} %</strong> des Angebots aus deutscher Ernte, der Rest aus Importen.`;
	return `<p class="text-sm leading-relaxed text-stone-700">${text} <span class="text-stone-500">(${year})</span></p>`;
}

/* Compact 12-month import volume strip; months with a German season are shaded behind the bars. */
export function renderImportSparkline(group: TradeGroup, seasonMonths: boolean[]): string {
	const max = Math.max(...group.monthly.map((month) => month.total), 1);
	const bars = group.monthly
		.map((month, index) => {
			const label = `${MONTHS[index]}: ${formatTonnes(month.total)} importiert${seasonMonths[index] ? " · heimische Saison" : ""}`;
			return `<span class="trade-spark-col${seasonMonths[index] ? " is-season" : ""}" ${tip(label)}><span class="trade-spark-bar" style="height:${Math.max((month.total / max) * 100, month.total ? 3 : 0)}%"></span><span class="sr-only">${escapeHtml(label)}</span></span>`;
		})
		.join("");
	return `<div class="trade-spark" aria-label="Importmenge je Monat">${bars}</div><div class="trade-spark-axis" aria-hidden="true"><span>Jan</span><span>Jun</span><span>Dez</span></div>`;
}

/* Placeholder for the supplier map; mountTradeMap fills it once the map file is loaded. */
export function renderTradeMap(group: TradeGroup): string {
	return `<figure class="trade-map" data-trade-map="${escapeHtml(group.id)}"><div class="trade-map-canvas" role="img" aria-label="Karte der wichtigsten Lieferländer für ${escapeHtml(group.label)}"></div><figcaption>Farbig: Lieferländer · Linienstärke = Anteil an den Importen</figcaption></figure>`;
}

let mapSource: Promise<string> | null = null;
const loadMap = () => (mapSource ??= fetch("/trade-map.svg").then((response) => response.text()));
const SVG_NS = "http://www.w3.org/2000/svg";

function svgElement(name: string, attributes: Record<string, string | number>) {
	const element = document.createElementNS(SVG_NS, name);
	Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
	return element;
}

/* Colours the supplier countries, draws a route per supplier and zooms to the region that matters. */
export async function mountTradeMap(figure: HTMLElement, group: TradeGroup) {
	const canvas = figure.querySelector<HTMLElement>(".trade-map-canvas");
	if (!canvas) return;
	canvas.innerHTML = await loadMap();
	const svg = canvas.querySelector("svg");
	const centres: Record<string, [number, number]> = JSON.parse(svg?.querySelector("#trade-map-centres")?.textContent || "{}");
	if (!svg || !centres.DE) return;

	const suppliers = group.partners.filter(([country, tonnes]) => centres[country] && tonnes / group.imports >= 0.02);
	svg.querySelector('[data-c="DE"]')?.classList.add("is-home");
	suppliers.forEach(([country]) => svg.querySelector<SVGPathElement>(`[data-c="${country}"]`)?.style.setProperty("fill", countryColor(country)));

	// Zoom to Germany and its suppliers, keeping the canvas aspect ratio.
	const points = [centres.DE, ...suppliers.map(([country]) => centres[country])];
	const [mapWidth, mapHeight] = [1000, 520];
	const ratio = 16 / 9;
	let minX = Math.min(...points.map(([x]) => x)) - 50;
	let maxX = Math.max(...points.map(([x]) => x)) + 50;
	let minY = Math.min(...points.map(([, y]) => y)) - 40;
	let maxY = Math.max(...points.map(([, y]) => y)) + 40;
	let width = Math.max(maxX - minX, 220);
	let height = Math.max(maxY - minY, width / ratio);
	width = Math.max(width, height * ratio);
	minX = Math.min(Math.max((minX + maxX) / 2 - width / 2, 0), Math.max(mapWidth - width, 0));
	minY = Math.min(Math.max((minY + maxY) / 2 - height / 2, 0), Math.max(mapHeight - height, 0));
	svg.setAttribute("viewBox", `${minX} ${minY} ${Math.min(width, mapWidth)} ${Math.min(height, mapHeight)}`);

	// Sizes in map units that render at a constant pixel size.
	const unit = Math.min(width, mapWidth) / (canvas.clientWidth || 500);
	const [homeX, homeY] = centres.DE;
	const overlay = svgElement("g", {});
	const labelled: Array<[number, number]> = [[homeX, homeY]];
	suppliers.forEach(([country, tonnes], index) => {
		const [x, y] = centres[country];
		const share = tonnes / group.imports;
		const bend = Math.max(Math.hypot(homeX - x, homeY - y) * 0.25, 6 * unit);
		overlay.appendChild(
			svgElement("path", {
				class: "trade-route",
				d: `M ${x} ${y} Q ${(x + homeX) / 2} ${Math.min(y, homeY) - bend} ${homeX} ${homeY}`,
				stroke: countryColor(country),
				"stroke-width": Math.max(1.5, Math.min(6, share * 12)),
				style: `animation-delay:${index * 120}ms`,
			}),
		);
		overlay.appendChild(svgElement("circle", { class: "trade-origin", cx: x, cy: y, r: 3.5 * unit, stroke: countryColor(country) }));
		const free = labelled.every(([otherX, otherY]) => Math.hypot(otherX - x, otherY - y) / unit > 22);
		if (index < 4 && free) {
			labelled.push([x, y]);
			// Countries west of Germany get their label on the left, away from Germany, if it fits there.
			const name = countryName(country);
			const west = x < homeX && (x - minX) / unit > name.length * 6.5 + 10;
			const label = svgElement("text", {
				class: "trade-label",
				x: x + (west ? -6 : 6) * unit,
				y: y + (y < homeY ? -6 : 12) * unit,
				"font-size": 11 * unit,
				"text-anchor": west ? "end" : "start",
			});
			label.textContent = name;
			overlay.appendChild(label);
		}
	});
	overlay.appendChild(svgElement("circle", { class: "trade-home", cx: homeX, cy: homeY, r: 5 * unit }));
	svg.appendChild(overlay);
}

/* Lightweight hover/focus tooltip for every [data-tip] element inside root. */
export function bindTooltips(root: HTMLElement) {
	// Lives inside root so it also shows above content in a modal <dialog> (top layer).
	let tooltip = root.querySelector<HTMLElement>(":scope > .trade-tooltip");
	if (!tooltip) {
		tooltip = document.createElement("div");
		tooltip.className = "trade-tooltip";
		tooltip.setAttribute("role", "tooltip");
		root.appendChild(tooltip);
	}
	const show = (event: Event) => {
		const target = (event.target as HTMLElement).closest<HTMLElement>("[data-tip]");
		if (!target || !tooltip) return;
		tooltip.textContent = target.dataset.tip || "";
		const rect = target.getBoundingClientRect();
		tooltip.style.display = "block";
		const left = Math.min(Math.max(rect.left + rect.width / 2 - tooltip.offsetWidth / 2, 8), window.innerWidth - tooltip.offsetWidth - 8);
		tooltip.style.left = `${left}px`;
		tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8}px`;
	};
	const hide = () => tooltip && (tooltip.style.display = "none");
	root.addEventListener("mouseover", show);
	root.addEventListener("focusin", show);
	root.addEventListener("mouseout", hide);
	root.addEventListener("focusout", hide);
}
