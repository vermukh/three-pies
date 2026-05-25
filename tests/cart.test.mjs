import test from "node:test";
import assert from "node:assert/strict";
import { getCartSummary } from "../client/src/data.ts";

for (const id of ["apple", "baklava", "baklava-mini"]) {
  test(`dessert suggestion is hidden for ${id} and returns after removal`, () => {
    assert.equal(getCartSummary({ beef: 1, [id]: 1 }).hasDessert, true);
    assert.equal(getCartSummary({ beef: 1, [id]: 0 }).hasDessert, false);
    assert.equal(getCartSummary({ beef: 1 }).hasDessert, false);
  });
}

test("drinks do not replace dessert or count towards free pie delivery", () => {
  const summary = getCartSummary({ beef: 2, mors: 2, water: 1 });
  assert.equal(summary.hasDessert, false);
  assert.equal(summary.hasFreeDelivery, false);
  assert.equal(summary.deliveryPrice, 250);
  assert.equal(summary.total, 2400);
  assert.equal(summary.count, 5);
});

test("baklava does not count towards the three-pie offer", () => {
  const summary = getCartSummary({ beef: 2, baklava: 3 });
  assert.equal(summary.hasDessert, true);
  assert.equal(summary.deliveryPrice, 250);
});

test("delivery recalculates at two, three, four and back to two identical pies", () => {
  for (const [quantity, price] of [
    [2, 250],
    [3, 0],
    [4, 0],
    [2, 250],
  ]) {
    const summary = getCartSummary({ beef: quantity });
    assert.equal(summary.deliveryPrice, price);
    assert.equal(summary.total, quantity * 900);
  }
});

test("a mixed bundle including a sweet pie gets free delivery", () => {
  const summary = getCartSummary({ cheese: 1, beef: 1, apple: 1 });
  assert.equal(summary.hasFreeDelivery, true);
  assert.equal(summary.deliveryPrice, 0);
  assert.equal(summary.total, 2700);
  assert.equal(summary.hasDessert, true);
});

test("removing one of multiple desserts keeps the suggestion hidden", () => {
  assert.equal(getCartSummary({ apple: 0, baklava: 1 }).hasDessert, true);
  assert.equal(getCartSummary({ apple: 1, baklava: 0 }).hasDessert, true);
});

test("empty and unknown cart entries do not qualify for offers", () => {
  const summary = getCartSummary({ unknown: 3, apple: 0 });
  assert.equal(summary.hasDessert, false);
  assert.equal(summary.hasFreeDelivery, false);
  assert.equal(summary.count, 0);
  assert.equal(summary.total, 0);
  assert.deepEqual(summary.items, []);
});
