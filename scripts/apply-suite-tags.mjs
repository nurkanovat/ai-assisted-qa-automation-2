/**
 * One-shot helper: assign suite tags to tests missing { tag: ... }.
 * Run: node scripts/apply-suite-tags.mjs
 */
import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');
const testsDir = path.join(root, 'tests');

const FILE_RULES = {
  'ds1-create-program.spec.ts': { smokeMax: 2, sanityMax: 8 },
  'ds2-create-program.spec.ts': { smokeMax: 2, sanityMax: 10 },
  'ds3-create-program.spec.ts': { smokeMax: 1, sanityMax: 6 },
  'ds4-create-program.spec.ts': { smokeMax: 2, sanityMax: 7 },
  'ds5-create-program.spec.ts': { smokeMax: 2, sanityMax: 7 },
  'programs.a11y.spec.ts': { all: '@regression' },
};

function tagForTc(tcNum, rules) {
  if (rules.all) return rules.all;
  if (tcNum <= rules.smokeMax) return '@smoke';
  if (tcNum <= rules.sanityMax) return '@sanity';
  return '@regression';
}

function extractTcNum(title) {
  const m = title.match(/^TC-(\d+):/);
  return m ? Number(m[1]) : null;
}

function injectTag(line, tag) {
  if (/\{\s*tag:\s*['"]@/.test(line)) {
    return line.replace(/\{\s*tag:\s*['"]@[^'"]+['"]/, `{ tag: '${tag}'`);
  }

  const testMatch = line.match(/^(\s*)test(?:\.fixme)?\(\s*('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")/);
  if (testMatch) {
    const [, indent, quoteTitle] = testMatch;
    const isFixme = line.includes('test.fixme');
    const fn = isFixme ? 'test.fixme' : 'test';
    const rest = line.slice(line.indexOf(quoteTitle) + quoteTitle.length);
    if (rest.trimStart().startsWith(',')) {
      return line.replace(
        new RegExp(`^${indent}${fn.replace('.', '\\.')}\\(\\s*${quoteTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`),
        `${indent}${fn}(${quoteTitle}, { tag: '${tag}' }`,
      );
    }
    return `${indent}${fn}(${quoteTitle}, { tag: '${tag}' },${rest.trimStart().replace(/^,?\s*/, '')}`;
  }
  return line;
}

function processFile(fileName) {
  const rules = FILE_RULES[fileName];
  if (!rules) return;

  const filePath = path.join(testsDir, fileName);
  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const out = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    if (/^\s*test(?:\.fixme)?\(\s*$/.test(line) && i + 1 < lines.length) {
      const titleLine = lines[i + 1];
      const titleMatch = titleLine.match(/^\s*('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")/);
      if (titleMatch) {
        const title = titleMatch[1].slice(1, -1);
        const tc = extractTcNum(title);
        const tag = tc ? tagForTc(tc, rules) : rules.all ?? '@regression';
        if (lines[i + 2]?.includes('tag:')) {
          lines[i + 2] = lines[i + 2].replace(/tag:\s*['"]@[^'"]+['"]/, `tag: '${tag}'`);
        } else {
          lines.splice(i + 2, 0, `    { tag: '${tag}' },`);
        }
        out.push(line, titleLine);
        i += 1;
        continue;
      }
    }

    const inlineTitle = line.match(/^\s*test(?:\.fixme)?\(\s*('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")/);
    if (inlineTitle) {
      const title = inlineTitle[1].slice(1, -1);
      const tc = extractTcNum(title);
      const tag = tc ? tagForTc(tc, rules) : rules.all ?? '@regression';
      line = injectTag(line, tag);
    }

    out.push(line);
  }

  fs.writeFileSync(filePath, out.join('\n'));
  console.log(`Tagged ${fileName}`);
}

for (const fileName of Object.keys(FILE_RULES)) {
  processFile(fileName);
}
