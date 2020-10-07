// Copyright 2020-present numb86. All rights reserved. MIT license.

export type Source = {
  content: string;
  filepath: string;
  line: number;
  async?: boolean;
  generator?: boolean;
};

type PowerAssertContextArg = {
  value: unknown;
  events: { value: unknown; espath: string }[];
};

export type PowerAssertContext = {
  source: Source;
  args: PowerAssertContextArg[];
};

export type Arg = {
  source: Source;
  powerAssertContext: PowerAssertContextArg;
};

export function createPowerAssertContext(
  ...args: Arg[]
): PowerAssertContext {
  let source: Source | undefined;
  const powerAssertContextArgs: PowerAssertContextArg[] = [];

  args.forEach((arg) => {
    if (source === undefined) {
      source = arg.source;
    }

    powerAssertContextArgs.push(arg.powerAssertContext);
  });

  if (!source) {
    throw new Error("source is undefined.");
  }

  return { source, args: powerAssertContextArgs };
}
