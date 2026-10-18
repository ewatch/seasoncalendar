# Datenkonzept für Lebensmittel-Details

## Zielbild

Die Detailansicht trennt drei Fragen, die nicht mit derselben Datenquelle beantwortet werden können:

1. **Wann wächst oder lagert das Lebensmittel in Deutschland?**
2. **Wann und aus welchen Ländern wird es nach Deutschland eingeführt?**
3. **Wie gelangt eine konkrete Ware in den Laden?**

Der Prototyp beantwortet 1 für alle vorhandenen Lebensmittel. Für Apfel, Tomate und Erdbeere zeigt er zusätzlich, wie 2 redaktionell aussehen kann. Frage 3 ist mit öffentlicher Statistik allein nicht belastbar; dafür wären Lieferanten- oder Händlerdaten nötig.

## Empfohlene Quellen

| Information                                   | Quelle                                                                                                                                                                                                                         | Auflösung                                 | Eignung                                                          |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- | ---------------------------------------------------------------- |
| Heimische Freiland-, Lager- und Import-Saison | [BZfE/BLE Saisonkalender](https://www.bzfe.de/kueche-und-alltag/einkaufen/der-saisonkalender)                                                                                                                                  | Lebensmittel × Monat                      | Redaktionelle Basis und Plausibilitätsprüfung                    |
| Deutsche Einfuhren                            | [Destatis GENESIS, Tabelle 51000-0018](https://genesis.destatis.de/datenbank/online/statistic/51000/table/51000-0018)                                                                                                          | Monat × CN8-Ware × Land × Gewicht/Wert    | Beste Primärquelle für „wann aus welchem Land nach Deutschland“  |
| Harmonisierte EU-Handelsdaten                 | [Eurostat Comext](https://ec.europa.eu/eurostat/web/international-trade-in-goods/database) und [API-Anleitung](https://ec.europa.eu/eurostat/web/user-guides/data-browser/api-data-access/api-getting-started/comext-database) | Monat × Produkt × Meldeland × Partnerland | Automatisierbare Alternative/Validierung für Destatis            |
| Lebensmittelkunde und Lagerung                | [BZfE Lebensmittelkunde](https://www.bzfe.de/lebensmittel/lebensmittelkunde)                                                                                                                                                   | Lebensmittelartikel                       | Kurztexte, Einkauf und Aufbewahrung; redaktionell zusammenfassen |

## Vorgeschlagene Daten-Pipeline

1. Lebensmittel auf einen oder mehrere gültige CN8-Codes abbilden. Diese Zuordnung versionieren, da sich die Kombinierte Nomenklatur jährlich ändern kann.
2. Monatlich Einfuhrgewicht und -wert nach Ursprungs-/Versendungsland für Deutschland laden.
3. Einen rollierenden Drei-Jahres-Median bilden, damit einzelne Ernteausfälle oder Handelsverschiebungen nicht als feste „Saison“ erscheinen.
4. Länder pro Monat nach Gewichtsanteil ordnen und nur Herkunftsländer oberhalb einer transparenten Schwelle anzeigen.
5. Ergebnisse mit BZfE-Saisonmustern plausibilisieren, Datenstand und Methodik in jeder Detailansicht ausweisen.

## Empfohlenes Datenmodell pro Lebensmittel

```ts
{
  id, name, category,
  season: { outdoorMonths, storageMonths, source, updatedAt },
  imports: [{ month, originCountry, kilograms, share, source, period }],
  knowledge: { summary, buyingTip, storageTip, source, reviewedAt },
  commodityCodes: [{ scheme: "CN8", code, validFrom, validTo }]
}
```

## Grenzen und Formulierungen

-   Außenhandelsdaten belegen einen Grenzübertritt, nicht Transportmittel, Hof, Zwischenlager oder einzelne Supermarktcharge.
-   Partnerland, Versendungsland und Ursprungsland sind nicht immer dasselbe. Die UI muss die verwendete Dimension nennen.
-   Gewächshaus, beheiztes Gewächshaus und Freiland lassen sich aus CN8-Handelsdaten nicht ablesen.
-   Monatswerte werden mit Verzögerung veröffentlicht und können revidiert werden. Immer Datenstand und Betrachtungszeitraum zeigen.
-   „Typische Herkunft“ oder „statistisch häufige Herkunft“ ist belastbarer als „wird geliefert aus“.
-   BZfE-Inhalte nicht ungeprüft kopieren. Lizenz-/Nutzungskennzeichnung der konkreten Seite bzw. Publikation prüfen und eigene Kurztexte mit Quellenhinweis verwenden.

## Nächster belastbarer Ausbau

Zuerst 10 stark gesuchte Lebensmittel auswählen, deren CN8-Zuordnung fachlich prüfen und für sie einen automatisierten Importdatensatz erzeugen. Danach Suchanfragen und Detailaufrufe messen, bevor alle Lebensmittel redaktionell angereichert werden.

## Datenprüfung Oktober 2026

**Befund:** Die Saisondaten in `src/locales/de/food-calendar.json` wichen bei 67 von 103 Lebensmitteln von der angegebenen Quelle (EatSmarter-Saisonkalender 2021) ab, Rucola fehlte. Auffällige Beispiele: Süßkartoffel als deutsche Lagerware von Januar bis August, Feldsalat als Lagerware, Steckrübe und Porree mit falschen Lager-/Freilandmonaten, Kresse und Rosmarin vertauscht, Chicorée invertiert. Alle 92 BZfE-Links (`/lebensmittel/lebensmittelkunde/...`) lieferten 404.

**Vorgehen:**

1. Freiland-/Lagermonate direkt aus den Vektorflächen der EatSmarter-PDF ausgelesen (dunkelgrün = Freiland, hellgrün = Lager) und stichprobenartig mit der gerenderten Seite verglichen.
2. JSON neu befüllt; danach 104 von 104 Einträgen identisch mit der Vorlage.
3. Plausibilitätsprüfung gegen den BZfE-Saisonkalender („Monat mit großem Angebot aus heimischem Anbau“, schraffierte Monate per Rasterauswertung). Ergebnis: weitgehend konsistent. Abweichungen erklären sich durch unterschiedliche Definitionen:
    - BZfE zählt geschützten Anbau (Gewächshaus/Folie) als heimisch, EatSmarter nur Freiland – daher längere BZfE-Saison bei Tomate, Salatgurke, Kopfsalat, Feldsalat, Erdbeere, Spinat.
    - Kleine Lagermengen im Winter (Kürbisse, Nüsse) markiert BZfE nicht als „großes Angebot“.
4. Links auf existierende BZfE-„How to“-Seiten umgestellt, sonst auf die BZfE-Suche zum Lebensmittel (72 eindeutige URLs, alle erreichbar).

**Offene Punkte:**

-   Champignons und Kresse stehen bei EatSmarter ganzjährig als „Freiland“, werden aber überwiegend in Hallen bzw. unter Glas erzeugt. Eine dritte Kategorie „geschützter Anbau“ würde das sauber abbilden.
-   Nutzungsrechte: Die BLE-/BZfE-Poster untersagen eine Weiterverwendung ohne Zustimmung und wurden deshalb nur zur Plausibilisierung genutzt. Für die EatSmarter-Vorlage sollte die Nutzung ebenfalls geklärt oder mittelfristig eine eigene, quellenbelegte Zusammenstellung aufgebaut werden.
