export type FoodDetail = {
	summary: string;
	tip: string;
	storage: string;
	sources: Array<{ label: string; url: string }>;
};

// Curated texts for selected foods. Import origins come from src/data/trade.json.
export const foodDetails: Record<string, FoodDetail> = {
	Apfel: {
		summary:
			"Äpfel werden in Deutschland im Spätsommer und Herbst geerntet. Kontrollierte Lagerung verlängert das heimische Angebot weit ins Frühjahr.",
		tip: "Für kurze Wege im Herbst nach regionaler Freilandware fragen; im Winter ist deutscher Lagerapfel oft die naheliegende Wahl.",
		storage: "Kühl, dunkel und getrennt von empfindlichem Gemüse lagern. Äpfel geben Ethylen ab und beschleunigen dessen Reifung.",
		sources: [
			{ label: "BZfE Saisonkalender", url: "https://www.bzfe.de/kueche-und-alltag/einkaufen/der-saisonkalender" },
			{ label: "Destatis Außenhandel", url: "https://genesis.destatis.de/datenbank/online/statistic/51000/table/51000-0018" },
		],
	},
	Tomate: {
		summary: "Die deutsche Freilandzeit ist kurz. Der Handel deckt die Nachfrage überwiegend mit Gewächshausware und Importen.",
		tip: "Im Hochsommer deutsche Freilandtomaten wählen. Außerhalb der Saison geben Herkunft und Anbauart mehr Orientierung als die Entfernung allein.",
		storage: "Nicht in den Kühlschrank legen; bei Zimmertemperatur und getrennt von druckempfindlichem Gemüse aufbewahren.",
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
		sources: [
			{ label: "BZfE Saisonkalender", url: "https://www.bzfe.de/kueche-und-alltag/einkaufen/der-saisonkalender" },
			{ label: "Eurostat Handelsdaten", url: "https://ec.europa.eu/eurostat/web/international-trade-in-goods/overview" },
		],
	},
};
