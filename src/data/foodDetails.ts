export type FoodDetail = {
	summary: string;
	tip: string;
	storage: string;
	supplyNote: string;
	origins: Array<{ country: string; months: string; route: string }>;
	sources: Array<{ label: string; url: string }>;
};

// Curated proof-of-concept records. Origin windows are deliberately described as
// typical rather than live facts; production data should come from monthly trade quantities.
export const foodDetails: Record<string, FoodDetail> = {
	Apfel: {
		summary:
			"Äpfel werden in Deutschland im Spätsommer und Herbst geerntet. Kontrollierte Lagerung verlängert das heimische Angebot weit ins Frühjahr.",
		tip: "Für kurze Wege im Herbst nach regionaler Freilandware fragen; im Winter ist deutscher Lagerapfel oft die naheliegende Wahl.",
		storage: "Kühl, dunkel und getrennt von empfindlichem Gemüse lagern. Äpfel geben Ethylen ab und beschleunigen dessen Reifung.",
		supplyNote: "Typische Herkunftskorridore im deutschen Handel – als Orientierung, nicht als Live-Lieferverfolgung.",
		origins: [
			{ country: "Deutschland", months: "Aug–Mai", route: "Ernte + Kühllager · regional/Lkw" },
			{ country: "Italien & Polen", months: "ganzjährig", route: "Straße · EU-Binnenhandel" },
			{ country: "Neuseeland & Chile", months: "Apr–Aug", route: "Kühlcontainer · Schiff" },
		],
		sources: [
			{ label: "BZfE Saisonkalender", url: "https://www.bzfe.de/kueche-und-alltag/einkaufen/der-saisonkalender" },
			{ label: "Destatis Außenhandel", url: "https://genesis.destatis.de/datenbank/online/statistic/51000/table/51000-0018" },
		],
	},
	Tomate: {
		summary: "Die deutsche Freilandzeit ist kurz. Der Handel deckt die Nachfrage überwiegend mit Gewächshausware und Importen.",
		tip: "Im Hochsommer deutsche Freilandtomaten wählen. Außerhalb der Saison geben Herkunft und Anbauart mehr Orientierung als die Entfernung allein.",
		storage: "Nicht in den Kühlschrank legen; bei Zimmertemperatur und getrennt von druckempfindlichem Gemüse aufbewahren.",
		supplyNote: "Die Herkunft verschiebt sich saisonal zwischen nördlichen Gewächshausregionen und südlichen Freiland- oder Folienregionen.",
		origins: [
			{ country: "Deutschland", months: "Jul–Okt", route: "Freiland/geschützter Anbau · Lkw" },
			{ country: "Niederlande", months: "Mrz–Nov", route: "Gewächshaus · Lkw" },
			{ country: "Spanien & Marokko", months: "Okt–Mai", route: "Freiland/Folie · Lkw/Fähre" },
		],
		sources: [
			{ label: "BZfE Saisonkalender", url: "https://www.bzfe.de/kueche-und-alltag/einkaufen/der-saisonkalender" },
			{ label: "Eurostat Comext", url: "https://ec.europa.eu/eurostat/web/international-trade-in-goods/database" },
		],
	},
	Erdbeere: {
		summary:
			"Deutsche Erdbeeren haben ihre stärkste Zeit im Frühsommer. Frühe und späte Angebote stammen häufiger aus geschütztem Anbau oder dem Ausland.",
		tip: "Für Aroma und kurze Wege auf die deutsche Hauptsaison von Mai bis Juli warten und das Herkunftsetikett prüfen.",
		storage: "Ungewaschen, kühl und möglichst einlagig lagern; erst direkt vor dem Essen waschen.",
		supplyNote: "Empfindliche Beeren benötigen eine schnelle Kühlkette. Importfenster zeigen typische Marktphasen, keine einzelne Charge.",
		origins: [
			{ country: "Deutschland", months: "Mai–Jul", route: "Feld/Tunnel · kurze Kühlkette" },
			{ country: "Spanien", months: "Jan–Mai", route: "Kühl-Lkw" },
			{ country: "Niederlande & Belgien", months: "Apr–Sep", route: "Gewächshaus · Kühl-Lkw" },
		],
		sources: [
			{ label: "BZfE Saisonkalender", url: "https://www.bzfe.de/kueche-und-alltag/einkaufen/der-saisonkalender" },
			{ label: "Eurostat Handelsdaten", url: "https://ec.europa.eu/eurostat/web/international-trade-in-goods/overview" },
		],
	},
};
