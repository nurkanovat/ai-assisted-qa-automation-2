#!/usr/bin/env node
/**
 * Generation gate (afterFileEdit): block specs under tests/ that assert
 * nothing or use CSS/XPath page.locator selectors.
 *
 * Exit 0 — allow
 * Exit 2 — block
 * Other non-zero — failClosed blocks the action
 */

const fs = require('fs');

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

function normalizePath(filePath) {
  return String(filePath || '').replace(/\\/g, '/');
}

function isTestsPath(filePath) {
  const normalized = normalizePath(filePath);
  return /(^|\/)tests\//.test(normalized);
}

function hasExpect(content) {
  return content.includes('expect(');
}

function hasCssOrXPathLocator(content) {
  const re = /page\.locator\s*\(\s*(['"`])([\s\S]*?)\1/g;
  let match;
  while ((match = re.exec(content)) !== null) {
    const arg = match[2];
    if (arg.includes('.') || arg.includes('#') || arg.includes('//')) {
      return true;
    }
  }
  return false;
}

function block(userMessage, agentMessage) {
  process.stdout.write(
    JSON.stringify({
      user_message: userMessage,
      agent_message: agentMessage,
    }) + '\n',
  );
  process.exit(2);
}

function allow() {
  process.exit(0);
}

(async () => {
  let payload;
  try {
    const raw = await readStdin();
    payload = JSON.parse(raw || '{}');
  } catch {
    block(
      'Generation gate: invalid hook input JSON.',
      'Hook input could not be parsed; fix the generation-gate script or payload.',
    );
  }

  const filePath = payload.file_path || '';
  if (!isTestsPath(filePath)) {
    allow();
  }

  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    process.stderr.write(`generation-gate: failed to read ${filePath}: ${err.message}\n`);
    process.exit(1);
  }

  if (!hasExpect(content)) {
    block(
      'Generation gate: blocked — spec has no expect( assertion.',
      'Add at least one expect(...) assertion. Specs under tests/ must assert an observable outcome.',
    );
  }

  if (hasCssOrXPathLocator(content)) {
    block(
      'Generation gate: blocked — CSS/XPath page.locator is not allowed.',
      'Do not use page.locator with ".", "#", or "//". Prefer POM role/label/test-id locators.',
    );
  }

  allow();
})();
