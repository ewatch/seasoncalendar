type MonthAbbreviation = "JAN" | "FEB" | "MRZ" | "APR" | "MAI" | "JUN" | "JUL" | "AUG" | "SEP" | "OKT" | "NOV" | "DEZ";

type FoodItem = {
	freiland_months?: string[];
	lager_months?: string[];
	icon?: string;
	link?: string;
};

type FoodAvailability = Record<string, Record<string, FoodItem>>;

type FoodData = {
	availability: FoodAvailability;
};

type AvailabilityType = "freiland" | "lager" | "both";

type AvailableFoodItem = {
	name: string;
	details: FoodItem;
	availabilityType: AvailabilityType;
};

type AvailableInMonth = {
	vegetables: AvailableFoodItem[];
	fruits: AvailableFoodItem[];
	herbs: AvailableFoodItem[];
	salads: AvailableFoodItem[];
};

type GetAvailableOptions = {
	onlyFreiland?: boolean;
};

const monthAliasMap: Record<string, MonthAbbreviation> = {
	JAN: "JAN",
	FEB: "FEB",
	MAR: "MRZ",
	MÄR: "MRZ",
	MRZ: "MRZ",
	APR: "APR",
	MAI: "MAI",
	JUN: "JUN",
	JUL: "JUL",
	AUG: "AUG",
	SEP: "SEP",
	OKT: "OKT",
	NOV: "NOV",
	DEZ: "DEZ",
};

export const getAvailableInMonth = function (data: FoodData, month: string, options: GetAvailableOptions = {}): AvailableInMonth {
	const normalizedMonth = normalizeMonthAbbreviation(month);
	const onlyFreiland = options.onlyFreiland === true;
	const availableInMonth: AvailableInMonth = {
		vegetables: [],
		fruits: [],
		herbs: [],
		salads: [],
	};

	for (const category in data.availability) {
		for (const item in data.availability[category]) {
			const itemData = data.availability[category][item];
			const isFreiland = itemData.freiland_months?.includes(normalizedMonth) ?? false;
			const isLager = itemData.lager_months?.includes(normalizedMonth) ?? false;
			const isAvailable = isFreiland || isLager;

			if (!isAvailable) {
				continue;
			}

			if (onlyFreiland && !isFreiland) {
				continue;
			}

			const availabilityType: AvailabilityType = isFreiland && isLager ? "both" : isFreiland ? "freiland" : "lager";
			const itemWithType: AvailableFoodItem = {
				name: item,
				details: itemData,
				availabilityType,
			};

			if (category === "vegetables") {
				availableInMonth.vegetables.push(itemWithType);
				continue;
			}

			if (category === "fruits") {
				availableInMonth.fruits.push(itemWithType);
				continue;
			}

			if (category === "herbs") {
				availableInMonth.herbs.push(itemWithType);
				continue;
			}

			if (category === "salads") {
				availableInMonth.salads.push(itemWithType);
			}
		}
	}

	return availableInMonth;
};

// Mapping for German month abbreviations to full month names
const monthMapping: Record<MonthAbbreviation, string> = {
	JAN: "Januar",
	FEB: "Februar",
	MRZ: "M\u00e4rz",
	APR: "April",
	MAI: "Mai",
	JUN: "Juni",
	JUL: "Juli",
	AUG: "August",
	SEP: "September",
	OKT: "Oktober",
	NOV: "November",
	DEZ: "Dezember",
};

export const normalizeMonthAbbreviation = function (monthAbbr: string): MonthAbbreviation {
	const normalized = monthAliasMap[monthAbbr.toUpperCase()];
	return normalized ?? "JAN";
};

/*
The function will return the month as german three letter 
capital abbreviation with one of the following values depending on the current month:
["JAN", "FEB", "MAR", "APR", "MAI", "JUN", "JUL", "AUG", "SEP", "OKT", "NOV", "DEZ"]
*/
export const getCurrentMonth = function (): MonthAbbreviation {
	const date = new Date();
	const month = date.toLocaleString("de-DE", { month: "short" }).toUpperCase();
	return normalizeMonthAbbreviation(month);
};

/*
Returns the full German month name for display purposes
*/
export const getCurrentMonthDisplayName = function (): string {
	const monthAbbr = getCurrentMonth();
	return monthMapping[monthAbbr] ?? monthAbbr;
};

/*
Converts a month abbreviation to its full German name
*/
export const getMonthDisplayName = function (monthAbbr: string): string {
	const normalizedMonth = normalizeMonthAbbreviation(monthAbbr);
	return monthMapping[normalizedMonth] ?? normalizedMonth;
};

// Array of month abbreviations in order
const monthOrder: MonthAbbreviation[] = ["JAN", "FEB", "MRZ", "APR", "MAI", "JUN", "JUL", "AUG", "SEP", "OKT", "NOV", "DEZ"];

/*
Gets the previous month abbreviation
*/
export const getPreviousMonth = function (currentMonthAbbr: string): MonthAbbreviation {
	const normalizedCurrentMonth = normalizeMonthAbbreviation(currentMonthAbbr);
	const currentIndex = monthOrder.indexOf(normalizedCurrentMonth);
	const previousIndex = currentIndex === 0 ? monthOrder.length - 1 : currentIndex - 1;
	return monthOrder[previousIndex];
};

/*
Gets the next month abbreviation
*/
export const getNextMonth = function (currentMonthAbbr: string): MonthAbbreviation {
	const normalizedCurrentMonth = normalizeMonthAbbreviation(currentMonthAbbr);
	const currentIndex = monthOrder.indexOf(normalizedCurrentMonth);
	const nextIndex = currentIndex === monthOrder.length - 1 ? 0 : currentIndex + 1;
	return monthOrder[nextIndex];
};

/*
Calculates the year for a given month relative to the current month
This is useful for navigation to maintain the correct year when crossing year boundaries
*/
export const getYearForMonth = function (targetMonthAbbr: string, currentMonthAbbr: string, currentYear: number): number {
	const normalizedTargetMonth = normalizeMonthAbbreviation(targetMonthAbbr);
	const normalizedCurrentMonth = normalizeMonthAbbreviation(currentMonthAbbr);
	const targetIndex = monthOrder.indexOf(normalizedTargetMonth);
	const currentIndex = monthOrder.indexOf(normalizedCurrentMonth);

	if (currentIndex === 11 && targetIndex === 0) {
		return currentYear + 1;
	}

	if (currentIndex === 0 && targetIndex === 11) {
		return currentYear - 1;
	}

	return currentYear;
};
