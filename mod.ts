import { Asserts } from "./src/deps.ts";

import { empower, empowerAsync } from "./src/empower.ts";

const options = { color: true };

export const assert = empower(Asserts.assert, options);
export const assertEquals = empower(Asserts.assertEquals, options);
export const assertNotEquals = empower(Asserts.assertNotEquals, options);
export const assertStrictEquals = empower(Asserts.assertStrictEquals, options);
export const assertNotStrictEquals = empower(
  Asserts.assertNotStrictEquals,
  options,
);
export const assertStringContains = empower(
  Asserts.assertStringContains,
  options,
);
export const assertArrayContains = empower(
  Asserts.assertArrayContains,
  options,
);
export const assertMatch = empower(Asserts.assertMatch, options);
export const assertNotMatch = empower(Asserts.assertNotMatch, options);
export const assertThrows = empower(Asserts.assertThrows, options);
export const assertThrowsAsync = empowerAsync(
  Asserts.assertThrowsAsync,
  options,
);
