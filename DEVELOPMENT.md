# Development Setup Guide

This guide will help you set up the SreBuddy extension for development on any system.

## 🚀 Quick Setup

### Prerequisites

Ensure you have the following installed:

- **VS Code** 1.101.0 or later
- **Node.js** 20.x or later
- **Git** (for version control)
- **GitHub Copilot** extension (for testing)

### Clone and Setup

```bash
# Clone the repository
git clone https://github.com/your-username/srebuddy-extension.git
cd srebuddy-extension

# Install dependencies
npm install

# Compile the extension
npm run compile

# Open in VS Code
code .
```

### Development Workflow

1. **Start watch mode** (recommended for development):

   ```bash
   npm run watch
   ```

2. **Launch Extension Development Host**:

   - Press `F5` in VS Code
   - This opens a new VS Code window with the extension loaded

3. **Test the extension**:

   - Open Copilot Chat in the development window
   - Try commands like: `@srebuddy implement prometheus monitoring`

4. **Make changes**:
   - Edit files in `src/`
   - Changes will auto-compile (if using watch mode)
   - Reload the Extension Development Host (`Ctrl+R`/`Cmd+R`)

## 🔧 Available Scripts

```bash
# Development
npm run watch           # Watch mode - auto compile on changes
npm run compile         # One-time compilation
npm run check-types     # TypeScript type checking
npm run lint           # ESLint code analysis

# Testing
npm run test           # Run tests
npm run pretest        # Compile tests and lint

# Building
npm run package        # Production build
npm run vsce:package   # Create .vsix package for distribution

# Publishing (maintainers only)
npm run vsce:publish   # Publish to VS Code Marketplace
npm run ovsx:publish   # Publish to Open VSX Registry
```

## 📁 Key Files for Development

### Source Code

- `src/extension.ts` - Extension activation/deactivation
- `src/chatParticipant.ts` - Main chat participant logic
- `src/srePromptLoader.ts` - Dynamic prompt template loading
- `src/mcpServerManager.ts` - MCP server management
- `src/sreTaskParser.ts` - Natural language task parsing

### Configuration

- `package.json` - Extension manifest and dependencies
- `tsconfig.json` - TypeScript configuration
- `eslint.config.mjs` - ESLint configuration
- `esbuild.js` - Build configuration

### Templates and Documentation

- `.github/copilot-instructions.md` - SRE prompt templates
- `MCP_CONFIGURATION.md` - MCP server setup guide
- `README.md` - Main documentation

## 🧪 Testing Your Changes

### Manual Testing

1. **Basic functionality**:

   ```
   @srebuddy implement dynatrace agent
   @srebuddy configure kubernetes cluster
   @srebuddy monitor application performance
   @srebuddy deploy microservices
   @srebuddy troubleshoot high cpu usage
   ```

2. **MCP integration** (if configured):

   - Test with different MCP servers
   - Verify documentation retrieval
   - Check error handling

3. **Edge cases**:
   - Invalid commands
   - Missing parameters
   - Network failures (for remote MCP servers)

### Command Palette Testing

Test agent mode commands:

- `Ctrl+Shift+P` → "SreBuddy: Configure MCP Servers"
- `Ctrl+Shift+P` → "SreBuddy: Setup Prompt Templates"

## 🏗️ Architecture Overview

```
User Input (@srebuddy command)
         ↓
SreBuddyChatParticipant
         ↓
SreTaskParser (parse command/target/environment)
         ↓
SrePromptLoader (find matching template)
         ↓
McpServerManager (get relevant docs)
         ↓
Combine template + docs → Send to LLM
         ↓
Return formatted response
```

## 🔄 Making Changes

### Adding New SRE Commands

1. **Add prompt template** in `.github/copilot-instructions.md`:

   ```markdown
   ## SRE [NewCommand] Prompts

   ### Examples

   - [newcommand] [scenario]

   ### Prompt

   [Template content...]
   ```

2. **Update task parser** in `src/sreTaskParser.ts`:

   ```typescript
   // Add recognition pattern
   if (input.includes('newcommand')) {
       return { command: 'newcommand', ... };
   }
   ```

3. **Test the new command**:
   ```
   @srebuddy newcommand [target]
   ```

### Adding MCP Server Support

1. **Add to default config** in `package.json`:

   ```json
   {
     "name": "new-server",
     "type": "local",
     "command": "npx",
     "args": ["@some/mcp-server"],
     "description": "What this server provides"
   }
   ```

2. **Update MCP manager** if needed in `src/mcpServerManager.ts`

3. **Document** in `MCP_CONFIGURATION.md`

## 🐛 Debugging

### Enable Logging

1. Open VS Code Settings
2. Search for "srebuddy"
3. Enable "Srebuddy: Enable Logging"

### View Logs

- **Output Panel**: View → Output → "SreBuddy"
- **Developer Tools**: Help → Toggle Developer Tools → Console

### Common Issues

1. **Extension not loading**:

   - Check VS Code version compatibility
   - Review error logs in Developer Tools

2. **MCP servers not working**:

   - Verify `npx` is available
   - Check environment variables
   - Review MCP server logs

3. **Prompt templates not loading**:
   - Verify `.github/copilot-instructions.md` exists
   - Check file format and syntax

## 📦 Building for Distribution

```bash
# Create production build
npm run vsce:package

# This creates srebuddy-X.Y.Z.vsix
# Install manually: code --install-extension srebuddy-X.Y.Z.vsix
```

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed contribution guidelines.

## 📚 Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [GitHub Copilot Extensions](https://code.visualstudio.com/docs/copilot/copilot-chat)
- [Model Context Protocol](https://github.com/modelcontextprotocol)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🆘 Getting Help

- **Issues**: Report bugs and request features on GitHub
- **Discussions**: Ask questions in GitHub Discussions
- **Documentation**: Check README.md and inline code comments
