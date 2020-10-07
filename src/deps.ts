// Copyright 2020-present numb86. All rights reserved. MIT license.

export * as Asserts from "https://deno.land/std@0.72.0/testing/asserts.ts";
export * as Colors from "https://deno.land/std@0.72.0/fmt/colors.ts";
export { parse as argumentsParse } from "https://deno.land/std@0.72.0/flags/mod.ts";
// @deno-types="../types/acorn.d.ts"
export { parse } from "https://jspm.dev/acorn@8.0.1";
// @deno-types="../types/estraverse.d.ts"
export {
  replace,
  traverse,
  VisitorKeys,
} from "https://jspm.dev/estraverse@5.2.0";
// @deno-types="../types/escodegen.d.ts"
export * as escodegen from "https://jspm.dev/escodegen@2.0.0";
export * as stringifier from "https://jspm.dev/stringifier@2.1.0";
