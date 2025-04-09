#!/usr/bin/env node

import { execSync } from 'child_process';

console.log("===================================================");
console.log("Important: You need to update your MongoDB IP Access List");
console.log("===================================================");
console.log("");
console.log("To fix your application's database connection issues:");
console.log("");
console.log("1. Log in to MongoDB Atlas at https://cloud.mongodb.com");
console.log("2. Select your 'Plannora' project");
console.log("3. Navigate to Network Access under Security");
console.log("4. Click 'Add IP Address'");
console.log("5. Click 'Allow Access from Anywhere' (sets 0.0.0.0/0)");
console.log("   OR add Vercel's IP range if you prefer more security");
console.log("6. Click 'Confirm'");
console.log("");
console.log("After updating the IP Access List:");
console.log("- Wait a few minutes for the changes to propagate");
console.log("- Test your application again");
console.log("");
console.log("==================================================="); 