// Copyright 2020-present numb86. All rights reserved. MIT license.

// This file is based on the code below.
// https://github.com/twada/power-assert-runtime/blob/v1.2.0/packages/power-assert-context-reducer-ast/index.js

import { parse as parser } from "./deps.ts";
import { replace, VisitorKeys } from "./deps.ts";

import type { Node } from "../types/estree.d.ts";
import type { Token } from "../types/acorn.d.ts";
import type {
  PowerAssertContext,
  Source,
} from "./create_power_assert_context.ts";

function wrappedInGenerator(jsCode: string) {
  return `function *wrapper() { ${jsCode} }`;
}

function wrappedInAsync(jsCode: string) {
  return `async function wrapper() { ${jsCode} }`;
}

function offsetAndSlimDownTokens(tokens: Token[]): {
  type: {
    label: string;
  };
  range: readonly [number, number];
  value?: unknown;
}[] {
  let i;
  let token;
  const result = [];
  const columnOffset = tokens[0].loc!.start.column;
  for (i = 0; i < tokens.length; i += 1) {
    token = tokens[i];

    const newToken = {
      type: {
        label: token.type.label,
      },
      range: [
        token.loc!.start.column - columnOffset,
        token.loc!.end.column - columnOffset,
      ] as const,
    };
    if (typeof token.value !== "undefined") {
      result.push({
        ...newToken,
        value: token.value,
      });
    } else {
      result.push(newToken);
    }
  }
  return result;
}

function parse(source: Source) {
  const code = source.content;
  let ast;
  let tokens: Token[] | undefined;

  function doParse(wrapper?: (arg: string) => string) {
    const content = wrapper ? wrapper(code) : code;
    const tokenBag: Token[] = [];
    ast = parser(content, {
      ecmaVersion: 2020,
      locations: true,
      ranges: false,
      onToken: tokenBag,
      allowAwaitOutsideFunction: true,
      sourceType: "module",
    });
    if (wrapper) {
      // deno-lint-ignore ban-ts-comment
      // @ts-ignore
      ast = ast.body[0].body;
      tokens = tokenBag.slice(6, -2);
    } else {
      tokens = tokenBag.slice(0, -1);
    }
  }

  if (source.async) {
    doParse(wrappedInAsync);
  } else if (source.generator) {
    doParse(wrappedInGenerator);
  } else {
    doParse();
  }

  // deno-lint-ignore ban-ts-comment
  // @ts-ignore
  const exp = ast.body[0].expression;
  const columnOffset = exp.loc.start.column;
  const offsetTree = replace(exp, {
    // deno-lint-ignore ban-ts-comment
    // @ts-ignore
    keys: VisitorKeys,
    enter(eachNode: Node) {
      if (!eachNode.loc && eachNode.range) {
        // skip already visited node
        return eachNode;
      }
      eachNode.range = [
        eachNode.loc!.start.column - columnOffset,
        eachNode.loc!.end.column - columnOffset,
      ];
      delete eachNode.loc;
      return eachNode;
    },
  });

  if (tokens === undefined) {
    throw new Error("tokens is undefined");
  }

  return {
    tokens: offsetAndSlimDownTokens(tokens),
    expression: offsetTree,
  };
}

export function appendAst(powerAssertContext: PowerAssertContext) {
  const { source } = powerAssertContext;

  const astAndTokens = parse(source);

  const newSource = {
    ...source,
    ast: astAndTokens.expression,
    tokens: astAndTokens.tokens,
    visitorKeys: VisitorKeys,
  };
  return {
    ...powerAssertContext,
    source: newSource,
  };
}

export type AppendedPowerAssertContext = ReturnType<typeof appendAst>;
