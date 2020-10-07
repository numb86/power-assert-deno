// Copyright 2020-present numb86. All rights reserved. MIT license.

import { Asserts } from "./deps.ts";

import { renderDiagram } from "./render_diagram.ts";
const { assertEquals } = Asserts;

Deno.test("render_diagram: equal(x, 2)", () => {
  const powerAssertContext = {
    source: {
      content: "equal(x, 2)",
      filepath: "test/simple.js",
      line: 8,
    },
    args: [
      { value: 1, events: [{ value: 1, espath: "arguments/0" }] },
      { value: 2, events: [{ value: 2, espath: "arguments/1" }] },
    ],
  };

  const expect = [
    "equal(x, 2)",
    "      |  | ",
    "      1  2 ",
  ];

  assertEquals(renderDiagram(powerAssertContext).split("\n"), expect);
});

Deno.test("render_diagram: equal(await Promise.resolve(x), await Promise.resolve(y))", () => {
  const powerAssertContext = {
    source: {
      content: `equal(await Promise.resolve(x), await Promise.resolve(y))`,
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

  const expect = [
    "equal(await Promise.resolve(x), await Promise.resolve(y))",
    "      |     |               |   |     |               |  ",
    "      1     #function#      1   2     #function#      2  ",
  ];

  assertEquals(renderDiagram(powerAssertContext).split("\n"), expect);
});

Deno.test("render_diagram: assert(x[y] === 2)", () => {
  const powerAssertContext = {
    source: {
      content: "assert(x[y] === 2)",
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

  const expect = [
    "assert(x[y] === 2)",
    "       |||  |     ",
    "       |||  false ",
    '       ||"a"      ',
    "       |1         ",
    "       Object{a:1}",
  ];

  assertEquals(renderDiagram(powerAssertContext).split("\n"), expect);
});

Deno.test("render_diagram: equal([...x.y], z)", () => {
  const powerAssertContext = {
    source: {
      content: "equal([...x.y], z)",
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

  const expect = [
    "equal([...x.y], z)",
    "      |   | |   | ",
    "      |   | |   2 ",
    "      |   | [1,2] ",
    "      |   Object{y:#Array#}",
    "      [1,2]       ",
  ];

  assertEquals(renderDiagram(powerAssertContext).split("\n"), expect);
});

Deno.test("render_diagram: full width character", () => {
  const powerAssertContext = {
    source: {
      content: "equal(x === y, z)",
      filepath: "test/simple.js",
      line: 10,
    },
    args: [
      {
        value: false,
        events: [
          {
            value: "日本語",
            espath: "arguments/0/left",
          },
          { value: "あいうえお", espath: "arguments/0/right" },
          { value: false, espath: "arguments/0" },
        ],
      },
      { value: "abc", events: [{ value: "abc", espath: "arguments/1" }] },
    ],
  };

  const expect = [
    "equal(x === y, z)",
    "      | |   |  | ",
    '      | |   |  "abc"',
    '      | |   "あいうえお"',
    "      | false    ",
    '      "日本語"   ',
  ];

  assertEquals(renderDiagram(powerAssertContext).split("\n"), expect);
});
