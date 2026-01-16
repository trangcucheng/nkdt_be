#!/bin/sh

# Wait for database to be ready
echo "Waiting for database..."
sleep 5

# Run Prisma migrations/push
echo "Running Prisma db push..."
npx prisma db push --skip-generate

# Start the application
echo "Starting application..."
node dist/src/main.js
