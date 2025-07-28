#!/usr/bin/env node

// Migration runner script
// This script runs the TypeScript migration using tsx

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Running Firebase migration...\n');

try {
  // Run the TypeScript migration script
  execSync('npx tsx src/scripts/migrate-to-firebase.ts', {
    stdio: 'inherit',
    cwd: resolve(__dirname, '..')
  });
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}