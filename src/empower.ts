// Copyright 2020-present numb86. All rights reserved. MIT license.

import { Asserts, Colors } from "./deps.ts";
import {
  Arg,
  createPowerAssertContext,
  PowerAssertContext,
} from "./create_power_assert_context.ts";
import { renderDiagram } from "./render_diagram.ts";

const TARGET_SYNC_ASSERT_FUNCTION_LIST = [
  Asserts.assert,
  Asserts.assertEquals,
  Asserts.assertNotEquals,
  Asserts.assertStrictEquals,
  Asserts.assertNotEquals,
  Asserts.assertStringContains,
  Asserts.assertArrayContains,
  Asserts.assertMatch,
  Asserts.assertNotMatch,
  Asserts.assertThrows,
];

const TARGET_ASYNC_ASSERT_FUNCTION_LIST = [
  Asserts.assertThrowsAsync,
];

export const TARGET_ASSERT_FUNCTION_LIST = [
  ...TARGET_SYNC_ASSERT_FUNCTION_LIST,
  ...TARGET_ASYNC_ASSERT_FUNCTION_LIST,
].map((func) => {
  return func.name;
});

type OriginalSyncAssert = typeof TARGET_SYNC_ASSERT_FUNCTION_LIST[number];
type OriginalAsyncAssert = typeof TARGET_ASYNC_ASSERT_FUNCTION_LIST[number];
type Options = {
  color: boolean;
};

const { AssertionError } = Asserts;

// TODO: add line information
// Cannot to implement it because the information is lost when Deno.transpileOnly is executed.
function createPoweredMessage(
  powerAssertContext: PowerAssertContext,
  options?: Options,
): string {
  const diagram = renderDiagram(powerAssertContext);
  const poweredMessage =
    `\n${powerAssertContext.source.filepath}\n\n${diagram}\n`;
  return options?.color ? Colors.red(poweredMessage) : poweredMessage;
}

export function empower<T extends OriginalSyncAssert>(
  originalAssert: T,
  options?: Options,
) {
  return (...args: [...Parameters<T>]): ReturnType<T> => {
    const powerAssertContext = createPowerAssertContext(
      // convertTestCode rewrites the test code so that when this code is actually executed ...args becomes Arg[]
      ...args as unknown[] as Arg[],
    );

    const values: unknown[] = powerAssertContext.args.map((arg) => arg.value);

    let result: ReturnType<T>;
    try {
      // deno-lint-ignore ban-ts-comment
      // @ts-ignore
      result = originalAssert(...values);
    } catch (e) {
      if (e instanceof AssertionError) {
        e.message += createPoweredMessage(powerAssertContext, options);
      }
      throw e;
    }
    return result;
  };
}

export function empowerAsync<T extends OriginalAsyncAssert>(
  originalAssert: T,
  options?: Options,
) {
  return async (...args: [...Parameters<T>]): Promise<ReturnType<T>> => {
    const powerAssertContext = createPowerAssertContext(
      // convertTestCode rewrites the test code so that when this code is actually executed ...args becomes Arg[]
      ...args as unknown[] as Arg[],
    );

    const values: unknown[] = powerAssertContext.args.map((arg) => arg.value);

    let result: ReturnType<T>;
    try {
      // deno-lint-ignore ban-ts-comment
      // @ts-ignore
      result = await originalAssert(...values);
    } catch (e) {
      if (e instanceof AssertionError) {
        e.message += createPoweredMessage(powerAssertContext, options);
      }
      throw e;
    }
    return result;
  };
}
