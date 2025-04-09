#!/bin/bash

# Extract variables from .env.production
MONGODB_URI=$(grep MONGODB_URI .env.production | cut -d '=' -f2-)
JWT_SECRET=$(grep JWT_SECRET .env.production | cut -d '=' -f2-)
CORS_ORIGIN=$(grep CORS_ORIGIN .env.production | cut -d '=' -f2-)
DB_NAME="plannora"

# Set environment variables in Vercel
echo "Adding MONGODB_URI to Vercel..."
echo "$MONGODB_URI" | npx vercel env add MONGODB_URI production

echo "Adding JWT_SECRET to Vercel..."
echo "$JWT_SECRET" | npx vercel env add JWT_SECRET production

echo "Adding CORS_ORIGIN to Vercel..."
echo "$CORS_ORIGIN" | npx vercel env add CORS_ORIGIN production

echo "Adding DB_NAME to Vercel..."
echo "$DB_NAME" | npx vercel env add DB_NAME production

echo "All environment variables added to Vercel. Now deploying to production..."
npx vercel --prod 