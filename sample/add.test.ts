import { assert } from "../mod.ts";
import { add } from "./add.ts";

Deno.test("sample/add.test.ts: assert(x > y, 'custom message')", () => {
  const x = 1;
  const y = 2;
  assert(x > y, "custom message");
});

Deno.test("sample/add.test.ts: assert(add(x, y) === 4)", () => {
  function run() {
    const x = 1;
    const y = 2;
    assert(add(x, y) === 4);
  }
  run();
});
