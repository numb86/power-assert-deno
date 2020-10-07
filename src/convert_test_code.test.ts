// Copyright 2020-present numb86. All rights reserved. MIT license.

import { Asserts } from "./deps.ts";

import { convertTestCode } from "./convert_test_code.ts";

const { assertStrictEquals } = Asserts;

const SOURCE_OF_POWER_ASSERT_RECORDER = `class _PowerAssertRecorder {
    constructor() {
        this.captured = [];
    }
    capture(value, espath) {
        this.captured.push({
            value,
            espath
        });
        return value;
    }
    expr(value, source) {
        const capturedValues = this.captured;
        this.captured = [];
        return {
            powerAssertContext: {
                value,
                events: capturedValues
            },
            source
        };
    }
}`;

const FILE_PATH = "test/simple.js";

Deno.test("convert_test_code: assert(1)", () => {
  const source = `Deno.test("test title", () => {
  assert(1);
});`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", () => {
    const _rec1 = new _PowerAssertRecorder();
    assert(_rec1.expr(_rec1.capture(1, "arguments/0"), {
        content: "assert(1);",
        filepath: "${FILE_PATH}",
        line: 2
    }));
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: assert(x)", () => {
  const source = `Deno.test("test title", () => {
  assert(x);
});`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", () => {
    const _rec1 = new _PowerAssertRecorder();
    assert(_rec1.expr(_rec1.capture(x, "arguments/0"), {
        content: "assert(x);",
        filepath: "${FILE_PATH}",
        line: 2
    }));
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: assert(x, y)", () => {
  const source = `Deno.test("test title", () => {
  assert(x, y);
});`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", () => {
    const _rec1 = new _PowerAssertRecorder();
    const _rec2 = new _PowerAssertRecorder();
    assert(_rec1.expr(_rec1.capture(x, "arguments/0"), {
        content: "assert(x, y);",
        filepath: "${FILE_PATH}",
        line: 2
    }), _rec2.expr(_rec2.capture(y, "arguments/1"), {
        content: "assert(x, y);",
        filepath: "${FILE_PATH}",
        line: 2
    }));
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: assert(myFunc(1))", () => {
  const source = `Deno.test("test title", () => {
  assert(myFunc(1));
});`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", () => {
    const _rec1 = new _PowerAssertRecorder();
    assert(_rec1.expr(_rec1.capture(myFunc(1), "arguments/0"), {
        content: "assert(myFunc(1));",
        filepath: "${FILE_PATH}",
        line: 2
    }));
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: assert(myFunc(x))", () => {
  const source = `Deno.test("test title", () => {
  assert(myFunc(x));
});`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", () => {
    const _rec1 = new _PowerAssertRecorder();
    assert(_rec1.expr(_rec1.capture(myFunc(_rec1.capture(x, "arguments/0/arguments/0")), "arguments/0"), {
        content: "assert(myFunc(x));",
        filepath: "${FILE_PATH}",
        line: 2
    }));
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: assert(myFunc(foo(x)))", () => {
  const source = `Deno.test("test title", () => {
  assert(myFunc(foo(x)));
});`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", () => {
    const _rec1 = new _PowerAssertRecorder();
    assert(_rec1.expr(_rec1.capture(myFunc(_rec1.capture(foo(_rec1.capture(x, "arguments/0/arguments/0/arguments/0")), "arguments/0/arguments/0")), "arguments/0"), {
        content: "assert(myFunc(foo(x)));",
        filepath: "${FILE_PATH}",
        line: 2
    }));
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: assertEquals(3, x)", () => {
  const source = `Deno.test("test title", () => {
    assertEquals(3, x);
});`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", () => {
    const _rec1 = new _PowerAssertRecorder();
    const _rec2 = new _PowerAssertRecorder();
    assertEquals(_rec1.expr(_rec1.capture(3, "arguments/0"), {
        content: "assertEquals(3, x);",
        filepath: "${FILE_PATH}",
        line: 2
    }), _rec2.expr(_rec2.capture(x, "arguments/1"), {
        content: "assertEquals(3, x);",
        filepath: "${FILE_PATH}",
        line: 2
    }));
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: assertEquals(null, 1)", () => {
  const source = `Deno.test("test title", () => {
  assertEquals(null, 1);
});`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", () => {
    const _rec1 = new _PowerAssertRecorder();
    const _rec2 = new _PowerAssertRecorder();
    assertEquals(_rec1.expr(_rec1.capture(null, "arguments/0"), {
        content: "assertEquals(null, 1);",
        filepath: "${FILE_PATH}",
        line: 2
    }), _rec2.expr(_rec2.capture(1, "arguments/1"), {
        content: "assertEquals(null, 1);",
        filepath: "${FILE_PATH}",
        line: 2
    }));
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: assertEquals(undefined, 1)", () => {
  const source = `Deno.test("test title", () => {
  assertEquals(undefined, 1);
});`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", () => {
    const _rec1 = new _PowerAssertRecorder();
    const _rec2 = new _PowerAssertRecorder();
    assertEquals(_rec1.expr(_rec1.capture(undefined, "arguments/0"), {
        content: "assertEquals(undefined, 1);",
        filepath: "${FILE_PATH}",
        line: 2
    }), _rec2.expr(_rec2.capture(1, "arguments/1"), {
        content: "assertEquals(undefined, 1);",
        filepath: "${FILE_PATH}",
        line: 2
    }));
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: assertEquals(x, {a: b})", () => {
  const source = `Deno.test("test title", () => {
  assertEquals(x, {a: b});
});`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", () => {
    const _rec1 = new _PowerAssertRecorder();
    const _rec2 = new _PowerAssertRecorder();
    assertEquals(_rec1.expr(_rec1.capture(x, "arguments/0"), {
        content: "assertEquals(x, { a: b });",
        filepath: "${FILE_PATH}",
        line: 2
    }), _rec2.expr(_rec2.capture({ a: _rec2.capture(b, "arguments/1/properties/0/value") }, "arguments/1"), {
        content: "assertEquals(x, { a: b });",
        filepath: "${FILE_PATH}",
        line: 2
    }));
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: assert({[x]: 1})", () => {
  const source = `Deno.test("test title", () => {
  assert({[x]: 1});
});`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", () => {
    const _rec1 = new _PowerAssertRecorder();
    assert(_rec1.expr(_rec1.capture({ [_rec1.capture(x, "arguments/0/properties/0/key")]: 1 }, "arguments/0"), {
        content: "assert({ [x]: 1 });",
        filepath: "${FILE_PATH}",
        line: 2
    }));
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: assert({[x.y]: 1})", () => {
  const source = `Deno.test("test title", () => {
  assert({[x.y]: 1});
});`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", () => {
    const _rec1 = new _PowerAssertRecorder();
    assert(_rec1.expr(_rec1.capture({ [_rec1.capture(_rec1.capture(x, "arguments/0/properties/0/key/object").y, "arguments/0/properties/0/key")]: 1 }, "arguments/0"), {
        content: "assert({ [x.y]: 1 });",
        filepath: "${FILE_PATH}",
        line: 2
    }));
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: assert({foo: a['b']})", () => {
  const source = `Deno.test("test title", () => {
    assert({foo: a['b']});
});`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", () => {
    const _rec1 = new _PowerAssertRecorder();
    assert(_rec1.expr(_rec1.capture({ foo: _rec1.capture(_rec1.capture(a, "arguments/0/properties/0/value/object")["b"], "arguments/0/properties/0/value") }, "arguments/0"), {
        content: 'assert({ foo: a["b"] });',
        filepath: "${FILE_PATH}",
        line: 2
    }));
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: assert({[x.y]: a['b']})", () => {
  const source = `Deno.test("test title", () => {
    assert({[x.y]: a['b']});
});`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", () => {
    const _rec1 = new _PowerAssertRecorder();
    assert(_rec1.expr(_rec1.capture({ [_rec1.capture(_rec1.capture(x, "arguments/0/properties/0/key/object").y, "arguments/0/properties/0/key")]: _rec1.capture(_rec1.capture(a, "arguments/0/properties/0/value/object")["b"], "arguments/0/properties/0/value") }, "arguments/0"), {
        content: 'assert({ [x.y]: a["b"] });',
        filepath: "${FILE_PATH}",
        line: 2
    }));
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: assertEquals(x.y(1), x.z)", () => {
  const source = `Deno.test("test title", () => {
    assertEquals(x.y(1), x.z);
});`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", () => {
    const _rec1 = new _PowerAssertRecorder();
    const _rec2 = new _PowerAssertRecorder();
    assertEquals(_rec1.expr(_rec1.capture(_rec1.capture(x, "arguments/0/callee/object").y(1), "arguments/0"), {
        content: "assertEquals(x.y(1), x.z);",
        filepath: "${FILE_PATH}",
        line: 2
    }), _rec2.expr(_rec2.capture(_rec2.capture(x, "arguments/1/object").z, "arguments/1"), {
        content: "assertEquals(x.y(1), x.z);",
        filepath: "${FILE_PATH}",
        line: 2
    }));
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: assert([1, 2, 3])", () => {
  const source = `Deno.test("test title", () => {
    assert([1, 2, 3]);
  });`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", () => {
    const _rec1 = new _PowerAssertRecorder();
    assert(_rec1.expr(_rec1.capture([
        1,
        2,
        3
    ], "arguments/0"), {
        content: "assert([1,2,3]);",
        filepath: "${FILE_PATH}",
        line: 2
    }));
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: assert([1, x, 3])", () => {
  const source = `Deno.test("test title", () => {
    assert([1, x, 3]);
  });`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", () => {
    const _rec1 = new _PowerAssertRecorder();
    assert(_rec1.expr(_rec1.capture([
        1,
        _rec1.capture(x, "arguments/0/elements/1"),
        3
    ], "arguments/0"), {
        content: "assert([1,x,3]);",
        filepath: "${FILE_PATH}",
        line: 2
    }));
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: assert([1, 2, foo(3)])", () => {
  const source = `Deno.test("test title", () => {
    assert([1, 2, foo(3)]);
  });`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", () => {
    const _rec1 = new _PowerAssertRecorder();
    assert(_rec1.expr(_rec1.capture([
        1,
        2,
        _rec1.capture(foo(3), "arguments/0/elements/2")
    ], "arguments/0"), {
        content: "assert([1,2,foo(3)]);",
        filepath: "${FILE_PATH}",
        line: 2
    }));
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: assertEquals(() => {}, 8)", () => {
  const source = `Deno.test("test title", () => {
    assertEquals(() => {}, 8);
  });`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", () => {
    const _rec1 = new _PowerAssertRecorder();
    const _rec2 = new _PowerAssertRecorder();
    assertEquals(_rec1.expr(_rec1.capture(() => {
    }, "arguments/0"), {
        content: "assertEquals(() => {}, 8);",
        filepath: "${FILE_PATH}",
        line: 2
    }), _rec2.expr(_rec2.capture(8, "arguments/1"), {
        content: "assertEquals(() => {}, 8);",
        filepath: "${FILE_PATH}",
        line: 2
    }));
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: assertEquals((() => {})(), 8)", () => {
  const source = `Deno.test("test title", () => {
    assertEquals((() => {})(), 8);
  });`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", () => {
    const _rec1 = new _PowerAssertRecorder();
    const _rec2 = new _PowerAssertRecorder();
    assertEquals(_rec1.expr(_rec1.capture((() => {
    })(), "arguments/0"), {
        content: "assertEquals((() => {})(), 8);",
        filepath: "${FILE_PATH}",
        line: 2
    }), _rec2.expr(_rec2.capture(8, "arguments/1"), {
        content: "assertEquals((() => {})(), 8);",
        filepath: "${FILE_PATH}",
        line: 2
    }));
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: assertEquals(function() {}, 9)", () => {
  const source = `Deno.test("test title", () => {
    assertEquals(function() {}, 9);
  });`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", () => {
    const _rec1 = new _PowerAssertRecorder();
    const _rec2 = new _PowerAssertRecorder();
    assertEquals(_rec1.expr(_rec1.capture(function () {
    }, "arguments/0"), {
        content: "assertEquals(function () {}, 9);",
        filepath: "${FILE_PATH}",
        line: 2
    }), _rec2.expr(_rec2.capture(9, "arguments/1"), {
        content: "assertEquals(function () {}, 9);",
        filepath: "${FILE_PATH}",
        line: 2
    }));
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: assertEquals((function() {})(), 9)", () => {
  const source = `Deno.test("test title", () => {
    assertEquals((function() {})(), 9);
  });`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", () => {
    const _rec1 = new _PowerAssertRecorder();
    const _rec2 = new _PowerAssertRecorder();
    assertEquals(_rec1.expr(_rec1.capture(function () {
    }(), "arguments/0"), {
        content: "assertEquals(function () {}(), 9);",
        filepath: "${FILE_PATH}",
        line: 2
    }), _rec2.expr(_rec2.capture(9, "arguments/1"), {
        content: "assertEquals(function () {}(), 9);",
        filepath: "${FILE_PATH}",
        line: 2
    }));
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: assert([...x])", () => {
  const source = `Deno.test("test title", () => {
    assert([...x]);
  });`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", () => {
    const _rec1 = new _PowerAssertRecorder();
    assert(_rec1.expr(_rec1.capture([..._rec1.capture(x, "arguments/0/elements/0/argument")], "arguments/0"), {
        content: "assert([...x]);",
        filepath: "${FILE_PATH}",
        line: 2
    }));
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: assert(1 === 2)", () => {
  const source = `Deno.test("test title", () => {
    assert(1 === 2);
  });`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", () => {
    const _rec1 = new _PowerAssertRecorder();
    assert(_rec1.expr(_rec1.capture(1 === 2, "arguments/0"), {
        content: "assert(1 === 2);",
        filepath: "${FILE_PATH}",
        line: 2
    }));
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: assert(x === foo.bar)", () => {
  const source = `Deno.test("test title", () => {
    assert(x === foo.bar);
  });`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", () => {
    const _rec1 = new _PowerAssertRecorder();
    assert(_rec1.expr(_rec1.capture(_rec1.capture(x, "arguments/0/left") === _rec1.capture(_rec1.capture(foo, "arguments/0/right/object").bar, "arguments/0/right"), "arguments/0"), {
        content: "assert(x === foo.bar);",
        filepath: "${FILE_PATH}",
        line: 2
    }));
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: assert(x > 9)", () => {
  const source = `Deno.test("test title", () => {
    assert(x > 9);
  });`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", () => {
    const _rec1 = new _PowerAssertRecorder();
    assert(_rec1.expr(_rec1.capture(_rec1.capture(x, "arguments/0/left") > 9, "arguments/0"), {
        content: "assert(x > 9);",
        filepath: "${FILE_PATH}",
        line: 2
    }));
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: assertEquals(null || 1, 1)", () => {
  const source = `Deno.test("test title", () => {
    assertEquals(null || 1, 1);
  });`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", () => {
    const _rec1 = new _PowerAssertRecorder();
    const _rec2 = new _PowerAssertRecorder();
    assertEquals(_rec1.expr(_rec1.capture(null || 1, "arguments/0"), {
        content: "assertEquals(null || 1, 1);",
        filepath: "${FILE_PATH}",
        line: 2
    }), _rec2.expr(_rec2.capture(1, "arguments/1"), {
        content: "assertEquals(null || 1, 1);",
        filepath: "${FILE_PATH}",
        line: 2
    }));
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: assertEquals(2 && 1, 1)", () => {
  const source = `Deno.test("test title", () => {
    assertEquals(2 && 1, 1);
  });`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", () => {
    const _rec1 = new _PowerAssertRecorder();
    const _rec2 = new _PowerAssertRecorder();
    assertEquals(_rec1.expr(_rec1.capture(2 && 1, "arguments/0"), {
        content: "assertEquals(2 && 1, 1);",
        filepath: "${FILE_PATH}",
        line: 2
    }), _rec2.expr(_rec2.capture(1, "arguments/1"), {
        content: "assertEquals(2 && 1, 1);",
        filepath: "${FILE_PATH}",
        line: 2
    }));
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: assertEquals(x = 1, 2)", () => {
  const source = `Deno.test("test title", () => {
    assertEquals(x = 1, 2);
  });`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", () => {
    const _rec1 = new _PowerAssertRecorder();
    const _rec2 = new _PowerAssertRecorder();
    assertEquals(_rec1.expr(_rec1.capture(x = 1, "arguments/0"), {
        content: "assertEquals(x = 1, 2);",
        filepath: "${FILE_PATH}",
        line: 2
    }), _rec2.expr(_rec2.capture(2, "arguments/1"), {
        content: "assertEquals(x = 1, 2);",
        filepath: "${FILE_PATH}",
        line: 2
    }));
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: assertEquals(x += 1, 2)", () => {
  const source = `Deno.test("test title", () => {
    assertEquals(x += 1, 2);
  });`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", () => {
    const _rec1 = new _PowerAssertRecorder();
    const _rec2 = new _PowerAssertRecorder();
    assertEquals(_rec1.expr(_rec1.capture(x += 1, "arguments/0"), {
        content: "assertEquals(x += 1, 2);",
        filepath: "${FILE_PATH}",
        line: 2
    }), _rec2.expr(_rec2.capture(2, "arguments/1"), {
        content: "assertEquals(x += 1, 2);",
        filepath: "${FILE_PATH}",
        line: 2
    }));
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: assert(new Number(1))", () => {
  const source = `Deno.test("test title", () => {
    assert(new Number(1));
  });`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", () => {
    const _rec1 = new _PowerAssertRecorder();
    assert(_rec1.expr(_rec1.capture(new Number(1), "arguments/0"), {
        content: "assert(new Number(1));",
        filepath: "${FILE_PATH}",
        line: 2
    }));
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: assertEquals(new Number(1).valueOf(), 1)", () => {
  const source = `Deno.test("test title", () => {
    assertEquals(new Number(1).valueOf(), 1);
  });`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", () => {
    const _rec1 = new _PowerAssertRecorder();
    const _rec2 = new _PowerAssertRecorder();
    assertEquals(_rec1.expr(_rec1.capture(_rec1.capture(new Number(1), "arguments/0/callee/object").valueOf(), "arguments/0"), {
        content: "assertEquals(new Number(1).valueOf(), 1);",
        filepath: "${FILE_PATH}",
        line: 2
    }), _rec2.expr(_rec2.capture(1, "arguments/1"), {
        content: "assertEquals(new Number(1).valueOf(), 1);",
        filepath: "${FILE_PATH}",
        line: 2
    }));
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: assertEquals(typeof x.y(), 2)", () => {
  const source = `Deno.test("test title", () => {
    const x = {y: () => 1}
    assertEquals(typeof x.y(), 2)
  });`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", () => {
    const _rec1 = new _PowerAssertRecorder();
    const _rec2 = new _PowerAssertRecorder();
    const x = { y: () => 1 };
    assertEquals(_rec1.expr(_rec1.capture(typeof _rec1.capture(_rec1.capture(x, "arguments/0/argument/callee/object").y(), "arguments/0/argument"), "arguments/0"), {
        content: "assertEquals(typeof x.y(), 2);",
        filepath: "${FILE_PATH}",
        line: 3
    }), _rec2.expr(_rec2.capture(2, "arguments/1"), {
        content: "assertEquals(typeof x.y(), 2);",
        filepath: "${FILE_PATH}",
        line: 3
    }));
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("block statement", () => {
  const source = `Deno.test("test title", () => {
    if (x) {
      assertEquals(x, 1);
      try {
        assertEquals(y, 1);
      } catch (e) {
        assertEquals(y, 2);
      }
    }
  });`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", () => {
    if (x) {
        const _rec1 = new _PowerAssertRecorder();
        const _rec2 = new _PowerAssertRecorder();
        assertEquals(_rec1.expr(_rec1.capture(x, "arguments/0"), {
            content: "assertEquals(x, 1);",
            filepath: "${FILE_PATH}",
            line: 3
        }), _rec2.expr(_rec2.capture(1, "arguments/1"), {
            content: "assertEquals(x, 1);",
            filepath: "${FILE_PATH}",
            line: 3
        }));
        try {
            const _rec3 = new _PowerAssertRecorder();
            const _rec4 = new _PowerAssertRecorder();
            assertEquals(_rec3.expr(_rec3.capture(y, "arguments/0"), {
                content: "assertEquals(y, 1);",
                filepath: "${FILE_PATH}",
                line: 5
            }), _rec4.expr(_rec4.capture(1, "arguments/1"), {
                content: "assertEquals(y, 1);",
                filepath: "${FILE_PATH}",
                line: 5
            }));
        } catch (e) {
            const _rec5 = new _PowerAssertRecorder();
            const _rec6 = new _PowerAssertRecorder();
            assertEquals(_rec5.expr(_rec5.capture(y, "arguments/0"), {
                content: "assertEquals(y, 2);",
                filepath: "${FILE_PATH}",
                line: 7
            }), _rec6.expr(_rec6.capture(2, "arguments/1"), {
                content: "assertEquals(y, 2);",
                filepath: "${FILE_PATH}",
                line: 7
            }));
        }
    }
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: assert inside function", () => {
  const source = `Deno.test("test title", () => {
    const run = () => {
      assert(x);
    }
    function runAssert() {
      assert(y)
    }
    run();
    runAssert();
  });`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", () => {
    const run = () => {
        const _rec1 = new _PowerAssertRecorder();
        assert(_rec1.expr(_rec1.capture(x, "arguments/0"), {
            content: "assert(x);",
            filepath: "${FILE_PATH}",
            line: 3
        }));
    };
    function runAssert() {
        const _rec2 = new _PowerAssertRecorder();
        assert(_rec2.expr(_rec2.capture(y, "arguments/0"), {
            content: "assert(y);",
            filepath: "${FILE_PATH}",
            line: 6
        }));
    }
    run();
    runAssert();
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: surrogate pair character", () => {
  const source = `Deno.test("test title", () => {
    assertEquals("🦕", x);
});`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", () => {
    const _rec1 = new _PowerAssertRecorder();
    const _rec2 = new _PowerAssertRecorder();
    assertEquals(_rec1.expr(_rec1.capture("🦕", "arguments/0"), {
        content: 'assertEquals("🦕", x);',
        filepath: "${FILE_PATH}",
        line: 2
    }), _rec2.expr(_rec2.capture(x, "arguments/1"), {
        content: 'assertEquals("🦕", x);',
        filepath: "${FILE_PATH}",
        line: 2
    }));
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: multiple Deno.test expression", () => {
  const source = `Deno.test("test title", () => {
    assertEquals(x, y);
  });
  Deno.test("test title", () => {
    assertEquals(1, a === b);
  });`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", () => {
    const _rec1 = new _PowerAssertRecorder();
    const _rec2 = new _PowerAssertRecorder();
    assertEquals(_rec1.expr(_rec1.capture(x, "arguments/0"), {
        content: "assertEquals(x, y);",
        filepath: "${FILE_PATH}",
        line: 2
    }), _rec2.expr(_rec2.capture(y, "arguments/1"), {
        content: "assertEquals(x, y);",
        filepath: "${FILE_PATH}",
        line: 2
    }));
});
Deno.test("test title", () => {
    const _rec3 = new _PowerAssertRecorder();
    const _rec4 = new _PowerAssertRecorder();
    assertEquals(_rec3.expr(_rec3.capture(1, "arguments/0"), {
        content: "assertEquals(1, a === b);",
        filepath: "${FILE_PATH}",
        line: 5
    }), _rec4.expr(_rec4.capture(_rec4.capture(a, "arguments/1/left") === _rec4.capture(b, "arguments/1/right"), "arguments/1"), {
        content: "assertEquals(1, a === b);",
        filepath: "${FILE_PATH}",
        line: 5
    }));
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: multiple assert expression", () => {
  const source = `Deno.test("test title", () => {
    assert(a(1));
    assertEquals(x, y);
    assert(b);
  });`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", () => {
    const _rec1 = new _PowerAssertRecorder();
    const _rec2 = new _PowerAssertRecorder();
    const _rec3 = new _PowerAssertRecorder();
    const _rec4 = new _PowerAssertRecorder();
    assert(_rec1.expr(_rec1.capture(a(1), "arguments/0"), {
        content: "assert(a(1));",
        filepath: "${FILE_PATH}",
        line: 2
    }));
    assertEquals(_rec2.expr(_rec2.capture(x, "arguments/0"), {
        content: "assertEquals(x, y);",
        filepath: "${FILE_PATH}",
        line: 3
    }), _rec3.expr(_rec3.capture(y, "arguments/1"), {
        content: "assertEquals(x, y);",
        filepath: "${FILE_PATH}",
        line: 3
    }));
    assert(_rec4.expr(_rec4.capture(b, "arguments/0"), {
        content: "assert(b);",
        filepath: "${FILE_PATH}",
        line: 4
    }));
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: async function", () => {
  const source = `Deno.test("test title", () => {
    assert(x);
  });
  Deno.test("test title", async () => {
    assert(y);
  });`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", () => {
    const _rec1 = new _PowerAssertRecorder();
    assert(_rec1.expr(_rec1.capture(x, "arguments/0"), {
        content: "assert(x);",
        filepath: "${FILE_PATH}",
        line: 2
    }));
});
Deno.test("test title", async () => {
    const _rec2 = new _PowerAssertRecorder();
    assert(_rec2.expr(_rec2.capture(y, "arguments/0"), {
        content: "assert(y);",
        filepath: "${FILE_PATH}",
        line: 5,
        async: true
    }));
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: assertEquals(await x, 2)", () => {
  const source = `Deno.test("test title", async () => {
    const x = 1;
    assertEquals(await x, 2)
  });`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", async () => {
    const _rec1 = new _PowerAssertRecorder();
    const _rec2 = new _PowerAssertRecorder();
    const x = 1;
    assertEquals(_rec1.expr(_rec1.capture(await x, "arguments/0"), {
        content: "assertEquals(await x, 2);",
        filepath: "${FILE_PATH}",
        line: 3,
        async: true
    }), _rec2.expr(_rec2.capture(2, "arguments/1"), {
        content: "assertEquals(await x, 2);",
        filepath: "${FILE_PATH}",
        line: 3,
        async: true
    }));
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: assertEquals(await x.y(foo(1)), 2)", () => {
  const source = `Deno.test("test title", async () => {
    assertEquals(await x.y(foo(1)), 2);
  });`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", async () => {
    const _rec1 = new _PowerAssertRecorder();
    const _rec2 = new _PowerAssertRecorder();
    assertEquals(_rec1.expr(_rec1.capture(await _rec1.capture(x, "arguments/0/argument/callee/object").y(_rec1.capture(foo(1), "arguments/0/argument/arguments/0")), "arguments/0"), {
        content: "assertEquals(await x.y(foo(1)), 2);",
        filepath: "${FILE_PATH}",
        line: 2,
        async: true
    }), _rec2.expr(_rec2.capture(2, "arguments/1"), {
        content: "assertEquals(await x.y(foo(1)), 2);",
        filepath: "${FILE_PATH}",
        line: 2,
        async: true
    }));
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: assertEquals(await Promise.resolve(x), 2)", () => {
  const source = `Deno.test("test title", async () => {
    assertEquals(await Promise.resolve(x), 2);
  });`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", async () => {
    const _rec1 = new _PowerAssertRecorder();
    const _rec2 = new _PowerAssertRecorder();
    assertEquals(_rec1.expr(_rec1.capture(await _rec1.capture(Promise, "arguments/0/argument/callee/object").resolve(_rec1.capture(x, "arguments/0/argument/arguments/0")), "arguments/0"), {
        content: "assertEquals(await Promise.resolve(x), 2);",
        filepath: "${FILE_PATH}",
        line: 2,
        async: true
    }), _rec2.expr(_rec2.capture(2, "arguments/1"), {
        content: "assertEquals(await Promise.resolve(x), 2);",
        filepath: "${FILE_PATH}",
        line: 2,
        async: true
    }));
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: await assert(x)", () => {
  const source = `Deno.test("test title", async () => {
    const x = 1;
    await assert(x);
  });`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", async () => {
    const _rec1 = new _PowerAssertRecorder();
    const x = 1;
    await assert(_rec1.expr(_rec1.capture(x, "arguments/0"), {
        content: "assert(x)",
        filepath: "${FILE_PATH}",
        line: 3,
        async: true
    }));
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: generator function", () => {
  const source = `Deno.test("test title", function* () {
    assertEquals(x, 2);
  });`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", function* () {
    const _rec1 = new _PowerAssertRecorder();
    const _rec2 = new _PowerAssertRecorder();
    assertEquals(_rec1.expr(_rec1.capture(x, "arguments/0"), {
        content: "assertEquals(x, 2);",
        filepath: "${FILE_PATH}",
        line: 2,
        generator: true
    }), _rec2.expr(_rec2.capture(2, "arguments/1"), {
        content: "assertEquals(x, 2);",
        filepath: "${FILE_PATH}",
        line: 2,
        generator: true
    }));
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: yield", () => {
  const source = `Deno.test("test title", function* () {
    assertEquals(yield x, 1);
    assertEquals(yield* x, 2);
  });`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", function* () {
    const _rec1 = new _PowerAssertRecorder();
    const _rec2 = new _PowerAssertRecorder();
    const _rec3 = new _PowerAssertRecorder();
    const _rec4 = new _PowerAssertRecorder();
    assertEquals(_rec1.expr(_rec1.capture(yield x, "arguments/0"), {
        content: "assertEquals(yield x, 1);",
        filepath: "${FILE_PATH}",
        line: 2,
        generator: true
    }), _rec2.expr(_rec2.capture(1, "arguments/1"), {
        content: "assertEquals(yield x, 1);",
        filepath: "${FILE_PATH}",
        line: 2,
        generator: true
    }));
    assertEquals(_rec3.expr(_rec3.capture(yield* x, "arguments/0"), {
        content: "assertEquals(yield* x, 2);",
        filepath: "${FILE_PATH}",
        line: 3,
        generator: true
    }), _rec4.expr(_rec4.capture(2, "arguments/1"), {
        content: "assertEquals(yield* x, 2);",
        filepath: "${FILE_PATH}",
        line: 3,
        generator: true
    }));
});`;

  assertStrictEquals(convertTestCode(source, FILE_PATH), expect);
});

Deno.test("convert_test_code: resolve dependent", () => {
  const testFilePath = "/Users/admin/my-pj/code/some.test.ts";

  const source = `import { assert } from "../deps.ts";
import { Util } from "./util.ts";
import { Foo } from "../../shared/mod/foo.ts";
import { Bar } from "/Users/admin/bar.ts";
import { Baz } from "https://example.com/baz.ts";

Deno.test("test title", () => {
  assert(1);
});`;

  const expect = `import { assert } from "/Users/admin/my-pj/deps.ts";
import { Util } from "/Users/admin/my-pj/code/util.ts";
import { Foo } from "/Users/admin/shared/mod/foo.ts";
import { Bar } from "/Users/admin/bar.ts";
import { Baz } from "https://example.com/baz.ts";
${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", () => {
    const _rec1 = new _PowerAssertRecorder();
    assert(_rec1.expr(_rec1.capture(1, "arguments/0"), {
        content: "assert(1);",
        filepath: "${testFilePath}",
        line: 8
    }));
});`;

  assertStrictEquals(convertTestCode(source, testFilePath), expect);
});

// TODO: Corresponds to case where the argument of dynamic import is not Literal
// e.g.
// const path = "../../foo/bar.ts";
// import(path).then(res => res.x)
Deno.test("convert_test_code: resolve dynamic import dependent", () => {
  const testFilePath = "/Users/admin/my-pj/code/some.test.ts";

  const source = `Deno.test("test title", async () => {
  const assert = await import("./assert.ts").then(res => res.assert);
  assert(1);
});`;

  const expect = `${SOURCE_OF_POWER_ASSERT_RECORDER}
Deno.test("test title", async () => {
    const _rec1 = new _PowerAssertRecorder();
    const assert = await import("/Users/admin/my-pj/code/assert.ts").then(res => res.assert);
    assert(_rec1.expr(_rec1.capture(1, "arguments/0"), {
        content: "assert(1);",
        filepath: "${testFilePath}",
        line: 3,
        async: true
    }));
});`;

  assertStrictEquals(convertTestCode(source, testFilePath), expect);
});
