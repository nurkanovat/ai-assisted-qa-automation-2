/**
 * Bulk-delete all Didaxis programs via REST API.
 *
 * Usage:
 *   node scripts/delete-all-programs.mjs           # dry run (default)
 *   node scripts/delete-all-programs.mjs --confirm
 *
 * Requires in .env:
 *   DIDAXIS_URL (optional, defaults to https://test.didaxis.studio)
 *   DIDAXIS_API_TOKEN or DIDAXIS_EMAIL + DIDAXIS_PASSWORD
 */

import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = (process.env.DIDAXIS_URL ?? 'https://test.didaxis.studio').replace(/\/$/, '');
const confirm = process.argv.includes('--confirm');

async function resolveAuthToken() {
  const envToken = process.env.DIDAXIS_API_TOKEN?.trim();
  if (envToken && envToken.split('.').length === 3) {
    return envToken;
  }

  const email = process.env.DIDAXIS_EMAIL;
  const password = process.env.DIDAXIS_PASSWORD;
  if (!email || !password) {
    throw new Error('DIDAXIS_API_TOKEN or DIDAXIS_EMAIL/DIDAXIS_PASSWORD required in .env');
  }

  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!loginRes.ok) {
    const text = await loginRes.text();
    throw new Error(`Login failed (${loginRes.status}): ${text}`);
  }

  const body = await loginRes.json();
  const token = body?.data?.access_token;
  if (!token) {
    throw new Error('Login response missing data.access_token');
  }
  return token;
}

function extractPrograms(payload) {
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.programs)
        ? payload.programs
        : [];

  return list
    .map((item) => ({
      id: item?.id ?? item?.uuid,
      name: item?.name ?? item?.program_name ?? '(unnamed)',
    }))
    .filter((p) => p.id);
}

async function fetchAllPrograms(token) {
  const res = await fetch(`${BASE_URL}/api/programs`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET /api/programs failed (${res.status}): ${text}`);
  }

  const body = await res.json();
  return extractPrograms(body);
}

async function deleteProgram(uuid, token) {
  const res = await fetch(`${BASE_URL}/api/programs/${uuid}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.ok || res.status === 404) {
    return { ok: true };
  }

  const text = await res.text();
  return { ok: false, status: res.status, error: text };
}

async function main() {
  const token = await resolveAuthToken();
  const programs = await fetchAllPrograms(token);

  if (programs.length === 0) {
    console.log('No programs found.');
    return;
  }

  const label = confirm ? 'deleting' : 'dry run — no deletions performed';
  console.log(`Found ${programs.length} program(s) (${label}):\n`);

  for (const program of programs) {
    console.log(`  ${program.id}  ${program.name}`);
  }

  if (!confirm) {
    console.log('\nRun with --confirm to delete all listed programs.');
    return;
  }

  console.log('');
  let deleted = 0;
  let failed = 0;

  for (const program of programs) {
    const result = await deleteProgram(program.id, token);
    if (result.ok) {
      deleted += 1;
      console.log(`Deleted: ${program.id} (${program.name})`);
    } else {
      failed += 1;
      console.error(`Failed: ${program.id} (${program.name}) — ${result.status}: ${result.error}`);
    }
  }

  console.log(`\nDeleted: ${deleted}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
