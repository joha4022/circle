import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('home page keeps core redesign sections and CTAs', async () => {
  const page = await read('app/page.tsx');

  assert.match(page, /id="how-it-works"/);
  assert.match(page, /id="highlights"/);
  assert.match(page, /aria-label="Example planning chat"/);

  const startCtaCount = (page.match(/Start with Google/g) || []).length;
  assert.equal(startCtaCount, 2, 'expected hero and final CTA copies');

  assert.match(page, /const steps = \[/);
  assert.match(page, /const highlights = \[/);
});

test('layout keeps top navigation and auth entry point', async () => {
  const layout = await read('app/layout.tsx');

  assert.match(layout, /className="app-topbar"/);
  assert.match(layout, />Groups<\/Link>/);
  assert.match(layout, />Chats<\/Link>/);
  assert.match(layout, /<ThemeToggle\s*\/>/);
  assert.match(layout, /href="\/login"/);
});

test('global styles keep theme and accessibility guardrails', async () => {
  const globals = await read('app/globals.css');

  assert.match(globals, /:root\s*\{[\s\S]*color-scheme:\s*dark;/);
  assert.match(globals, /html\[data-theme="light"\]\s*\{[\s\S]*color-scheme:\s*light;/);
  assert.match(globals, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(globals, /\.theme-toggle/);
});

test('page module styles keep responsive behavior and main sections', async () => {
  const css = await read('app/page.module.css');

  assert.match(css, /\.hero\s*\{/);
  assert.match(css, /\.stepGrid\s*\{/);
  assert.match(css, /\.highlightGrid\s*\{/);
  assert.match(css, /@media \(max-width:\s*980px\)/);
  assert.match(css, /@media \(max-width:\s*640px\)/);
});
