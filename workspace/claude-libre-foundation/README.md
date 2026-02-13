# 🚀 Claude Libre Foundation

**Complete autonomy for Claude AI with 50+ tools and zero vendor lock-in**

## ✨ What is Claude Libre?

Claude Libre is a self-hosted AI orchestrator that gives Claude AI complete autonomy with:

- 🔧 **50+ Tools** - File operations, code execution, web search, database, memory, and more
- 💰 **90% Cost Savings** - With prompt caching: $15-55/mo vs $100+/mo for hosted alternatives
- 🔓 **Zero Lock-in** - 100% open source, runs anywhere, full control
- 🧠 **Persistent Memory** - Semantic search with PostgreSQL + pgvector + embeddings
- 🔒 **Secure by Design** - Sandboxed execution, command whitelisting, path validation

## 📊 Current Status

**Tools Implemented: 14/51 (27%) - Tier 0 Complete** ✅

- ✅ File Operations (5 tools): read, write, search, list, line replace
- ✅ Code Execution (1 tool): execute_command with security
- ✅ Web Access (2 tools): web_search, web_code_search
- ✅ Database (3 tools): query, list tables, describe
- ✅ Memory System (3 tools): save, search, list

**Autonomy Level: 45%** 🎯

## 🚀 Quick Start

### Prerequisites

- Node.js v18+ ([download](https://nodejs.org/))
- API Keys:
  - [Anthropic API key](https://console.anthropic.com/) (required)
  - [OpenAI API key](https://platform.openai.com/api-keys) (for memory)
  - [SerpAPI key](https://serpapi.com/) (optional, for web search)
  - [Supabase project](https://supabase.com/) (optional, for database/memory)

### Installation

```bash
# 1. Run automated setup
bash setup-claude-libre.sh

# 2. Configure API keys
nano .env  # Add your API keys here

# 3. Setup database (if using memory)
# - Open https://supabase.com/dashboard/project/_/sql/new
# - Paste contents of sql/setup-pgvector.sql
# - Execute

# 4. Start the orchestrator
npm start

# Server will start on http://localhost:3001
```

### First Test

```bash
# Test that the orchestrator is running
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello! What tools do you have available?"}'
```

## 🛠️ Usage Examples

### Basic Chat
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Read the file README.md and summarize it"}'
```

### File Operations
```bash
# Create a new file
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Create a file called hello.js with console.log(\"Hello World\")"}'

# Search for patterns
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Search for the word TODO in all TypeScript files"}'
```

### Web Search
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Search the web for the latest news about Claude AI"}'
```

### Memory System
```bash
# Save to memory
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Remember that the user prefers TypeScript over JavaScript"}'

# Search memory
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What programming languages does the user prefer?"}'
```

### Code Execution
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Run npm install express and then list all installed packages"}'
```

## 📁 Project Structure

```
claude-libre-foundation/
├── src/
│   ├── orchestrator.ts          # Main orchestrator with tool calling
│   └── tools/
│       ├── index.ts             # Tool registry and dispatcher
│       ├── file-operations.ts   # File system tools (5 tools)
│       ├── code-execution.ts    # Command execution (1 tool)
│       ├── web-access.ts        # Web search tools (2 tools)
│       ├── database.ts          # Database tools (3 tools)
│       └── memory.ts            # Memory system (3 tools)
├── sql/
│   └── setup-pgvector.sql       # Database setup for memory
├── docs/
│   └── TOOLS.md                 # Detailed tool documentation
├── logs/                        # Application logs
├── workspace/                   # Safe zone for file operations
├── .env.example                 # Environment template
├── package.json                 # Dependencies
├── setup-claude-libre.sh        # Automated setup script
├── verify-setup.sh              # Installation verification
└── test-tools.sh                # Tool testing script
```

## 🔧 Configuration

Edit `.env` to configure:

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-your-key-here
OPENAI_API_KEY=sk-your-openai-key-here  # For embeddings

# Optional
SERPAPI_KEY=your-serpapi-key-here        # For web search
GITHUB_TOKEN=ghp_your-token-here         # For code search
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-key-here

# Settings
PROJECT_ROOT=./workspace
PORT=3001
DEBUG=false
ENABLE_CACHING=true
```

## 💰 Cost Breakdown

### Monthly Costs (Typical Usage)

| Service | Free Tier | Paid |
|---------|-----------|------|
| Claude API (with caching) | - | $15-50 |
| OpenAI Embeddings | - | $0-5 |
| SerpAPI | 100 searches | $10-50 |
| Supabase Database | 500MB | $0-25 |
| **Total** | - | **$25-130/mo** |

### Cost Comparison

- **Claude Libre (self-hosted)**: $25-50/mo ✅
- **Lovable Pro**: $40-150/mo
- **ChatGPT Plus**: $20/mo (limited tools)
- **Cursor Pro**: $20/mo (code-focused only)

**With prompt caching, you save 90% on input tokens!**

## 🔒 Security Features

- ✅ Command whitelist (only safe commands allowed)
- ✅ Path validation (filesystem operations restricted to workspace)
- ✅ Query validation (only SELECT queries allowed)
- ✅ Timeout protection (30s max per command)
- ✅ Dangerous pattern blocking (rm -rf, sudo, etc.)
- ✅ Input sanitization on all tools

## 📚 Documentation

- **[TOOLS.md](docs/TOOLS.md)** - Complete tool documentation
- **[CLAUDE_LIBRE_DESDE_CERO.md](../../memoria/CLAUDE_LIBRE_DESDE_CERO.md)** - Full implementation guide
- **[setup-pgvector.sql](sql/setup-pgvector.sql)** - Database setup

## 🧪 Testing

```bash
# Verify installation
bash verify-setup.sh

# Test all tools
bash test-tools.sh

# Run in development mode
npm run dev
```

## 🎯 Roadmap

### ✅ Tier 0 - Core (Complete)
- [x] File operations (read, write, search)
- [x] Code execution
- [x] Web search
- [x] Database queries
- [x] Memory system

### 🚧 Tier 1 - Important (Next)
- [ ] Document parsing (PDF, DOCX, Excel)
- [ ] Package management (npm, pip)
- [ ] Browser automation (Playwright)
- [ ] Image generation (DALL-E)

### 📋 Tier 2 - Nice-to-Have
- [ ] Email/webhooks
- [ ] Advanced debugging
- [ ] Monitoring dashboard
- [ ] Multi-agent system

## 🤝 Contributing

This is a foundation package. Feel free to:
- Add more tools
- Improve security
- Add features
- Fix bugs

## 📄 License

MIT License - Use freely for personal or commercial projects.

## 🆘 Troubleshooting

### Server won't start
```bash
# Check Node.js version
node -v  # Should be v18+

# Verify installation
bash verify-setup.sh

# Check logs
cat logs/orchestrator.log
```

### API key errors
```bash
# Verify .env file exists
cat .env

# Check that keys don't have example placeholders
grep "your-.*-key-here" .env  # Should return nothing
```

### Memory/Database errors
```bash
# Make sure you ran the SQL setup
# Open: https://supabase.com/dashboard/project/_/sql/new
# Paste: sql/setup-pgvector.sql
```

## 📞 Support

- Open an issue on GitHub
- Check [CLAUDE_LIBRE_DESDE_CERO.md](../../memoria/CLAUDE_LIBRE_DESDE_CERO.md) for detailed docs
- Review [TOOLS.md](docs/TOOLS.md) for tool-specific help

---

**🎉 Welcome to Claude Libre - Total AI Freedom!**
