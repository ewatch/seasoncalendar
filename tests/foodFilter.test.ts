import test from "node:test";
import assert from "node:assert/strict";

import {
	getAvailableInMonth,
	getMonthDisplayName,
	getNextMonth,
	getPreviousMonth,
	getYearForMonth,
	normalizeMonthAbbreviation,
} from "../src/utils/foodFilter";

const fixtureData = {
	availability: {
		vegetables: {
			Kartoffel: {
				freiland_months: ["MRZ"],
				lager_months: [],
				icon: "",
				link: "",
			},
		},
		fruits: {
			Apfel: {
				freiland_months: [],
				lager_months: ["MRZ"],
				icon: "",
				link: "",
			},
		},
		herbs: {},
		salads: {},
	},
};

test("normalizes German March variants", () => {
	assert.equal(normalizeMonthAbbreviation("MRZ"), "MRZ");
	assert.equal(normalizeMonthAbbreviation("M\u00c4R"), "MRZ");
	assert.equal(normalizeMonthAbbreviation("MAR"), "MRZ");
});

test("returns correct month display names", () => {
	assert.equal(getMonthDisplayName("MRZ"), "M\u00e4rz");
	assert.equal(getMonthDisplayName("M\u00c4R"), "M\u00e4rz");
});

test("finds available food in March aliases", () => {
	const dataByMrz = getAvailableInMonth(fixtureData, "MRZ");
	const dataByMaer = getAvailableInMonth(fixtureData, "M\u00c4R");

	assert.equal(dataByMrz.vegetables.length, 1);
	assert.equal(dataByMrz.fruits.length, 1);
	assert.equal(dataByMaer.vegetables.length, 1);
	assert.equal(dataByMaer.fruits.length, 1);
});

test("navigates months across year boundaries", () => {
	assert.equal(getPreviousMonth("JAN"), "DEZ");
	assert.equal(getNextMonth("DEZ"), "JAN");
	assert.equal(getYearForMonth("JAN", "DEZ", 2026), 2027);
	assert.equal(getYearForMonth("DEZ", "JAN", 2026), 2025);
});
