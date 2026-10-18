import test from "node:test";
import assert from "node:assert/strict";

import foodData from "../src/locales/de/food-calendar.json";
import tradeData from "../src/data/trade.json";
import { domesticShare, formatTonnes, groupForFood, type TradeData, type TradeGroup } from "../src/utils/trade";

const trade = tradeData as TradeData;
const calendarFoods = new Set(Object.values(foodData.availability).flatMap((items) => Object.keys(items)));

test("every trade group refers to foods that exist in the calendar", () => {
	const unknown = trade.groups.flatMap((group) => group.foods).filter((food) => !calendarFoods.has(food));
	assert.deepEqual(unknown, []);
});

test("a calendar food belongs to at most one trade group", () => {
	const foods = trade.groups.flatMap((group) => group.foods);
	assert.equal(new Set(foods).size, foods.length);
});

test("finds the trade group for a calendar food", () => {
	assert.equal(groupForFood(trade, "Brokkoli")?.id, "blumenkohl");
	assert.equal(groupForFood(trade, "Bärlauch"), undefined);
});

test("has twelve months of import data per group", () => {
	trade.groups.forEach((group) => assert.equal(group.monthly.length, 12, group.id));
});

test("formats tonnes for German readers", () => {
	assert.equal(formatTonnes(752_149), "752.000 t");
	assert.equal(formatTonnes(1_347_554), "1,35 Mio. t");
	assert.equal(formatTonnes(382), "382 t");
});

test("German share is harvest divided by harvest plus imports", () => {
	const group = { production: 100, imports: 300 } as TradeGroup;
	assert.equal(domesticShare(group), 0.25);
	assert.equal(domesticShare({ production: null, imports: 300 } as TradeGroup), null);
});

test("every import-only food in the calendar has import data", () => {
	const missing = Object.keys(foodData.availability.imports).filter((food) => !groupForFood(trade, food));
	assert.deepEqual(missing, []);
});
