// Copyright 2020-present numb86. All rights reserved. MIT license.

import { Asserts } from "./deps.ts";

import { createCapturedEvents } from "./create_captured_events.ts";
import { appendAst } from "./append_ast.ts";

const { assertEquals } = Asserts;

Deno.test("create_captured_events: assert(x)", () => {
  const assertFunction = "assert";

  const powerAssertContext = {
    source: {
      content: "assert(1)",
      filepath: "test/simple.js",
      line: 8,
    },
    args: [{ value: 1, events: [{ value: 1, espath: "arguments/0" }] }],
  };

  const appendedPowerAssertContext = appendAst(powerAssertContext);

  const expect = [
    {
      value: 1,
      leftIndex: assertFunction.length + 1,
    },
  ];

  assertEquals(createCapturedEvents(appendedPowerAssertContext), expect);
});

Deno.test("create_captured_events: equal(x, 2)", () => {
  const assertFunction = "equal";

  const powerAssertContext = {
    source: {
      content: `${assertFunction}(x, 2)`,
      filepath: "test/simple.js",
      line: 8,
    },
    args: [
      { value: 1, events: [{ value: 1, espath: "arguments/0" }] },
      { value: 2, events: [{ value: 2, espath: "arguments/1" }] },
    ],
  };

  const appendedPowerAssertContext = appendAst(powerAssertContext);

  const expect = [
    {
      value: 1,
      leftIndex: assertFunction.length + 1,
    },
    {
      value: 2,
      leftIndex: assertFunction.length + 4,
    },
  ];

  assertEquals(createCapturedEvents(appendedPowerAssertContext), expect);
});

Deno.test("create_captured_events: equal(x.y() === 3, z)", () => {
  const assertFunction = "equal";
  const y = () => 1;

  const powerAssertContext = {
    source: {
      content: `${assertFunction}(x.y() === 3, z)`,
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

  const appendedPowerAssertContext = appendAst(powerAssertContext);

  const expect = [
    {
      value: false,
      leftIndex: assertFunction.length + 7,
    },
    {
      value: 1,
      leftIndex: assertFunction.length + 3,
    },
    {
      value: { y },
      leftIndex: assertFunction.length + 1,
    },
    {
      value: 1,
      leftIndex: assertFunction.length + 14,
    },
  ];

  assertEquals(createCapturedEvents(appendedPowerAssertContext), expect);
});

Deno.test("create_captured_events: equal(await Promise.resolve(x), await Promise.resolve(y))", () => {
  const assertFunction = "equal";

  const powerAssertContext = {
    source: {
      content:
        `${assertFunction}(await Promise.resolve(x), await Promise.resolve(y))`,
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

  const appendedPowerAssertContext = appendAst(powerAssertContext);

  const expect = [
    {
      value: 1,
      leftIndex: assertFunction.length + 1,
    },
    {
      value: Promise,
      leftIndex: assertFunction.length + 7,
    },
    {
      value: 1,
      leftIndex: assertFunction.length + 23,
    },
    {
      value: 2,
      leftIndex: assertFunction.length + 27,
    },
    {
      value: Promise,
      leftIndex: assertFunction.length + 33,
    },
    {
      value: 2,
      leftIndex: assertFunction.length + 49,
    },
  ];

  assertEquals(createCapturedEvents(appendedPowerAssertContext), expect);
});

Deno.test("create_captured_events: equal(x = 1, 2)", () => {
  const assertFunction = "equal";

  const powerAssertContext = {
    source: {
      content: `${assertFunction}(x = 1, 2)`,
      filepath: "test/simple.js",
      line: 8,
    },
    args: [
      { value: 1, events: [{ value: 1, espath: "arguments/0" }] },
      { value: 2, events: [{ value: 2, espath: "arguments/1" }] },
    ],
  };

  const appendedPowerAssertContext = appendAst(powerAssertContext);

  const expect = [
    {
      value: 1,
      leftIndex: assertFunction.length + 3,
    },
    {
      value: 2,
      leftIndex: assertFunction.length + 8,
    },
  ];

  assertEquals(createCapturedEvents(appendedPowerAssertContext), expect);
});

Deno.test("create_captured_events: assert(x[y] === 2)", () => {
  const assertFunction = "assert";

  const powerAssertContext = {
    source: {
      content: `${assertFunction}(x[y] === 2)`,
      filepath: "test/simple.js",
      line: 9,
    },
    args: [{
      value: false,
      events: [
        { value: { a: 1 }, espath: "arguments/0/left/object" },
        { value: "a", espath: "arguments/0/left/property" },
        { value: 1, espath: "arguments/0/left" },
        { value: false, espath: "arguments/0" },
      ],
    }],
  };

  const appendedPowerAssertContext = appendAst(powerAssertContext);

  const expect = [
    {
      value: false,
      leftIndex: assertFunction.length + 6,
    },
    {
      value: 1,
      leftIndex: assertFunction.length + 2,
    },
    {
      value: { a: 1 },
      leftIndex: assertFunction.length + 1,
    },
    {
      value: "a",
      leftIndex: assertFunction.length + 3,
    },
  ];

  assertEquals(createCapturedEvents(appendedPowerAssertContext), expect);
});

Deno.test("create_captured_events: equal([...x.y], z)", () => {
  const assertFunction = "equal";

  const powerAssertContext = {
    source: {
      content: `${assertFunction}([...x.y], z)`,
      filepath: "test/simple.js",
      line: 9,
    },
    args: [
      {
        value: [1, 2],
        events: [
          {
            value: { y: [1, 2] },
            espath: "arguments/0/elements/0/argument/object",
          },
          { value: [1, 2], espath: "arguments/0/elements/0/argument" },
          { value: [1, 2], espath: "arguments/0" },
        ],
      },
      { value: 2, events: [{ value: 2, espath: "arguments/1" }] },
    ],
  };

  const appendedPowerAssertContext = appendAst(powerAssertContext);

  const expect = [
    {
      value: [1, 2],
      leftIndex: assertFunction.length + 1,
    },
    {
      value: [1, 2],
      leftIndex: assertFunction.length + 7,
    },
    {
      value: { y: [1, 2] },
      leftIndex: assertFunction.length + 5,
    },
    {
      value: 2,
      leftIndex: assertFunction.length + 11,
    },
  ];

  assertEquals(createCapturedEvents(appendedPowerAssertContext), expect);
});
