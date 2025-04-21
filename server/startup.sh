#!/bin/sh
echo "Waiting for database..."
sleep 5

echo "Generating Prisma client..."
npx prisma generate

echo "Applying migrations..."
npx prisma migrate dev --name init
npx prisma migrate deploy



echo "Starting application..."
npm run dev