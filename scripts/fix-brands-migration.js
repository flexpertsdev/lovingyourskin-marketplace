#!/usr/bin/env node

// Fix brands migration script
// This script deletes existing brands and re-imports them with proper data transformation

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔧 Running brands migration fix...\n');
console.log('⚠️  WARNING: This will delete all existing brands and re-import them.');
console.log('Press Ctrl+C to cancel or wait 5 seconds to continue...\n');

// Give user time to cancel
setTimeout(() => {
  try {
    // Run the TypeScript migration fix script
    execSync('npx tsx src/scripts/fix-brands-migration.ts', {
      stdio: 'inherit',
      cwd: resolve(__dirname, '..')
    });
  } catch (error) {
    console.error('❌ Migration fix failed:', error.message);
    process.exit(1);
  }
}, 5000);