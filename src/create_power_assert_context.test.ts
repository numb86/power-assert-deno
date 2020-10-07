// Copyright 2020-present numb86. All rights reserved. MIT license.

import { Asserts } from "./deps.ts";

import { createPowerAssertContext } from "./create_power_assert_context.ts";

const { assertEquals } = Asserts;

Deno.test("create_power_assert_context: assert(1)", () => {
  const arg1 = {
    powerAssertContext: {
      value: 1,
      events: [{ value: 1, espath: "arguments/0" }],
    },
    source: {
      content: "assert(1)",
      filepath: "test/simple.js",
      line: 8,
    },
  };

  const expect = {
    source: {
      content: "assert(1)",
      filepath: "test/simple.js",
      line: 8,
    },
    args: [{ value: 1, events: [{ value: 1, espath: "arguments/0" }] }],
  };

  assertEquals(createPowerAssertContext(arg1), expect);
});

Deno.test("create_power_assert_context: equal(x, 2)", () => {
  const arg1 = {
    powerAssertContext: {
      value: 1,
      events: [{ value: 1, espath: "arguments/0" }],
    },
    source: {
      content: "equal(x, 2)",
      filepath: "test/simple.js",
      line: 3,
    },
  };

  const arg2 = {
    powerAssertContext: {
      value: 2,
      events: [{ value: 2, espath: "arguments/1" }],
    },
    source: {
      content: "equal(x, 2)",
      filepath: "test/simple.js",
      line: 3,
    },
  };

  const expect = {
    source: {
      content: "equal(x, 2)",
      filepath: "test/simple.js",
      line: 3,
    },
    args: [
      { value: 1, events: [{ value: 1, espath: "arguments/0" }] },
      { value: 2, events: [{ value: 2, espath: "arguments/1" }] },
    ],
  };

  assertEquals(createPowerAssertContext(arg1, arg2), expect);
});

Deno.test("create_power_assert_context: equal(x.y() === 3, z)", () => {
  const y = () => 1;

  const arg1 = {
    powerAssertContext: {
      value: false,
      events: [
        { value: { y }, espath: "arguments/0/left/callee/object" },
        { value: 1, espath: "arguments/0/left" },
        { value: false, espath: "arguments/0" },
      ],
    },
    source: {
      content: "equal(x.y() === 3, z)",
      filepath: "test/simple.js",
      line: 9,
    },
  };

  const arg2 = {
    powerAssertContext: {
      value: 1,
      events: [{ value: 1, espath: "arguments/1" }],
    },
    source: {
      content: "equal(x.y() === 3, z)",
      filepath: "test/simple.js",
      line: 9,
    },
  };

  const expect = {
    source: {
      content: "equal(x.y() === 3, z)",
      filepath: "test/simple.js",
      line: 9,
    },
    args: [
      {
        value: false,
        events: [
          { value: { y }, espath: "arguments/0/left/callee/object" },
          { value: 1, espath: "arguments/0/left" },
          { value: false, espath: "arguments/0" },
        ],
      },
      { value: 1, events: [{ value: 1, espath: "arguments/1" }] },
    ],
  };

  assertEquals(createPowerAssertContext(arg1, arg2), expect);
});

Deno.test("create_power_assert_context: equal(await Promise.resolve(x), await Promise.resolve(y))", () => {
  const arg1 = {
    powerAssertContext: {
      value: 1,
      events: [
        { value: Promise, espath: "arguments/0/argument/callee/object" },
        { value: 1, espath: "arguments/0/argument/arguments/0" },
        { value: 1, espath: "arguments/0" },
      ],
    },
    source: {
      content: "equal(await Promise.resolve(x), await Promise.resolve(y))",
      filepath: "test/simple.js",
      line: 9,
      async: true,
    },
  };

  const arg2 = {
    powerAssertContext: {
      value: 2,
      events: [
        { value: Promise, espath: "arguments/1/argument/callee/object" },
        { value: 2, espath: "arguments/1/argument/arguments/0" },
        { value: 2, espath: "arguments/1" },
      ],
    },
    source: {
      content: "equal(await Promise.resolve(x), await Promise.resolve(y))",
      filepath: "test/simple.js",
      line: 9,
      async: true,
    },
  };

  const expect = {
    source: {
      content: "equal(await Promise.resolve(x), await Promise.resolve(y))",
      filepath: "test/simple.js",
      line: 9,
      async: true,
    },
    args: [
      {
        value: 1,
        events: [
          { value: Promise, espath: "arguments/0/argument/callee/object" },
          { value: 1, espath: "arguments/0/argument/arguments/0" },
          { value: 1, espath: "arguments/0" },
        ],
      },
      {
        value: 2,
        events: [
          { value: Promise, espath: "arguments/1/argument/callee/object" },
          { value: 2, espath: "arguments/1/argument/arguments/0" },
          { value: 2, espath: "arguments/1" },
        ],
      },
    ],
  };

  assertEquals(createPowerAssertContext(arg1, arg2), expect);
});
