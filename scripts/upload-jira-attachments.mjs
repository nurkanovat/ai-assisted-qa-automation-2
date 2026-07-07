/**
 * Upload Playwright failure screenshots to Jira issues via REST API.
 *
 * Usage:
 *   node scripts/upload-jira-attachments.mjs
 *   node scripts/upload-jira-attachments.mjs --dry-run
 *   node scripts/upload-jira-attachments.mjs --issue DS-133 --file path/to/screenshot.png
 *
 * Requires in .env:
 *   ATLASSIAN_BASE_URL, ATLASSIAN_EMAIL, ATLASSIAN_API_TOKEN
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const testResultsDir = path.join(repoRoot, 'test-results');

const baseUrl = process.env.ATLASSIAN_BASE_URL?.replace(/\/$/, '');
const email = process.env.ATLASSIAN_EMAIL;
const apiToken = process.env.ATLASSIAN_API_TOKEN;

const defaultUploads = [
  {
    issueKey: 'DS-133',
    testId: 'TC-009',
    folderSuffix: 'TC-009--c8306-ected-with-validation-error',
    label: 'duplicate-program-name',
  },
  {
    issueKey: 'DS-134',
    testId: 'TC-013',
    folderSuffix: 'TC-013--6b3a6--100-characters-is-rejected',
    label: 'program-name-over-100-chars',
  },
  {
    issueKey: 'DS-135',
    testId: 'TC-018',
    folderSuffix: 'TC-018--394ca-m-Name-is-trimmed-on-submit',
    label: 'program-name-not-trimmed',
  },
  {
    issueKey: 'DS-136',
    testId: 'TC-021',
    folderSuffix: 'TC-021--a62c8-s-exactly-one-program-entry',
    label: 'double-click-create-duplicate',
  },
];

function parseArgs(argv) {
  const args = { dryRun: false, uploads: [] };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--dry-run') {
      args.dryRun = true;
    } else if (arg === '--issue') {
      args.uploads.push({ issueKey: argv[++i], file: argv[++i] });
    } else if (arg === '--help' || arg === '-h') {
      args.help = true;
    }
  }

  return args;
}

function findScreenshot(folderSuffix) {
  if (!fs.existsSync(testResultsDir)) {
    return null;
  }

  const match = fs
    .readdirSync(testResultsDir, { withFileTypes: true })
    .find((entry) => entry.isDirectory() && entry.name.includes(folderSuffix));

  if (!match) {
    return null;
  }

  const screenshotPath = path.join(testResultsDir, match.name, 'test-failed-1.png');
  return fs.existsSync(screenshotPath) ? screenshotPath : null;
}

function resolveUploads(customUploads) {
  if (customUploads.length > 0) {
    return customUploads.map(({ issueKey, file }) => ({
      issueKey,
      filePath: path.resolve(file),
      attachmentName: path.basename(file),
    }));
  }

  return defaultUploads.map((item) => {
    const filePath = findScreenshot(item.folderSuffix);
    return {
      issueKey: item.issueKey,
      testId: item.testId,
      label: item.label,
      filePath,
      attachmentName: filePath
        ? `ds1-${item.label}-${item.testId}-test-failed-1.png`
        : null,
    };
  });
}

async function uploadAttachment(issueKey, filePath, attachmentName) {
  const url = `${baseUrl}/rest/api/3/issue/${issueKey}/attachments`;
  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer], { type: 'image/png' });

  const form = new FormData();
  form.append('file', blob, attachmentName);

  const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'X-Atlassian-Token': 'no-check',
      Accept: 'application/json',
    },
    body: form,
  });

  const bodyText = await response.text();
  let body;
  try {
    body = JSON.parse(bodyText);
  } catch {
    body = bodyText;
  }

  if (!response.ok) {
    throw new Error(`Jira upload failed for ${issueKey} (${response.status}): ${bodyText}`);
  }

  return body;
}

function printHelp() {
  console.log(`Upload Playwright screenshots to Jira issues.

Usage:
  node scripts/upload-jira-attachments.mjs [--dry-run]
  node scripts/upload-jira-attachments.mjs --issue DS-133 --file test-results/.../test-failed-1.png

Defaults upload DS-133..DS-136 screenshots from test-results/ after running:
  npx playwright test tests/ds1-create-program.spec.ts -g "TC-009|TC-013|TC-018|TC-021" --workers=1
`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  if (!baseUrl || !email || !apiToken) {
    throw new Error(
      'Missing ATLASSIAN_BASE_URL, ATLASSIAN_EMAIL, or ATLASSIAN_API_TOKEN in .env',
    );
  }

  const uploads = resolveUploads(args.uploads);
  const missing = uploads.filter((item) => !item.filePath);

  if (missing.length > 0) {
    console.error('Missing screenshot files for:');
    for (const item of missing) {
      console.error(`  - ${item.issueKey} (${item.testId ?? 'custom'})`);
    }
    console.error('\nRun the failing Playwright tests first to generate test-failed-1.png files.');
    process.exit(1);
  }

  if (args.dryRun) {
    console.log('Dry run — would upload:');
    for (const item of uploads) {
      console.log(`  ${item.issueKey} <- ${item.filePath} as ${item.attachmentName}`);
    }
    return;
  }

  for (const item of uploads) {
    console.log(`Uploading ${item.attachmentName} to ${item.issueKey}...`);
    const result = await uploadAttachment(item.issueKey, item.filePath, item.attachmentName);
    const attachment = Array.isArray(result) ? result[0] : result;
    const attachmentUrl = attachment?.content ?? attachment?.self ?? '(uploaded)';
    console.log(`  OK: ${attachmentUrl}`);
  }

  console.log('\nAll attachments uploaded.');
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
