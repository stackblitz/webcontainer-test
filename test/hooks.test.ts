import { afterEach, beforeEach, expect } from "vitest";
import { test, type TestContext } from "../src";

beforeEach<TestContext>(({ preview, webcontainer }) => {
  expect(preview.getByRole).toBeTypeOf("function");
  expect(webcontainer.mount).toBeTypeOf("function");
});

afterEach<TestContext>(({ preview, webcontainer }) => {
  expect(preview.getByRole).toBeTypeOf("function");
  expect(webcontainer.mount).toBeTypeOf("function");
});

test("fixtures are available in hooks", () => {
  // no-op
});
