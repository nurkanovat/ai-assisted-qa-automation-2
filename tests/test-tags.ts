/** Suite tags — exactly one per test. See playwright-conventions.mdc § Tagging. */
export const Tag = {
  Smoke: '@smoke',
  Sanity: '@sanity',
  Regression: '@regression',
  Api: '@api',
  E2e: '@e2e',
  Destructive: '@destructive',
} as const;

export type SuiteTag = (typeof Tag)[keyof typeof Tag];
