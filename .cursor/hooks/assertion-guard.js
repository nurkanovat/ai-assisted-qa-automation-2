#!/usr/bin/env node
/**
 * Assertion guard (afterFileEdit): block edits under tests/ that weaken
 * assertions — fewer active expect( calls or expect( moved into comments.
 *
 * Exit 0 — allow
 * Exit 2 — block (weakened assertions)
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

function isTestsPath(filePath) {
  const normalized = normalizePath(filePath);
  return /(^|\/)tests\//.test(normalized);
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

function analyzeWeakening(beforeContent, afterContent) {
  const beforeActive = countActiveExpects(beforeContent);
  const afterActive = countActiveExpects(afterContent);
  const beforeCommented = countCommentedExpects(beforeContent);
  const afterCommented = countCommentedExpects(afterContent);

  if (afterActive < beforeActive) {
    return {
      weakened: true,
      reason: `active expect( count dropped (${beforeActive} → ${afterActive})`,
    };
  }

  if (afterCommented > beforeCommented) {
    return {
      weakened: true,
      reason: `expect( was commented out (${beforeCommented} → ${afterCommented} commented)`,
    };
  }

  return { weakened: false };
}

(async () => {
  let payload;
  try {
    const raw = await readStdin();
    payload = JSON.parse(raw || '{}');
  } catch {
    block(
      'Assertion guard: invalid hook input JSON.',
      'Hook input could not be parsed; fix the assertion-guard script or payload.',
    );
  }

  const filePath = payload.file_path || '';
  if (!isTestsPath(filePath)) {
    allow();
  }

  let afterContent;
  try {
    afterContent = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    process.stderr.write(`assertion-guard: failed to read ${filePath}: ${err.message}\n`);
    process.exit(1);
  }

  const beforeContent = resolveBeforeContent(
    afterContent,
    payload.edits,
    filePath,
  );
  const result = analyzeWeakening(beforeContent, afterContent);

  if (result.weakened) {
    block(
      `Assertion guard: blocked — edit weakened test assertions (${result.reason}).`,
      'Do not delete, comment out, or reduce expect(...) calls to pass. Fix locators in pages/ or file an app bug instead.',
    );
  }

  allow();
})();
