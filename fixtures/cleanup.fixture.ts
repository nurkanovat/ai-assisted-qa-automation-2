import { test as base, expect } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env'), quiet: true });

const BASE_URL = process.env.DIDAXIS_URL ?? 'https://test.didaxis.studio';

type TrackProgram = (uuid: string) => void;

async function resolveAuthToken(): Promise<string> {
  const envToken = process.env.DIDAXIS_API_TOKEN?.trim();
  if (envToken && envToken.split('.').length === 3) {
    return envToken;
  }

  const email = process.env.DIDAXIS_EMAIL;
  const password = process.env.DIDAXIS_PASSWORD;
  if (!email || !password) {
    throw new Error('DIDAXIS_API_TOKEN or DIDAXIS_EMAIL/DIDAXIS_PASSWORD required for cleanup');
  }

  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!loginRes.ok) {
    throw new Error(`Cleanup login failed: ${loginRes.status}`);
  }

  const body = await loginRes.json();
  const token = body?.data?.access_token;
  if (!token) {
    throw new Error('Cleanup login response missing data.access_token');
  }
  return token;
}

async function deleteProgram(uuid: string, token: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/programs/${uuid}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok && res.status !== 404) {
    console.warn(`Failed to delete program ${uuid}: ${res.status} ${await res.text()}`);
  }
}

export const test = base.extend<{ trackProgram: TrackProgram }>({
  trackProgram: async ({}, use) => {
    const created = new Set<string>();

    await use((uuid: string) => {
      if (uuid) created.add(uuid);
    });

    if (created.size === 0) return;

    const token = await resolveAuthToken();
    for (const uuid of created) {
      await deleteProgram(uuid, token);
    }
  },
});

export { expect };
