#!/bin/bash

# Script to test Cypress workflow locally
# This simulates what happens in GitHub Actions

set -e  # Exit on error

echo "🧪 Testing Cypress Workflow Locally"
echo "===================================="
echo ""

# Check if .env file exists
if [ ! -f .env.local ] && [ ! -f .env ]; then
    echo "⚠️  Warning: No .env.local or .env file found"
    echo "   Make sure Firebase environment variables are set"
    echo ""
fi

# Check Node.js version
echo "📦 Checking Node.js version..."
node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$node_version" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current: $(node -v)"
    exit 1
fi
echo "✅ Node.js version: $(node -v)"
echo ""

# Install dependencies
echo "📥 Installing dependencies..."
npm ci
echo "✅ Dependencies installed"
echo ""

# Build application
echo "🔨 Building application..."
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi
npm run build
echo "✅ Build successful"
echo ""

# Start server in background
echo "🚀 Starting development server..."
npm start &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"
echo ""

# Wait for server to be ready
echo "⏳ Waiting for server to start..."
timeout=180
elapsed=0
while ! curl -s http://localhost:3000 > /dev/null; do
    if [ $elapsed -ge $timeout ]; then
        echo "❌ Server failed to start within $timeout seconds"
        kill $SERVER_PID 2>/dev/null || true
        exit 1
    fi
    sleep 2
    elapsed=$((elapsed + 2))
    echo "   Waiting... ($elapsed/$timeout seconds)"
done
echo "✅ Server is ready"
echo ""

# Run Cypress tests
echo "🧪 Running Cypress tests..."
npm run cypress:run
TEST_EXIT_CODE=$?
echo ""

# Cleanup
echo "🧹 Cleaning up..."
kill $SERVER_PID 2>/dev/null || true
echo "✅ Cleanup complete"
echo ""

# Exit with test result
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ All tests passed!"
    exit 0
else
    echo "❌ Tests failed with exit code: $TEST_EXIT_CODE"
    exit $TEST_EXIT_CODE
fi

