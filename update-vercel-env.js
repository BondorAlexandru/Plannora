#!/usr/bin/env node

// Script to update Vercel environment variables from local .env files
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to .env.production file
const envFile = path.join(__dirname, '.env.production');

// Check if file exists
if (!fs.existsSync(envFile)) {
  console.error(`.env.production file not found at ${envFile}`);
  process.exit(1);
}

// Read the file content
const envContent = fs.readFileSync(envFile, 'utf8');

// Parse the environment variables
const envVars = {};
envContent.split('\n').forEach(line => {
  if (line && !line.startsWith('#')) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      envVars[key] = value;
    }
  }
});

console.log('Found the following environment variables:');
Object.keys(envVars).forEach(key => {
  // Mask sensitive data
  const value = key.includes('SECRET') || key.includes('PASSWORD') || key.includes('URI') 
    ? '********' 
    : envVars[key];
  console.log(`${key}=${value}`);
});

// Additionally add DB_NAME if not present
if (!envVars.DB_NAME) {
  envVars.DB_NAME = 'plannora';
  console.log('Added missing DB_NAME=plannora');
}

console.log('\nInstructions:');
console.log('1. Complete the Vercel login in your terminal');
console.log('2. Run the following commands to add each environment variable:');

Object.keys(envVars).forEach(key => {
  console.log(`npx vercel env add ${key}`);
});

console.log('\nAfter adding all environment variables:');
console.log('npx vercel --prod'); 