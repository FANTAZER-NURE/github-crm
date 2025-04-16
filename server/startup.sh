#!/bin/sh
echo "Waiting for database..."
sleep 5

echo "Generating Prisma client..."
npx prisma generate

echo "Setting up Prisma migrations..."
# Remove the existing migration directory as suggested by Prisma error
rm -rf prisma/migrations
mkdir -p prisma/migrations

echo "Creating initial migration..."
# Create a new migration history
npx prisma migrate dev --name init --create-only

echo "Applying migrations..."
npx prisma migrate deploy

echo "Starting application..."
npm run dev 