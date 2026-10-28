import assert from "node:assert/strict";
import test from "node:test";
import { verifyQuickCheckAnswer } from "./quickCheck.js";

test("verifies matching true and false answers", () => {
  assert.equal(
    verifyQuickCheckAnswer({ correct_answer: true }, "True"),
    true,
  );
  assert.equal(
    verifyQuickCheckAnswer({ correct_answer: false }, "No"),
    true,
  );
});

test("rejects incorrect answers", () => {
  assert.equal(
    verifyQuickCheckAnswer({ correct_answer: true }, "False"),
    false,
  );
});

test("does not verify missing or invalid answer keys or responses", () => {
  assert.equal(verifyQuickCheckAnswer({}, "True"), null);
  assert.equal(verifyQuickCheckAnswer({ correct_answer: "true" }, "True"), null);
  assert.equal(verifyQuickCheckAnswer({ correct_answer: 1 }, "True"), null);
  assert.equal(verifyQuickCheckAnswer({ correct_answer: true }, "Maybe"), null);
});
