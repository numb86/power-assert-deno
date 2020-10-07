// Copyright 2020-present numb86. All rights reserved. MIT license.

// This file is based on the code below.
// https://github.com/twada/power-assert-runtime/blob/v1.2.0/packages/power-assert-context-traversal/lib/context-traversal.js
// https://github.com/twada/power-assert-runtime/blob/v1.2.0/packages/power-assert-context-traversal/lib/location.js

import { traverse } from "./deps.ts";

import type {
  AssignmentExpression,
  BinaryExpression,
  Literal,
  LogicalExpression,
  MemberExpression,
  Node,
} from "../types/estree.d.ts";
import type { AppendedPowerAssertContext } from "./append_ast.ts";

export type CapturedEvent = {
  value: unknown;
  leftIndex: number;
};

type Tokens = AppendedPowerAssertContext["source"]["tokens"];

function locationOf(currentNode: Node, tokens: Tokens) {
  switch (currentNode.type) {
    case "MemberExpression":
      return propertyLocationOf(currentNode, tokens);
    case "CallExpression":
      if (currentNode.callee.type === "MemberExpression") {
        return propertyLocationOf(currentNode.callee, tokens);
      }
      break;
    case "BinaryExpression":
    case "LogicalExpression":
    case "AssignmentExpression":
      return infixOperatorLocationOf(currentNode, tokens);
    default:
      break;
  }
  return currentNode.range;
}

function propertyLocationOf(
  memberExpression: MemberExpression,
  tokens: Tokens,
) {
  const prop = memberExpression.property;
  if (!memberExpression.computed) {
    return prop.range;
  }
  const token = findLeftBracketTokenOf(memberExpression, tokens);
  return token ? token.range : prop.range;
}

// calculate location of infix operator for BinaryExpression, AssignmentExpression and LogicalExpression.
function infixOperatorLocationOf(
  expression: BinaryExpression | LogicalExpression | AssignmentExpression,
  tokens: Tokens,
) {
  const token = findOperatorTokenOf(expression, tokens);
  return token ? token.range : expression.left.range;
}

function findLeftBracketTokenOf(expression: MemberExpression, tokens: Tokens) {
  const fromColumn = expression.property.range![0];
  return searchToken(tokens, (token: Tokens[number], index: number) => {
    let prevToken;
    if (token.range[0] === fromColumn) {
      prevToken = tokens[index - 1];
      if (prevToken.type.label === "[") {
        return prevToken;
      }
    }
    return undefined;
  });
}

function findOperatorTokenOf(
  expression: BinaryExpression | LogicalExpression | AssignmentExpression,
  tokens: Tokens,
) {
  const fromColumn = expression.left.range![1];
  const toColumn = expression.right.range![0];
  return searchToken(tokens, (token: Tokens[number]) => {
    if (
      fromColumn < token.range[0] &&
      token.range[1] < toColumn &&
      token.value === expression.operator
    ) {
      return token;
    }
    return undefined;
  });
}

function searchToken(
  tokens: Tokens,
  predicate: (
    token: Tokens[number],
    index: number,
  ) => Tokens[number] | undefined,
) {
  let i;
  let token;
  let found;
  for (i = 0; i < tokens.length; i += 1) {
    token = tokens[i];
    found = predicate(token, i);
    if (found) {
      return found;
    }
  }
  return undefined;
}

function onEachPowerAssertContextArg(
  capturedArgument: AppendedPowerAssertContext["args"][number],
  source: AppendedPowerAssertContext["source"],
) {
  const espathToValue: { [index: string]: unknown } = capturedArgument.events
    .reduce((acc, ev) => {
      return {
        ...acc,
        [ev.espath]: ev.value,
      };
    }, {});

  const result: CapturedEvent[] = [];

  traverse(source.ast, {
    // deno-lint-ignore ban-ts-comment
    // @ts-ignore
    keys: source.visitorKeys,
    enter(currentNode: Node) {
      const capturedEvent = createCapturedEvent(
        this.path(),
        currentNode,
        espathToValue,
        source.tokens,
      );
      if (capturedEvent) {
        result.push({
          value: capturedEvent.value,
          leftIndex: capturedEvent.leftIndex,
        });
      }
    },
  });

  return result;
}

function createCapturedEvent(
  path: (string | number)[] | null,
  currentNode: Node,
  espathToValue: { [index: string]: unknown },
  tokens: Tokens,
) {
  const literalPattern = /^(?:String|Numeric|Null|Boolean|RegExp)?Literal$/;
  const isLiteral = (node: Node) => literalPattern.test(node.type);

  const espath = path ? path.join("/") : "";
  const isCaptured = Object.prototype.hasOwnProperty.call(
    espathToValue,
    espath,
  );

  if (!isCaptured) return null;

  return {
    value: isLiteral(currentNode)
      ? (currentNode as Literal).value
      : espathToValue[espath],
    leftIndex: locationOf(currentNode, tokens)![0],
  };
}

export function createCapturedEvents(
  appendedContext: AppendedPowerAssertContext,
) {
  return appendedContext.args.reduce((acc: CapturedEvent[], arg) => {
    return acc.concat(onEachPowerAssertContextArg(arg, appendedContext.source));
  }, []);
}
