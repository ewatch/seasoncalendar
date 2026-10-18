// Fetches German import statistics (Eurostat Comext) and domestic production (Eurostat apro_cpsh1)
// for the foods in the calendar and writes src/data/trade.json.
// Usage: node scripts/fetch-trade.mjs
import { writeFile } from "node:fs/promises";

const COMEXT = "https://ec.europa.eu/eurostat/api/comext/dissemination/statistics/1.0/data/DS-045409";
const PRODUCTION = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/apro_cpsh1";
const OUTPUT = new URL("../src/data/trade.json", import.meta.url);

// One group per customs code set. Several calendar foods can share a code (e.g. all lettuces).
// `production` lists Eurostat crop codes (harvested production, 1000 t) used for the German share of supply.
const GROUPS = [
	{ id: "tomaten", label: "Tomaten", category: "vegetables", codes: ["07020000"], production: ["V3110"], foods: ["Tomate"] },
	{ id: "gurken", label: "Gurken", category: "vegetables", codes: ["07070005"], production: ["V3200"], foods: ["Salatgurke"] },
	{ id: "paprika", label: "Paprika", category: "vegetables", codes: ["07096010"], production: ["V3600"], foods: ["Paprikaschote"] },
	{ id: "zwiebeln", label: "Zwiebeln", category: "vegetables", codes: ["07031019"], production: ["V4210"], foods: ["Zwiebel"] },
	{ id: "schalotten", label: "Schalotten", category: "vegetables", codes: ["07031090"], production: [], foods: ["Schalotte"] },
	{ id: "lauch", label: "Lauch", category: "vegetables", codes: ["07039000"], production: ["V2100"], foods: ["Porree/Lauch"] },
	{ id: "blumenkohl", label: "Blumenkohl & Brokkoli", category: "vegetables", codes: ["070410"], production: ["V1100"], foods: ["Blumenkohl", "Brokkoli", "Romanesco"] },
	{ id: "rosenkohl", label: "Rosenkohl", category: "vegetables", codes: ["07042000"], production: ["V1200"], foods: ["Rosenkohl"] },
	{ id: "kopfkohl", label: "Weiß- & Rotkohl", category: "vegetables", codes: ["07049010"], production: ["V1300"], foods: ["Weißkohl", "Rotkohl", "Spitzkohl"] },
	{ id: "kohl", label: "Kohlrabi, Grünkohl, Wirsing & Co.", category: "vegetables", codes: ["07049090"], production: ["V1900"], foods: ["Kohlrabi", "Grünkohl", "Wirsing", "Chinakohl", "Pak Choi"] },
	{ id: "salat", label: "Salat", category: "vegetables", codes: ["07051100", "07051900"], production: ["V2300"], foods: ["Kopfsalat", "Eisbergsalat", "Bataviasalat", "Eichblattsalat", "Lollo Rosso", "Romana-/Römersalat"] },
	{ id: "chicoree", label: "Chicorée", category: "vegetables", codes: ["07052100"], production: ["V2710"], foods: ["Chicorée"] },
	{ id: "endivien", label: "Endivie & Radicchio", category: "vegetables", codes: ["07052900"], production: ["V2400"], foods: ["Endiviensalat", "Radicchio"] },
	{ id: "moehren", label: "Möhren", category: "vegetables", codes: ["07061000"], production: ["V4100"], foods: ["Möhre"] },
	{ id: "knollensellerie", label: "Knollensellerie", category: "vegetables", codes: ["07069010"], production: ["V4400"], foods: ["Knollensellerie"] },
	{ id: "meerrettich", label: "Meerrettich", category: "vegetables", codes: ["07069030"], production: [], foods: ["Meerrettich"] },
	{ id: "wurzelgemuese", label: "Rote Bete, Rettich & Co.", category: "vegetables", codes: ["07069090"], production: ["V4300", "V4500"], foods: ["Rote Bete", "Rettich", "Radieschen", "Pastinake", "Petersilienwurzel"] },
	{ id: "erbsen", label: "Erbsen", category: "vegetables", codes: ["07081000"], production: ["V5100"], foods: ["Erbse", "Zucker-/Kaiserschote"] },
	{ id: "bohnen", label: "Bohnen", category: "vegetables", codes: ["07082000"], production: ["V5200"], foods: ["Bohnen, grüne"] },
	{ id: "spargel", label: "Spargel", category: "vegetables", codes: ["07092000"], production: ["V2600"], foods: ["Spargel"] },
	{ id: "auberginen", label: "Auberginen", category: "vegetables", codes: ["07093000"], production: [], foods: ["Aubergine"] },
	{ id: "staudensellerie", label: "Staudensellerie", category: "vegetables", codes: ["07094000"], production: ["V2200"], foods: ["Staudensellerie"] },
	{ id: "champignons", label: "Champignons", category: "vegetables", codes: ["07095100"], production: [], foods: ["Champignon"] },
	{ id: "pfifferlinge", label: "Pfifferlinge", category: "vegetables", codes: ["070953"], production: [], foods: ["Pfifferling"] },
	{ id: "spinat", label: "Spinat", category: "vegetables", codes: ["07097000"], production: ["V2500"], foods: ["Spinat"] },
	{ id: "zucchini", label: "Zucchini", category: "vegetables", codes: ["07099310"], production: ["V3420"], foods: ["Zucchini"] },
	{ id: "kuerbis", label: "Kürbis", category: "vegetables", codes: ["07099390"], production: ["V3430"], foods: ["Kürbis", "Hokkaido", "Butternut-Kürbis", "Spaghettikürbis"] },
	{ id: "artischocken", label: "Artischocken", category: "vegetables", codes: ["07099100"], production: [], foods: ["Artischocke"] },
	{ id: "mais", label: "Zuckermais", category: "vegetables", codes: ["07099960"], production: [], foods: ["Mais"] },
	{ id: "kartoffeln", label: "Kartoffeln", category: "vegetables", codes: ["07019050", "07019090"], production: ["R1000"], foods: ["Kartoffel"] },
	{ id: "suesskartoffeln", label: "Süßkartoffeln", category: "vegetables", codes: ["071420"], production: [], foods: ["Süßkartoffel"] },
	{ id: "aepfel", label: "Äpfel", category: "fruits", codes: ["08081080"], production: ["F1111"], foods: ["Apfel"] },
	{ id: "birnen", label: "Birnen", category: "fruits", codes: ["08083090"], production: ["F1121"], foods: ["Birne"] },
	{ id: "quitten", label: "Quitten", category: "fruits", codes: ["08084000"], production: [], foods: ["Quitte"] },
	{ id: "aprikosen", label: "Aprikosen", category: "fruits", codes: ["08091000"], production: [], foods: ["Aprikose"] },
	{ id: "kirschen", label: "Kirschen", category: "fruits", codes: ["08092100", "08092900"], production: ["F1240"], foods: ["Kirsche"] },
	{ id: "pfirsiche", label: "Pfirsiche & Nektarinen", category: "fruits", codes: ["080930"], production: [], foods: ["Pfirsich", "Nektarine"] },
	{ id: "pflaumen", label: "Pflaumen & Zwetschgen", category: "fruits", codes: ["08094005"], production: ["F1250"], foods: ["Pflaume", "Zwetschge", "Mirabelle"] },
	{ id: "erdbeeren", label: "Erdbeeren", category: "fruits", codes: ["08101000"], production: ["S0000"], foods: ["Erdbeere"] },
	{ id: "himbeeren", label: "Himbeeren", category: "fruits", codes: ["08102010"], production: ["F3200"], foods: ["Himbeere"] },
	{ id: "brombeeren", label: "Brombeeren & Maulbeeren", category: "fruits", codes: ["08102090"], production: [], foods: ["Brombeere", "Maulbeere"] },
	{ id: "johannisbeeren", label: "Johannisbeeren", category: "fruits", codes: ["08103010", "08103030"], production: ["F3100"], foods: ["Johannisbeere"] },
	{ id: "stachelbeeren", label: "Stachelbeeren", category: "fruits", codes: ["08103090"], production: [], foods: ["Stachelbeere"] },
	{ id: "heidelbeeren", label: "Heidelbeeren", category: "fruits", codes: ["081040"], production: ["F3300"], foods: ["Heidelbeere"] },
	{ id: "trauben", label: "Tafeltrauben", category: "fruits", codes: ["08061010"], production: [], foods: ["Weintraube"] },
	{ id: "walnuesse", label: "Walnüsse", category: "nuts", codes: ["080231", "080232"], production: [], foods: ["Walnuss"] },
	{ id: "haselnuesse", label: "Haselnüsse", category: "nuts", codes: ["080221", "080222"], production: [], foods: ["Haselnuss"] },
	{ id: "maronen", label: "Maronen", category: "nuts", codes: ["080241", "080242"], production: [], foods: ["Marone"] },
	// Hardly or not grown in Germany; listed in the calendar under "imports".
	{ id: "bananen", label: "Bananen", category: "fruits", codes: ["080390"], production: [], foods: ["Banane"], importOnly: true },
	{ id: "orangen", label: "Orangen", category: "fruits", codes: ["080510"], production: [], foods: ["Orange"], importOnly: true },
	{ id: "mandarinen", label: "Mandarinen & Clementinen", category: "fruits", codes: ["080521", "080522", "080529"], production: [], foods: ["Mandarine/Clementine"], importOnly: true },
	{ id: "zitronen", label: "Zitronen & Limetten", category: "fruits", codes: ["080550"], production: [], foods: ["Zitrone/Limette"], importOnly: true },
	{ id: "grapefruits", label: "Grapefruits", category: "fruits", codes: ["080540"], production: [], foods: ["Grapefruit"], importOnly: true },
	{ id: "wassermelonen", label: "Wassermelonen", category: "fruits", codes: ["08071100"], production: [], foods: ["Wassermelone"], importOnly: true },
	{ id: "melonen", label: "Honig- & Zuckermelonen", category: "fruits", codes: ["080719"], production: [], foods: ["Honigmelone"], importOnly: true },
	{ id: "avocados", label: "Avocados", category: "fruits", codes: ["08044000"], production: [], foods: ["Avocado"], importOnly: true },
	{ id: "ananas", label: "Ananas", category: "fruits", codes: ["08043000"], production: [], foods: ["Ananas"], importOnly: true },
	{ id: "kiwis", label: "Kiwis", category: "fruits", codes: ["08105000"], production: [], foods: ["Kiwi"], importOnly: true },
	{ id: "mangos", label: "Mangos", category: "fruits", codes: ["08045000"], production: [], foods: ["Mango"], importOnly: true },
	{ id: "papayas", label: "Papayas", category: "fruits", codes: ["080720"], production: [], foods: ["Papaya"], importOnly: true },
	{ id: "feigen", label: "Feigen", category: "fruits", codes: ["08042010"], production: [], foods: ["Feige"], importOnly: true },
	{ id: "datteln", label: "Datteln", category: "fruits", codes: ["080410"], production: [], foods: ["Dattel"], importOnly: true },
	{ id: "knoblauch", label: "Knoblauch", category: "vegetables", codes: ["07032000"], production: [], foods: ["Knoblauch"], importOnly: true },
	{ id: "ingwer", label: "Ingwer", category: "vegetables", codes: ["091011"], production: [], foods: ["Ingwer"], importOnly: true },
];

const ALL_CODES = [...new Set(GROUPS.flatMap((group) => group.codes))];
const TOP_PARTNERS_YEAR = 6;
const TOP_PARTNERS_MONTH = 4;

async function getJson(url) {
	for (let attempt = 1; ; attempt++) {
		try {
			const response = await fetch(url, { signal: AbortSignal.timeout(180_000) });
			const body = await response.json();
			if (body.error) throw new Error(JSON.stringify(body.error).slice(0, 200));
			return body;
		} catch (error) {
			if (attempt === 3) throw error;
			console.warn(`retry ${attempt} for ${url.slice(0, 120)}…: ${error.message}`);
			await new Promise((resolve) => setTimeout(resolve, 5_000 * attempt));
		}
	}
}

// Flattens a JSON-stat response into rows of { dimension: code, ..., value }.
function rows(dataset) {
	const ids = dataset.id;
	const codesByDim = ids.map((id) => {
		const index = dataset.dimension[id].category.index;
		return Object.fromEntries(Object.entries(index).map(([code, position]) => [position, code]));
	});
	return Object.entries(dataset.value ?? {}).map(([flatIndex, value]) => {
		let rest = Number(flatIndex);
		const row = { value };
		for (let i = ids.length - 1; i >= 0; i--) {
			row[ids[i]] = codesByDim[i][rest % dataset.size[i]];
			rest = Math.floor(rest / dataset.size[i]);
		}
		return row;
	});
}

// Tonnes per product and partner. Comext reports quantities in 100 kg.
async function trade({ flow, freq, time, partner }) {
	const params = new URLSearchParams({ format: "JSON", reporter: "DE", flow, freq, time, indicators: "QUANTITY_IN_100KG" });
	if (partner) params.append("partner", partner);
	ALL_CODES.forEach((code) => params.append("product", code));
	return rows(await getJson(`${COMEXT}?${params}`)).map((row) => ({ product: row.product, partner: row.partner, tonnes: row.value / 10 }));
}

const isCountry = (partner) => /^[A-Z]{2}$/.test(partner) && !partner.startsWith("Q");
const round = (value) => Math.round(value);

function summarize(tradeRows, group, topCount) {
	const byPartner = new Map();
	for (const row of tradeRows) {
		if (!group.codes.includes(row.product) || !isCountry(row.partner)) continue;
		byPartner.set(row.partner, (byPartner.get(row.partner) ?? 0) + row.tonnes);
	}
	const total = [...byPartner.values()].reduce((sum, tonnes) => sum + tonnes, 0);
	const partners = [...byPartner.entries()]
		.sort((a, b) => b[1] - a[1])
		.slice(0, topCount)
		.map(([country, tonnes]) => [country, round(tonnes)]);
	return { total: round(total), partners };
}

async function latestCompleteYear() {
	const current = new Date().getFullYear();
	for (let year = current - 1; year >= current - 4; year--) {
		const december = await trade({ flow: "1", freq: "M", time: `${year}-12`, partner: "WORLD" });
		const tomatoes = december.find((row) => row.product === "07020000");
		if (tomatoes && tomatoes.tonnes > 1_000) return year;
	}
	throw new Error("no complete year with monthly import data found");
}

async function production(year) {
	const params = new URLSearchParams({ format: "JSON", geo: "DE", strucpro: "HPRD_HUMD_EU_THS_T", time: String(year) });
	const crops = new Map(rows(await getJson(`${PRODUCTION}?${params}`)).map((row) => [row.crops, row.value * 1000]));
	// Strawberries are only published together with vegetables.
	if (!crops.get("S0000") && crops.get("V0000_S0000") && crops.get("V0000")) crops.set("S0000", crops.get("V0000_S0000") - crops.get("V0000"));
	return crops;
}

const year = await latestCompleteYear();
console.log(`latest complete year: ${year}`);

const annualImports = await trade({ flow: "1", freq: "A", time: String(year) });
const monthlyImports = [];
for (let month = 1; month <= 12; month++) {
	const time = `${year}-${String(month).padStart(2, "0")}`;
	monthlyImports.push(await trade({ flow: "1", freq: "M", time }));
	console.log(`fetched ${time}`);
}
let productionYear = year;
let crops = await production(year);
if (![...crops.values()].some((value) => value > 0)) {
	productionYear = year - 1;
	crops = await production(productionYear);
}

const groups = GROUPS.map((group) => {
	const imports = summarize(annualImports, group, TOP_PARTNERS_YEAR);
	// A zero means "not published" in apro_cpsh1, so it is stored as unknown rather than 0 t.
	const produced = group.production.reduce((sum, code) => sum + (crops.get(code) ?? 0), 0);
	return {
		id: group.id,
		label: group.label,
		category: group.category,
		importOnly: group.importOnly === true,
		foods: group.foods,
		codes: group.codes,
		imports: imports.total,
		production: produced > 0 ? round(produced) : null,
		partners: imports.partners,
		monthly: monthlyImports.map((monthRows) => summarize(monthRows, group, TOP_PARTNERS_MONTH)),
	};
});

const result = {
	meta: {
		year,
		productionYear,
		fetched: new Date().toISOString().slice(0, 10),
		sources: {
			trade: "Eurostat Comext DS-045409 (Einfuhren nach Deutschland, Partnerland = Versendungsland)",
			production: "Eurostat apro_cpsh1 (Erntemenge in Deutschland)",
		},
	},
	groups,
};

await writeFile(OUTPUT, JSON.stringify(result) + "\n");
console.log(`wrote ${groups.length} groups to ${OUTPUT.pathname}`);
