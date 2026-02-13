#!/bin/bash

# =====================================================
# Claude Libre - Tool Testing Script
# =====================================================

echo "🧪 Testing Claude Libre Tools..."
echo "=================================="
echo ""

PORT=${PORT:-3001}
API_URL="http://localhost:$PORT/api/chat"

# Check if server is running
echo "📡 Checking server status..."
if ! curl -s "$API_URL" > /dev/null 2>&1; then
    echo "❌ Server not running on port $PORT"
    echo "Start with: npm start"
    exit 1
fi
echo "✅ Server is running"
echo ""

# Test function
test_tool() {
    local tool_name=$1
    local prompt=$2
    
    echo -n "Testing $tool_name... "
    
    response=$(curl -s -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -d "{\"messages\":[{\"role\":\"user\",\"content\":\"$prompt\"}]}" \
        2>/dev/null)
    
    if [ $? -eq 0 ] && [ -n "$response" ]; then
        echo "✅"
        return 0
    else
        echo "❌"
        return 1
    fi
}

# Test read_file
test_tool "read_file" "Read the file README.md and show me the first 10 lines"

# Test list_directory
test_tool "list_directory" "List all files in the current directory"

# Test web_search (if configured)
if grep -q "SERPAPI_KEY=.*[a-zA-Z0-9]" .env 2>/dev/null && ! grep -q "SERPAPI_KEY=your-serpapi-key-here" .env; then
    test_tool "web_search" "Search the web for 'Claude AI latest news'"
else
    echo "⏭️  Skipping web_search (SERPAPI_KEY not configured)"
fi

# Test execute_command (safe commands only)
test_tool "execute_command" "Execute command: ls -la"

echo ""
echo "=================================="
echo "✅ Testing Complete"
echo "=================================="
echo ""
echo "For more detailed testing, interact with the API:"
echo "curl -X POST $API_URL \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"messages\":[{\"role\":\"user\",\"content\":\"Your message here\"}]}'"
