#!/bin/bash

# =====================================================
# Claude Libre - Setup Verification Script
# =====================================================

echo "🔍 Verifying Claude Libre Setup..."
echo "=================================="
echo ""

ERRORS=0
WARNINGS=0

# Check Node.js
echo -n "✓ Node.js: "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "✅ $NODE_VERSION"
else
    echo "❌ Not installed"
    ERRORS=$((ERRORS + 1))
fi

# Check npm
echo -n "✓ npm: "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "✅ $NPM_VERSION"
else
    echo "❌ Not installed"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "📦 Checking Core Dependencies..."

# Check @anthropic-ai/sdk
echo -n "✓ @anthropic-ai/sdk: "
if npm list @anthropic-ai/sdk &> /dev/null; then
    echo "✅"
else
    echo "❌ Not installed"
    ERRORS=$((ERRORS + 1))
fi

# Check express
echo -n "✓ express: "
if npm list express &> /dev/null; then
    echo "✅"
else
    echo "❌ Not installed"
    ERRORS=$((ERRORS + 1))
fi

# Check glob
echo -n "✓ glob: "
if npm list glob &> /dev/null; then
    echo "✅"
else
    echo "❌ Not installed"
    ERRORS=$((ERRORS + 1))
fi

# Check @supabase/supabase-js
echo -n "✓ @supabase/supabase-js: "
if npm list @supabase/supabase-js &> /dev/null; then
    echo "✅"
else
    echo "⚠️  Not installed (needed for database)"
    WARNINGS=$((WARNINGS + 1))
fi

# Check openai
echo -n "✓ openai: "
if npm list openai &> /dev/null; then
    echo "✅"
else
    echo "⚠️  Not installed (needed for embeddings)"
    WARNINGS=$((WARNINGS + 1))
fi

# Check playwright
echo -n "✓ playwright: "
if npm list playwright &> /dev/null; then
    echo "✅"
else
    echo "⚠️  Not installed (needed for browser automation)"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""
echo "📁 Checking Files..."

# Check .env
echo -n "✓ .env file: "
if [ -f .env ]; then
    echo "✅"
else
    echo "❌ Missing (copy from .env.example)"
    ERRORS=$((ERRORS + 1))
fi

# Check orchestrator
echo -n "✓ src/orchestrator.ts: "
if [ -f src/orchestrator.ts ]; then
    echo "✅"
else
    echo "❌ Missing"
    ERRORS=$((ERRORS + 1))
fi

# Check tools
echo -n "✓ src/tools/index.ts: "
if [ -f src/tools/index.ts ]; then
    echo "✅"
else
    echo "❌ Missing"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "🔑 Checking API Keys..."

if [ -f .env ]; then
    # Check Anthropic key
    echo -n "✓ ANTHROPIC_API_KEY: "
    if grep -q "ANTHROPIC_API_KEY=sk-ant-" .env 2>/dev/null; then
        echo "✅ Configured"
    else
        echo "❌ Not configured"
        ERRORS=$((ERRORS + 1))
    fi

    # Check OpenAI key
    echo -n "✓ OPENAI_API_KEY: "
    if grep -q "OPENAI_API_KEY=sk-" .env 2>/dev/null; then
        echo "✅ Configured"
    else
        echo "⚠️  Not configured (needed for memory)"
        WARNINGS=$((WARNINGS + 1))
    fi

    # Check SerpAPI key
    echo -n "✓ SERPAPI_KEY: "
    if grep -q "SERPAPI_KEY=.*[a-zA-Z0-9]" .env 2>/dev/null && ! grep -q "SERPAPI_KEY=your-serpapi-key-here" .env; then
        echo "✅ Configured"
    else
        echo "⚠️  Not configured (optional)"
        WARNINGS=$((WARNINGS + 1))
    fi

    # Check Supabase
    echo -n "✓ SUPABASE_URL: "
    if grep -q "SUPABASE_URL=https://" .env 2>/dev/null; then
        echo "✅ Configured"
    else
        echo "⚠️  Not configured (needed for database)"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

echo ""
echo "=================================="
echo "📊 Verification Summary"
echo "=================================="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ All checks passed! System ready."
    echo ""
    echo "Start with: npm start"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  $WARNINGS warning(s) found"
    echo "System is functional but some features may be limited."
    echo ""
    echo "Start with: npm start"
    exit 0
else
    echo "❌ $ERRORS error(s) and $WARNINGS warning(s) found"
    echo ""
    echo "Fix errors before starting:"
    if [ $ERRORS -gt 0 ]; then
        echo "  - Run: npm install"
        echo "  - Copy: cp .env.example .env"
        echo "  - Configure API keys in .env"
    fi
    exit 1
fi
