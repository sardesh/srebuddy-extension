# MCP Server Configuration Guide

## Overview

SreBuddy leverages VS Code's native MCP (Model Context Protocol) system and automatically configures MCP servers on first activation. No manual setup required!

## How It Works

1. **Automatic Installation**: When you first activate SreBuddy, it will prompt you to install default MCP servers
2. **Native Integration**: Uses VS Code's built-in MCP system for optimal performance
3. **Seamless Experience**: Just use `@srebuddy` in GitHub Copilot Chat

## Default MCP Server

SreBuddy includes one essential MCP server to get you started:

### SQLite Server (`srebuddy-sqlite`)

- **Purpose**: Query and explore SQLite databases in your workspace
- **Package**: `@modelcontextprotocol/server-sqlite`
- **Requirements**: None - works out of the box

## First-Time Setup

1. **Install the Extension**: Install SreBuddy from the VS Code marketplace
2. **Automatic Prompt**: On first activation, you'll see a prompt asking to install MCP servers
3. **One-Click Install**: Click "Install Now" to automatically configure the MCP server
4. **Restart VS Code**: Restart to activate the MCP servers
5. **Start Using**: Use `@srebuddy` in GitHub Copilot Chat

## Manual Configuration (Optional)

If you prefer manual setup or need to customize, add this to your VS Code `settings.json`:

**To open settings.json:**

- Press `Cmd/Ctrl + Shift + P` → Type "Preferences: Open User Settings (JSON)"
- Or press `Cmd/Ctrl + ,` → Click the "Open Settings (JSON)" icon

```json
{
  "mcp": {
    "servers": {
      "srebuddy-sqlite": {
        "command": "npx",
        "args": ["@modelcontextprotocol/server-sqlite"]
      }
    }
  }
}
```

## Installation

Install the MCP server package globally:

```bash
npm install -g @modelcontextprotocol/server-sqlite
```

## Benefits

- **Zero Configuration**: Works out of the box with default settings
- **Native Performance**: Uses VS Code's optimized MCP implementation
- **Automatic Context**: Database context is automatically available to GitHub Copilot
- **Standard Configuration**: Uses VS Code's standard `mcp.servers` configuration
- **No Maintenance**: VS Code handles all server management

## Troubleshooting

### MCP Server Not Working

1. **Check Installation**: Ensure the MCP server package is installed globally

   ```bash
   npm list -g @modelcontextprotocol/server-sqlite
   ```

2. **Verify Configuration**: Check VS Code settings for `mcp.servers`

   - Open settings.json: `Cmd/Ctrl + Shift + P` → "Preferences: Open User Settings (JSON)"
   - Look for the `"mcp": { "servers": { ... } }` section

3. **Restart VS Code**: Configuration changes require restart

4. **Check VS Code Output**: Look for MCP-related messages in VS Code's output panel

### Manual Verification

Check if the MCP server is working:

1. Open VS Code Command Palette (`Cmd/Ctrl + Shift + P`)
2. Look for MCP-related commands
3. Check that the server appears in GitHub Copilot context

### Manual Installation

If automatic MCP server installation fails, manually install:

```bash
npm install -g @modelcontextprotocol/server-sqlite
```
