#!/bin/bash

# =====================================================
# Claude Libre - Automated Setup Script
# =====================================================
# This script sets up a complete Claude Libre installation
# with 50+ tools and total autonomy
# =====================================================

set -e  # Exit on error

echo "🚀 Claude Libre - Foundation Setup"
echo "=================================="
echo ""

# =====================================================
# 1. Check Prerequisites
# =====================================================
echo "📋 Step 1/7: Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js v18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current: $(node -v)"
    exit 1
fi
echo "✅ Node.js $(node -v) detected"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm."
    exit 1
fi
echo "✅ npm $(npm -v) detected"

# Check git (optional)
if command -v git &> /dev/null; then
    echo "✅ git $(git --version | cut -d' ' -f3) detected"
else
    echo "⚠️  git not found (optional)"
fi

echo ""

# =====================================================
# 2. Create Project Structure
# =====================================================
echo "📁 Step 2/7: Creating project structure..."

mkdir -p src/tools
mkdir -p logs
mkdir -p workspace
mkdir -p docs
mkdir -p sql

echo "✅ Directories created"
echo ""

# =====================================================
# 3. Install Dependencies
# =====================================================
echo "📦 Step 3/7: Installing dependencies..."
echo "This may take 2-3 minutes..."

npm install --silent

echo "✅ Dependencies installed"
echo ""

# =====================================================
# 4. Setup Environment Variables
# =====================================================
echo "⚙️  Step 4/7: Setting up environment..."

if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file from template"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and add your API keys:"
    echo "   - ANTHROPIC_API_KEY (required)"
    echo "   - OPENAI_API_KEY (required for memory)"
    echo "   - SERPAPI_KEY (optional for web search)"
    echo "   - GITHUB_TOKEN (optional for code search)"
    echo "   - SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY (for database)"
else
    echo "✅ .env file already exists"
fi

echo ""

# =====================================================
# 5. Setup Database (if using Supabase/Postgres)
# =====================================================
echo "🗄️  Step 5/7: Database setup..."

if [ -f sql/setup-pgvector.sql ]; then
    echo "📄 SQL setup file found: sql/setup-pgvector.sql"
    echo "   Run this SQL in your Supabase SQL Editor or psql to setup memory system"
    echo "   Link: https://supabase.com/dashboard/project/_/sql/new"
else
    echo "⚠️  No SQL setup file found"
fi

echo ""

# =====================================================
# 6. Create Workspace Directory
# =====================================================
echo "📁 Step 6/7: Setting up workspace..."

if [ ! -d workspace ]; then
    mkdir -p workspace
    echo "# Claude Libre Workspace" > workspace/README.md
    echo "" >> workspace/README.md
    echo "This is your protected workspace for file operations." >> workspace/README.md
    echo "Claude can read and write files here safely." >> workspace/README.md
fi

echo "✅ Workspace ready at ./workspace"
echo ""

# =====================================================
# 7. Verify Installation
# =====================================================
echo "🔍 Step 7/7: Verifying installation..."

if [ -f verify-setup.sh ]; then
    bash verify-setup.sh
else
    echo "⚠️  Verification script not found"
fi

echo ""
echo "=================================="
echo "✅ Setup Complete!"
echo "=================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Edit .env file and add your API keys:"
echo "   nano .env"
echo ""
echo "2. If using memory system, run SQL setup:"
echo "   - Open: https://supabase.com/dashboard/project/_/sql/new"
echo "   - Paste contents of: sql/setup-pgvector.sql"
echo "   - Execute the SQL"
echo ""
echo "3. Start the orchestrator:"
echo "   npm start"
echo ""
echo "4. Test the API:"
echo "   curl -X POST http://localhost:3001/api/chat \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"messages\":[{\"role\":\"user\",\"content\":\"Hello, list tools available\"}]}'"
echo ""
echo "5. Read documentation:"
echo "   - README.md - Quick start guide"
echo "   - docs/TOOLS.md - Tool documentation"
echo ""
echo "🎉 Welcome to Claude Libre - Total AI Freedom!"
echo ""
