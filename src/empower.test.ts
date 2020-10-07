// Copyright 2020-present numb86. All rights reserved. MIT license.

import { empower, empowerAsync } from "./empower.ts";
import { Asserts } from "./deps.ts";

const FILE_PATH = "test/simple.js";
const LINE = 9;
const CUSTOM_MESSAGE = "custom message";

Deno.test("empower: assert", () => {
  const assert = empower(Asserts.assert);
  const args = [
    {
      powerAssertContext: {
        value: true,
        events: [{ value: true, espath: "arguments/0" }],
      },
      source: {
        content: `assert(1 === 1, '${CUSTOM_MESSAGE}')`,
        filepath: `${FILE_PATH}`,
        line: LINE,
      },
    },
    {
      powerAssertContext: {
        value: CUSTOM_MESSAGE,
        events: [{ value: CUSTOM_MESSAGE, espath: "arguments/1" }],
      },
      source: {
        content: `assert(1 === 1, '${CUSTOM_MESSAGE}')`,
        filepath: `${FILE_PATH}`,
        line: LINE,
      },
    },
  ];
  // deno-lint-ignore ban-ts-comment
  // @ts-ignore
  assert(...args);

  let poweredMessage;
  try {
    const args = [
      {
        powerAssertContext: {
          value: false,
          events: [{ value: false, espath: "arguments/0" }],
        },
        source: {
          content: `assert(1 === 2, '${CUSTOM_MESSAGE}')`,
          filepath: `${FILE_PATH}`,
          line: LINE,
        },
      },
      {
        powerAssertContext: {
          value: CUSTOM_MESSAGE,
          events: [{ value: CUSTOM_MESSAGE, espath: "arguments/1" }],
        },
        source: {
          content: `assert(1 === 2, '${CUSTOM_MESSAGE}')`,
          filepath: `${FILE_PATH}`,
          line: LINE,
        },
      },
    ];
    // deno-lint-ignore ban-ts-comment
    // @ts-ignore
    assert(...args);
  } catch (e) {
    poweredMessage = e.message;
  }

  const expect = [
    `${CUSTOM_MESSAGE}`,
    `${FILE_PATH}`,
    "",
    `assert(1 === 2, '${CUSTOM_MESSAGE}')`,
    "         |      |                ",
    `         false  "${CUSTOM_MESSAGE}" `,
    "",
  ];

  Asserts.assertEquals(poweredMessage.split("\n"), expect);
});

Deno.test("empower: assertEquals", () => {
  const assertEquals = empower(Asserts.assertEquals);
  const args = [
    {
      powerAssertContext: {
        value: 1,
        events: [{ value: 1, espath: "arguments/0" }],
      },
      source: {
        content: `assertEquals(x, y, '${CUSTOM_MESSAGE}');`,
        filepath: `${FILE_PATH}`,
        line: LINE,
      },
    },
    {
      powerAssertContext: {
        value: 1,
        events: [{ value: 1, espath: "arguments/1" }],
      },
      source: {
        content: `assertEquals(x, y, '${CUSTOM_MESSAGE}');`,
        filepath: `${FILE_PATH}`,
        line: LINE,
      },
    },
    {
      powerAssertContext: {
        value: CUSTOM_MESSAGE,
        events: [{ value: CUSTOM_MESSAGE, espath: "arguments/2" }],
      },
      source: {
        content: `assertEquals(x, y, '${CUSTOM_MESSAGE}');`,
        filepath: `${FILE_PATH}`,
        line: LINE,
      },
    },
  ];
  // deno-lint-ignore ban-ts-comment
  // @ts-ignore
  assertEquals(...args);

  let poweredMessage;
  try {
    const args = [
      {
        powerAssertContext: {
          value: 1,
          events: [{ value: 1, espath: "arguments/0" }],
        },
        source: {
          content: `assertEquals(x, y, '${CUSTOM_MESSAGE}');`,
          filepath: `${FILE_PATH}`,
          line: LINE,
        },
      },
      {
        powerAssertContext: {
          value: 2,
          events: [{ value: 2, espath: "arguments/1" }],
        },
        source: {
          content: `assertEquals(x, y, '${CUSTOM_MESSAGE}');`,
          filepath: `${FILE_PATH}`,
          line: LINE,
        },
      },
      {
        powerAssertContext: {
          value: CUSTOM_MESSAGE,
          events: [{ value: CUSTOM_MESSAGE, espath: "arguments/2" }],
        },
        source: {
          content: `assertEquals(x, y, '${CUSTOM_MESSAGE}');`,
          filepath: `${FILE_PATH}`,
          line: LINE,
        },
      },
    ];
    // deno-lint-ignore ban-ts-comment
    // @ts-ignore
    assertEquals(...args);
  } catch (e) {
    poweredMessage = e.message;
  }

  const expect = [
    `${CUSTOM_MESSAGE}`,
    `${FILE_PATH}`,
    "",
    `assertEquals(x, y, '${CUSTOM_MESSAGE}');`,
    "             |  |  |                 ",
    `             1  2  "${CUSTOM_MESSAGE}"  `,
    "",
  ];

  Asserts.assertEquals(poweredMessage.split("\n"), expect);
});

Deno.test("empower: assertNotEquals", () => {
  const assertNotEquals = empower(Asserts.assertNotEquals);
  const args = [
    {
      powerAssertContext: {
        value: 1,
        events: [{ value: 1, espath: "arguments/0" }],
      },
      source: {
        content: `assertNotEquals(x, y, '${CUSTOM_MESSAGE}');`,
        filepath: `${FILE_PATH}`,
        line: LINE,
      },
    },
    {
      powerAssertContext: {
        value: 2,
        events: [{ value: 2, espath: "arguments/1" }],
      },
      source: {
        content: `assertNotEquals(x, y, '${CUSTOM_MESSAGE}');`,
        filepath: `${FILE_PATH}`,
        line: LINE,
      },
    },
    {
      powerAssertContext: {
        value: CUSTOM_MESSAGE,
        events: [{ value: CUSTOM_MESSAGE, espath: "arguments/2" }],
      },
      source: {
        content: `assertNotEquals(x, y, '${CUSTOM_MESSAGE}');`,
        filepath: `${FILE_PATH}`,
        line: LINE,
      },
    },
  ];
  // deno-lint-ignore ban-ts-comment
  // @ts-ignore
  assertNotEquals(...args);

  let poweredMessage;
  try {
    const args = [
      {
        powerAssertContext: {
          value: 1,
          events: [{ value: 1, espath: "arguments/0" }],
        },
        source: {
          content: `assertNotEquals(x, y, '${CUSTOM_MESSAGE}');`,
          filepath: `${FILE_PATH}`,
          line: LINE,
        },
      },
      {
        powerAssertContext: {
          value: 1,
          events: [{ value: 1, espath: "arguments/1" }],
        },
        source: {
          content: `assertNotEquals(x, y, '${CUSTOM_MESSAGE}');`,
          filepath: `${FILE_PATH}`,
          line: LINE,
        },
      },
      {
        powerAssertContext: {
          value: CUSTOM_MESSAGE,
          events: [{ value: CUSTOM_MESSAGE, espath: "arguments/2" }],
        },
        source: {
          content: `assertNotEquals(x, y, '${CUSTOM_MESSAGE}');`,
          filepath: `${FILE_PATH}`,
          line: LINE,
        },
      },
    ];
    // deno-lint-ignore ban-ts-comment
    // @ts-ignore
    assertNotEquals(...args);
  } catch (e) {
    poweredMessage = e.message;
  }

  const expect = [
    `${CUSTOM_MESSAGE}`,
    `${FILE_PATH}`,
    "",
    `assertNotEquals(x, y, '${CUSTOM_MESSAGE}');`,
    "                |  |  |                 ",
    `                1  1  "${CUSTOM_MESSAGE}"  `,
    "",
  ];

  Asserts.assertEquals(poweredMessage.split("\n"), expect);
});

Deno.test("empower: assertStrictEquals", () => {
  const assertStrictEquals = empower(Asserts.assertStrictEquals);
  const x = { a: 1 };
  const y = x;

  const args = [
    {
      powerAssertContext: {
        value: x,
        events: [{ value: x, espath: "arguments/0" }],
      },
      source: {
        content: `assertStrictEquals(x, y);`,
        filepath: `${FILE_PATH}`,
        line: LINE,
      },
    },
    {
      powerAssertContext: {
        value: y,
        events: [{ value: y, espath: "arguments/1" }],
      },
      source: {
        content: `assertStrictEquals(x, y);`,
        filepath: `${FILE_PATH}`,
        line: LINE,
      },
    },
  ];
  // deno-lint-ignore ban-ts-comment
  // @ts-ignore
  assertStrictEquals(...args);

  let poweredMessage;
  try {
    const x = { a: 1 };
    const y = { a: 1 };
    const args = [
      {
        powerAssertContext: {
          value: x,
          events: [{ value: x, espath: "arguments/0" }],
        },
        source: {
          content: `assertStrictEquals(x, y);`,
          filepath: `${FILE_PATH}`,
          line: LINE,
        },
      },
      {
        powerAssertContext: {
          value: y,
          events: [{ value: y, espath: "arguments/1" }],
        },
        source: {
          content: `assertStrictEquals(x, y);`,
          filepath: `${FILE_PATH}`,
          line: LINE,
        },
      },
    ];
    // deno-lint-ignore ban-ts-comment
    // @ts-ignore
    assertStrictEquals(...args);
  } catch (e) {
    poweredMessage = e.message;
  }

  const expect = [
    `${FILE_PATH}`,
    "",
    "assertStrictEquals(x, y);",
    "                   |  |  ",
    "                   |  Object{a:1}",
    "                   Object{a:1}",
    "",
  ];

  const originalErrorMessage =
    "Values have the same structure but are not reference-equal:";
  Asserts.assertEquals(poweredMessage.split("\n")[0], originalErrorMessage);

  const result = poweredMessage.split("\n").slice(6);

  Asserts.assertEquals(result, expect);
});

Deno.test("empower: assertNotStrictEquals", () => {
  const assertNotStrictEquals = empower(Asserts.assertNotStrictEquals);
  const x = { a: 1 };
  const y = { a: 1 };

  const args = [
    {
      powerAssertContext: {
        value: x,
        events: [{ value: x, espath: "arguments/0" }],
      },
      source: {
        content: `assert(x, y);`,
        filepath: `${FILE_PATH}`,
        line: LINE,
      },
    },
    {
      powerAssertContext: {
        value: y,
        events: [{ value: y, espath: "arguments/1" }],
      },
      source: {
        content: `assert(x, y);`,
        filepath: `${FILE_PATH}`,
        line: LINE,
      },
    },
  ];
  // deno-lint-ignore ban-ts-comment
  // @ts-ignore
  assertNotStrictEquals(...args);

  let poweredMessage;
  try {
    const x = { a: 1 };
    const y = x;
    const args = [
      {
        powerAssertContext: {
          value: x,
          events: [{ value: x, espath: "arguments/0" }],
        },
        source: {
          content: `assert(x, y);`,
          filepath: `${FILE_PATH}`,
          line: LINE,
        },
      },
      {
        powerAssertContext: {
          value: y,
          events: [{ value: y, espath: "arguments/1" }],
        },
        source: {
          content: `assert(x, y);`,
          filepath: `${FILE_PATH}`,
          line: LINE,
        },
      },
    ];
    // deno-lint-ignore ban-ts-comment
    // @ts-ignore
    assertNotStrictEquals(...args);
  } catch (e) {
    poweredMessage = e.message;
  }

  const expect = [
    `${FILE_PATH}`,
    "",
    "assert(x, y);",
    "       |  |  ",
    "       |  Object{a:1}",
    "       Object{a:1}",
    "",
  ];

  const originalErrorMessage = 'Expected "actual" to be strictly unequal to: {';
  Asserts.assertEquals(poweredMessage.split("\n")[0], originalErrorMessage);

  const result = poweredMessage.split("\n").slice(4);

  Asserts.assertEquals(result, expect);
});

Deno.test("empower: assertStringContains", () => {
  const assertStringContains = empower(Asserts.assertStringContains);
  const x = "abc";
  const y = "abc";
  const args = [
    {
      powerAssertContext: {
        value: x,
        events: [{ value: x, espath: "arguments/0" }],
      },
      source: {
        content: `assertStringContains(x, y, '${CUSTOM_MESSAGE}');`,
        filepath: `${FILE_PATH}`,
        line: LINE,
      },
    },
    {
      powerAssertContext: {
        value: y,
        events: [{ value: y, espath: "arguments/1" }],
      },
      source: {
        content: `assertStringContains(x, y, '${CUSTOM_MESSAGE}');`,
        filepath: `${FILE_PATH}`,
        line: LINE,
      },
    },
    {
      powerAssertContext: {
        value: CUSTOM_MESSAGE,
        events: [{ value: CUSTOM_MESSAGE, espath: "arguments/2" }],
      },
      source: {
        content: `assertStringContains(x, y, '${CUSTOM_MESSAGE}');`,
        filepath: `${FILE_PATH}`,
        line: LINE,
      },
    },
  ];
  // deno-lint-ignore ban-ts-comment
  // @ts-ignore
  assertStringContains(...args);

  let poweredMessage;
  try {
    const x = "abc";
    const y = "def";
    const args = [
      {
        powerAssertContext: {
          value: x,
          events: [{ value: x, espath: "arguments/0" }],
        },
        source: {
          content: `assertStringContains(x, y, '${CUSTOM_MESSAGE}');`,
          filepath: `${FILE_PATH}`,
          line: LINE,
        },
      },
      {
        powerAssertContext: {
          value: y,
          events: [{ value: y, espath: "arguments/1" }],
        },
        source: {
          content: `assertStringContains(x, y, '${CUSTOM_MESSAGE}');`,
          filepath: `${FILE_PATH}`,
          line: LINE,
        },
      },
      {
        powerAssertContext: {
          value: CUSTOM_MESSAGE,
          events: [{ value: CUSTOM_MESSAGE, espath: "arguments/2" }],
        },
        source: {
          content: `assertStringContains(x, y, '${CUSTOM_MESSAGE}');`,
          filepath: `${FILE_PATH}`,
          line: LINE,
        },
      },
    ];
    // deno-lint-ignore ban-ts-comment
    // @ts-ignore
    assertStringContains(...args);
  } catch (e) {
    poweredMessage = e.message;
  }

  const expect = [
    "custom message",
    `${FILE_PATH}`,
    "",
    "assertStringContains(x, y, 'custom message');",
    "                     |  |  |                 ",
    '                     |  |  "custom message"  ',
    '                     |  "def"                ',
    '                     "abc"                   ',
    "",
  ];

  Asserts.assertEquals(poweredMessage.split("\n"), expect);
});

Deno.test("empower: assertArrayContains", () => {
  const assertArrayContains = empower(Asserts.assertArrayContains);
  const x = [1, 2];
  const y = [2];

  const args = [
    {
      powerAssertContext: {
        value: x,
        events: [{ value: x, espath: "arguments/0" }],
      },
      source: {
        content: `assertArrayContains(x, [...y], '${CUSTOM_MESSAGE}');`,
        filepath: `${FILE_PATH}`,
        line: LINE,
      },
    },
    {
      powerAssertContext: {
        value: y,
        events: [
          { value: y, espath: "arguments/1/elements/0/argument" },
          { value: y, espath: "arguments/1" },
        ],
      },
      source: {
        content: `assertArrayContains(x, [...y], '${CUSTOM_MESSAGE}');`,
        filepath: `${FILE_PATH}`,
        line: LINE,
      },
    },
    {
      powerAssertContext: {
        value: CUSTOM_MESSAGE,
        events: [{ value: CUSTOM_MESSAGE, espath: "arguments/2" }],
      },
      source: {
        content: `assertArrayContains(x, [...y], '${CUSTOM_MESSAGE}');`,
        filepath: `${FILE_PATH}`,
        line: LINE,
      },
    },
  ];

  // deno-lint-ignore ban-ts-comment
  // @ts-ignore
  assertArrayContains(...args);

  let poweredMessage;
  try {
    const x = [1, 2];
    const y = [3];

    const args = [
      {
        powerAssertContext: {
          value: x,
          events: [{ value: x, espath: "arguments/0" }],
        },
        source: {
          content: `assertArrayContains(x, [...y], '${CUSTOM_MESSAGE}');`,
          filepath: `${FILE_PATH}`,
          line: LINE,
        },
      },
      {
        powerAssertContext: {
          value: y,
          events: [
            { value: y, espath: "arguments/1/elements/0/argument" },
            { value: y, espath: "arguments/1" },
          ],
        },
        source: {
          content: `assertArrayContains(x, [...y], '${CUSTOM_MESSAGE}');`,
          filepath: `${FILE_PATH}`,
          line: LINE,
        },
      },
      {
        powerAssertContext: {
          value: CUSTOM_MESSAGE,
          events: [{ value: CUSTOM_MESSAGE, espath: "arguments/2" }],
        },
        source: {
          content: `assertArrayContains(x, [...y], '${CUSTOM_MESSAGE}');`,
          filepath: `${FILE_PATH}`,
          line: LINE,
        },
      },
    ];
    // deno-lint-ignore ban-ts-comment
    // @ts-ignore
    assertArrayContains(...args);
  } catch (e) {
    poweredMessage = e.message;
  }

  const expect = [
    "custom message",
    `${FILE_PATH}`,
    "",
    "assertArrayContains(x, [...y], 'custom message');",
    "                    |  |   |   |                 ",
    '                    |  [3] [3] "custom message"  ',
    "                    [1,2]                        ",
    "",
  ];

  Asserts.assertEquals(poweredMessage.split("\n"), expect);
});

Deno.test("empower: assertMatch", () => {
  const assertMatch = empower(Asserts.assertMatch);
  const x = "az";
  const y = /[abc][^abc]/;
  const args = [
    {
      powerAssertContext: {
        value: x,
        events: [{ value: x, espath: "arguments/0" }],
      },
      source: {
        content: `assertMatch(x, y, '${CUSTOM_MESSAGE}');`,
        filepath: `${FILE_PATH}`,
        line: LINE,
      },
    },
    {
      powerAssertContext: {
        value: y,
        events: [{ value: y, espath: "arguments/1" }],
      },
      source: {
        content: `assertMatch(x, y, '${CUSTOM_MESSAGE}');`,
        filepath: `${FILE_PATH}`,
        line: LINE,
      },
    },
    {
      powerAssertContext: {
        value: CUSTOM_MESSAGE,
        events: [{ value: CUSTOM_MESSAGE, espath: "arguments/2" }],
      },
      source: {
        content: `assertMatch(x, y, '${CUSTOM_MESSAGE}');`,
        filepath: `${FILE_PATH}`,
        line: LINE,
      },
    },
  ];
  // deno-lint-ignore ban-ts-comment
  // @ts-ignore
  assertMatch(...args);

  let poweredMessage;
  try {
    const x = "aa";
    const y = /[abc][^abc]/;

    const args = [
      {
        powerAssertContext: {
          value: x,
          events: [{ value: x, espath: "arguments/0" }],
        },
        source: {
          content: `assertMatch(x, y, '${CUSTOM_MESSAGE}');`,
          filepath: `${FILE_PATH}`,
          line: LINE,
        },
      },
      {
        powerAssertContext: {
          value: y,
          events: [{ value: y, espath: "arguments/1" }],
        },
        source: {
          content: `assertMatch(x, y, '${CUSTOM_MESSAGE}');`,
          filepath: `${FILE_PATH}`,
          line: LINE,
        },
      },
      {
        powerAssertContext: {
          value: CUSTOM_MESSAGE,
          events: [{ value: CUSTOM_MESSAGE, espath: "arguments/2" }],
        },
        source: {
          content: `assertMatch(x, y, '${CUSTOM_MESSAGE}');`,
          filepath: `${FILE_PATH}`,
          line: LINE,
        },
      },
    ];
    // deno-lint-ignore ban-ts-comment
    // @ts-ignore
    assertMatch(...args);
  } catch (e) {
    poweredMessage = e.message;
  }

  const expect = [
    "custom message",
    `${FILE_PATH}`,
    "",
    "assertMatch(x, y, 'custom message');",
    "            |  |  |                 ",
    '            |  |  "custom message"  ',
    "            |  /[abc][^abc]/        ",
    '            "aa"                    ',
    "",
  ];

  Asserts.assertEquals(poweredMessage.split("\n"), expect);
});

Deno.test("empower: assertNotMatch", () => {
  const assertNotMatch = empower(Asserts.assertNotMatch);
  const x = "aa";
  const y = /[abc][^abc]/;
  const args = [
    {
      powerAssertContext: {
        value: x,
        events: [{ value: x, espath: "arguments/0" }],
      },
      source: {
        content: `assertNotMatch(x, y, '${CUSTOM_MESSAGE}');`,
        filepath: `${FILE_PATH}`,
        line: LINE,
      },
    },
    {
      powerAssertContext: {
        value: y,
        events: [{ value: y, espath: "arguments/1" }],
      },
      source: {
        content: `assertNotMatch(x, y, '${CUSTOM_MESSAGE}');`,
        filepath: `${FILE_PATH}`,
        line: LINE,
      },
    },
    {
      powerAssertContext: {
        value: CUSTOM_MESSAGE,
        events: [{ value: CUSTOM_MESSAGE, espath: "arguments/2" }],
      },
      source: {
        content: `assertNotMatch(x, y, '${CUSTOM_MESSAGE}');`,
        filepath: `${FILE_PATH}`,
        line: LINE,
      },
    },
  ];
  // deno-lint-ignore ban-ts-comment
  // @ts-ignore
  assertNotMatch(...args);

  let poweredMessage;
  try {
    const x = "az";
    const y = /[abc][^abc]/;

    const args = [
      {
        powerAssertContext: {
          value: x,
          events: [{ value: x, espath: "arguments/0" }],
        },
        source: {
          content: `assertNotMatch(x, y, '${CUSTOM_MESSAGE}');`,
          filepath: `${FILE_PATH}`,
          line: LINE,
        },
      },
      {
        powerAssertContext: {
          value: y,
          events: [{ value: y, espath: "arguments/1" }],
        },
        source: {
          content: `assertNotMatch(x, y, '${CUSTOM_MESSAGE}');`,
          filepath: `${FILE_PATH}`,
          line: LINE,
        },
      },
      {
        powerAssertContext: {
          value: CUSTOM_MESSAGE,
          events: [{ value: CUSTOM_MESSAGE, espath: "arguments/2" }],
        },
        source: {
          content: `assertNotMatch(x, y, '${CUSTOM_MESSAGE}');`,
          filepath: `${FILE_PATH}`,
          line: LINE,
        },
      },
    ];
    // deno-lint-ignore ban-ts-comment
    // @ts-ignore
    assertNotMatch(...args);
  } catch (e) {
    poweredMessage = e.message;
  }

  const expect = [
    "custom message",
    `${FILE_PATH}`,
    "",
    "assertNotMatch(x, y, 'custom message');",
    "               |  |  |                 ",
    '               |  |  "custom message"  ',
    "               |  /[abc][^abc]/        ",
    '               "az"                    ',
    "",
  ];

  Asserts.assertEquals(poweredMessage.split("\n"), expect);
});

Deno.test("empower: assertThrows", () => {
  const assertThrows = empower(Asserts.assertThrows);

  const x = () => {
    throw new Error("foo");
  };
  const y = Error;
  const args = [
    {
      powerAssertContext: {
        value: x,
        events: [{ value: x, espath: "arguments/0" }],
      },
      source: {
        content: `assertThrows(x, y);`,
        filepath: `${FILE_PATH}`,
        line: LINE,
      },
    },
    {
      powerAssertContext: {
        value: y,
        events: [{ value: y, espath: "arguments/1" }],
      },
      source: {
        content: `assertThrows(x, y);`,
        filepath: `${FILE_PATH}`,
        line: LINE,
      },
    },
  ];
  // deno-lint-ignore ban-ts-comment
  // @ts-ignore
  assertThrows(...args);

  let poweredMessage;
  try {
    const x = () => {
      throw new Error("foo");
    };
    const y = TypeError;
    const args = [
      {
        powerAssertContext: {
          value: x,
          events: [{ value: x, espath: "arguments/0" }],
        },
        source: {
          content: `assertThrows(x, y);`,
          filepath: `${FILE_PATH}`,
          line: LINE,
        },
      },
      {
        powerAssertContext: {
          value: y,
          events: [{ value: y, espath: "arguments/1" }],
        },
        source: {
          content: `assertThrows(x, y);`,
          filepath: `${FILE_PATH}`,
          line: LINE,
        },
      },
    ];
    // deno-lint-ignore ban-ts-comment
    // @ts-ignore
    assertThrows(...args);
  } catch (e) {
    poweredMessage = e.message;
  }

  const expect = [
    'Expected error to be instance of "TypeError", but was "Error".',
    `${FILE_PATH}`,
    "",
    "assertThrows(x, y);",
    "             |  |  ",
    "             |  #function#",
    "             #function#",
    "",
  ];

  Asserts.assertEquals(poweredMessage.split("\n"), expect);
});

Deno.test("empower: assertThrowsAsync", async () => {
  // await Asserts.assertThrowsAsync(x, y);
  const assertThrowsAsync = empowerAsync(Asserts.assertThrowsAsync);

  const x = async () => {
    throw new Error("foo");
  };
  const y = Error;
  const args = [
    {
      powerAssertContext: {
        value: x,
        events: [{ value: x, espath: "arguments/0" }],
      },
      source: {
        content: `assertThrowsAsync(x, y);`,
        filepath: `${FILE_PATH}`,
        line: LINE,
      },
    },
    {
      powerAssertContext: {
        value: y,
        events: [{ value: y, espath: "arguments/1" }],
      },
      source: {
        content: `assertThrowsAsync(x, y);`,
        filepath: `${FILE_PATH}`,
        line: LINE,
      },
    },
  ];
  // deno-lint-ignore ban-ts-comment
  // @ts-ignore
  await assertThrowsAsync(...args);

  let poweredMessage;
  try {
    const x = async () => {
      throw new Error("foo");
    };
    const y = TypeError;
    const args = [
      {
        powerAssertContext: {
          value: x,
          events: [{ value: x, espath: "arguments/0" }],
        },
        source: {
          content: `assertThrowsAsync(x, y);`,
          filepath: `${FILE_PATH}`,
          line: LINE,
        },
      },
      {
        powerAssertContext: {
          value: y,
          events: [{ value: y, espath: "arguments/1" }],
        },
        source: {
          content: `assertThrowsAsync(x, y);`,
          filepath: `${FILE_PATH}`,
          line: LINE,
        },
      },
    ];
    // deno-lint-ignore ban-ts-comment
    // @ts-ignore
    await assertThrowsAsync(...args);
  } catch (e) {
    poweredMessage = e.message;
  }

  const expect = [
    'Expected error to be instance of "TypeError", but got "Error".',
    `${FILE_PATH}`,
    "",
    "assertThrowsAsync(x, y);",
    "                  |  |  ",
    "                  |  #function#",
    "                  #function#",
    "",
  ];

  Asserts.assertEquals(poweredMessage.split("\n"), expect);
});
