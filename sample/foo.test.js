import { assertEquals } from "../mod.ts";
import { foo } from "./foo.js";

Deno.test("sample/foo.test.ts: assertEquals(foo(), x)", () => {
  const x = "foobar";
  assertEquals(foo(), x);
});

Deno.test("sample/foo.test.ts: try/catch", () => {
  try {
    assertEquals("a", "b");
  } catch (e) {
    assertEquals("a", "c");
  }
});
