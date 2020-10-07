// Copyright 2020-present numb86. All rights reserved. MIT license.

import { stringifier } from "./deps.ts";

import { createCapturedEvents } from "./create_captured_events.ts";
import { appendAst } from "./append_ast.ts";

import type { PowerAssertContext } from "./create_power_assert_context.ts";
import type { CapturedEvent } from "./create_captured_events.ts";

type Row = string[];

// deno-lint-ignore ban-ts-comment
// @ts-ignore
const stringify = stringifier.default({ maxDepth: 1, anonymous: "Object" });

const INITIAL_STRING = " ";

function getTextLength(targetText: string) {
  let result = 0;
  for (let i = 0; i < targetText.length; i += 1) {
    const character = targetText.charCodeAt(i);
    if (
      (character >= 0x00 && character < 0x81) ||
      character === 0xf8f0 ||
      (character >= 0xff61 && character < 0xffa0) ||
      (character >= 0xf8f1 && character < 0xf8f4)
    ) {
      // case of half-width
      result += 1;
    } else {
      // other case
      result += 2;
    }
  }
  return result;
}

export function renderDiagram(
  powerAssertContext: PowerAssertContext,
): string {
  const assertionLine = powerAssertContext.source.content;
  const rowLength = getTextLength(assertionLine);

  const createNewRow = () => {
    return [...Array(rowLength)].map(() => INITIAL_STRING);
  };

  const startColumnFor = (leftIndex: number) => {
    return getTextLength(assertionLine.slice(0, leftIndex));
  };

  const isOverlapped = (
    prev: CapturedEvent | undefined,
    next: CapturedEvent,
    dumpedValue: string,
  ) => {
    if (prev === undefined) return false;
    return startColumnFor(prev.leftIndex) <=
      startColumnFor(next.leftIndex) + getTextLength(dumpedValue);
  };

  const renderVerticalBarAt = (columnIndex: number) => {
    for (let i = 0; i < rows.length - 1; i += 1) {
      rows[i].splice(columnIndex, 1, "|");
    }
  };

  const renderValueAt = (columnIndex: number, dumpedValue: string) => {
    const width = getTextLength(dumpedValue);
    const lastRow = rows[rows.length - 1];
    for (let i = 0; i < width; i += 1) {
      lastRow.splice(columnIndex + i, 1, dumpedValue.charAt(i));
    }
  };

  const rows: Row[] = [createNewRow(), createNewRow()];
  const capturedEvents = createCapturedEvents(appendAst(powerAssertContext));

  // Sort in descending order of leftIndex
  capturedEvents.sort((a, b) => b.leftIndex - a.leftIndex);

  let prevCapturedEvent: CapturedEvent | undefined;
  capturedEvents.forEach((capturedEvent) => {
    const dumpedValue: string = stringify(capturedEvent.value);

    if (isOverlapped(prevCapturedEvent, capturedEvent, dumpedValue)) {
      rows.push(createNewRow());
    }

    renderVerticalBarAt(startColumnFor(capturedEvent.leftIndex));
    renderValueAt(startColumnFor(capturedEvent.leftIndex), dumpedValue);

    prevCapturedEvent = capturedEvent;
  });

  const lines = rows.map((row) => row.join(""));
  lines.unshift(assertionLine);
  return lines.join("\n");
}
