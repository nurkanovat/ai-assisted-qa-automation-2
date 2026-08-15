#!/usr/bin/env node
/**
 * Constitution guard (afterFileEdit): block WON'T violations under tests/** and pages/**.
 *
 * Checks: waitForTimeout, XPath locators, `any`, hardcoded credentials,
 * tags on test.describe(), weakened/removed expect( (tests/** only).
 *
 * Exit 0 — allow
 * Exit 2 — block
 * Other non-zero — failClosed blocks the action
 */

const fs = require('fs');
const { execSync } = require('child_process');

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

function isGuardedPath(filePath) {
  const normalized = normalizePath(filePath);
  return /(^|\/)tests\//.test(normalized) || /(^|\/)pages\//.test(normalized);
}

function isTestsPath(filePath) {
  return /(^|\/)tests\//.test(normalizePath(filePath));
}

function stripComments(source) {
  let result = source.replace(/\/\*[\s\S]*?\*\//g, '');
  result = result.replace(/\/\/.*$/gm, '');
  return result;
}

function countActiveExpects(source) {
  return (stripComments(source).match(/\bexpect\s*\(/g) || []).length;
}

function countCommentedExpects(source) {
  let count = 0;
  for (const line of source.split('\n')) {
    const commentIdx = line.indexOf('//');
    if (commentIdx !== -1 && /\bexpect\s*\(/.test(line.slice(commentIdx))) {
      count++;
    }
  }
  const blockRe = /\/\*[\s\S]*?\*\//g;
  let match;
  while ((match = blockRe.exec(source)) !== null) {
    if (/\bexpect\s*\(/.test(match[0])) {
      count++;
    }
  }
  return count;
}

function reconstructBefore(afterContent, edits) {
  if (!Array.isArray(edits) || edits.length === 0) {
    return null;
  }

  let before = afterContent;
  for (let i = edits.length - 1; i >= 0; i--) {
    const oldString = edits[i]?.old_string;
    const newString = edits[i]?.new_string;
    if (typeof oldString !== 'string' || typeof newString !== 'string') {
      continue;
    }
    if (!before.includes(newString)) {
      return null;
    }
    before = before.replace(newString, oldString);
  }
  return before;
}

function gitBeforeContent(filePath) {
  const normalized = normalizePath(filePath);
  try {
    return execSync(`git show HEAD:"${normalized}"`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return null;
  }
}

function resolveBeforeContent(afterContent, edits, filePath) {
  const fromEdits = reconstructBefore(afterContent, edits);
  if (fromEdits !== null) {
    return fromEdits;
  }
  return gitBeforeContent(filePath) ?? '';
}

function hasWaitForTimeout(content) {
  return /\.waitForTimeout\s*\(/.test(content);
}

function hasXPathLocator(content) {
  const locatorRe = /\.locator\s*\(\s*(['"`])([\s\S]*?)\1/g;
  let match;
  while ((match = locatorRe.exec(content)) !== null) {
    const arg = match[2];
    if (arg.includes('//') || /^xpath\s*=/i.test(arg.trim())) {
      return true;
    }
  }
  return /locator\s*\(\s*['"`]xpath\s*=/i.test(content);
}

function hasAnyType(content) {
  const code = stripComments(content);
  return (
    /:\s*any\b/.test(code) ||
    /<any>/.test(code) ||
    /\bas\s+any\b/.test(code)
  );
}

function hasHardcodedCredential(content) {
  const withoutEnv = content.replace(/process\.env\.\w+/g, 'ENV_VAR');

  if (
    /(?:password|passwd|api[_-]?key|client[_-]?secret|auth[_-]?token|access[_-]?token|refresh[_-]?token)\s*[:=]\s*['"][^'"\s]{4,}['"]/i.test(
      withoutEnv,
    )
  ) {
    return true;
  }

  if (/Bearer\s+[A-Za-z0-9._-]{20,}/.test(withoutEnv)) {
    return true;
  }

  return /getByLabel\s*\(\s*['"]Password['"]\s*\)\.fill\s*\(\s*['"][^'"]+['"]\s*\)/.test(
    withoutEnv,
  );
}

function hasDescribeTag(content) {
  if (/test\.describe\s*\(\s*['"`]@/.test(content)) {
    return true;
  }
  return /test\.describe\s*\([^)]*,\s*\{[^}]*\btag\s*:/.test(content);
}

function analyzeWeakenedExpects(beforeContent, afterContent) {
  const beforeActive = countActiveExpects(beforeContent);
  const afterActive = countActiveExpects(afterContent);
  const beforeCommented = countCommentedExpects(beforeContent);
  const afterCommented = countCommentedExpects(afterContent);

  if (afterActive < beforeActive) {
    return `active expect( count dropped (${beforeActive} → ${afterActive})`;
  }

  if (afterCommented > beforeCommented) {
    return `expect( commented out (${beforeCommented} → ${afterCommented} commented)`;
  }

  return null;
}

const CHECKS = [
  {
    id: 'waitForTimeout',
    run: (content) => hasWaitForTimeout(content),
    message: 'page.waitForTimeout / .waitForTimeout is forbidden — use web-first expect(locator) retries.',
  },
  {
    id: 'xpath',
    run: (content) => hasXPathLocator(content),
    message: 'XPath locators are forbidden — use getByRole → label/placeholder → text → getByTestId.',
  },
  {
    id: 'any',
    run: (content) => hasAnyType(content),
    message: 'The `any` type is forbidden — infer or define a proper type.',
  },
  {
    id: 'credential',
    run: (content) => hasHardcodedCredential(content),
    message: 'Hardcoded credentials are forbidden — use process.env, storageState, or fixtures.',
  },
  {
    id: 'describe-tag',
    run: (content) => hasDescribeTag(content),
    message: 'Tags on test.describe() are forbidden — tag individual tests only.',
  },
];

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
      'Constitution guard: invalid hook input JSON.',
      'Hook input could not be parsed; fix constitution-guard.js or the payload.',
    );
  }

  const filePath = payload.file_path || '';
  if (!isGuardedPath(filePath)) {
    allow();
  }

  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    process.stderr.write(`constitution-guard: failed to read ${filePath}: ${err.message}\n`);
    process.exit(1);
  }

  for (const check of CHECKS) {
    if (check.run(content)) {
      block(
        `Constitution guard: blocked — ${check.message}`,
        `WON'T violation (${check.id}) in ${normalizePath(filePath)}. ${check.message}`,
      );
    }
  }

  if (isTestsPath(filePath)) {
    const beforeContent = resolveBeforeContent(content, payload.edits, filePath);
    const weakenReason = analyzeWeakenedExpects(beforeContent, content);
    if (weakenReason) {
      block(
        `Constitution guard: blocked — edit weakened test assertions (${weakenReason}).`,
        'Do not delete, comment out, or reduce expect(...) calls to pass. Fix locators in pages/ or file an app bug instead.',
      );
    }
  }

  allow();
})();
