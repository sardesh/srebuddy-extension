# MCP Server Configuration Guide

## Default MCP Servers

The SreBuddy extension comes with three pre-configured MCP servers that use `npx` commands:

### 1. Filesystem Server

- **Name**: `filesystem`
- **Command**: `npx @modelcontextprotocol/server-filesystem /`
- **Purpose**: Provides access to local filesystem for documentation
- **Configuration**: No additional setup required

### 2. GitHub Server

- **Name**: `github`
- **Command**: `npx @modelcontextprotocol/server-github`
- **Purpose**: Access GitHub repositories for documentation
- **Setup Required**: Set `GITHUB_PERSONAL_ACCESS_TOKEN` environment variable

### 3. Brave Search Server

- **Name**: `brave-search`
- **Command**: `npx @modelcontextprotocol/server-brave-search`
- **Purpose**: Web search capabilities via Brave Search API
- **Setup Required**: Set `BRAVE_API_KEY` environment variable

## How to Configure

1. Open VS Code Settings (Cmd/Ctrl + ,)
2. Search for "srebuddy mcp"
3. Modify the "Srebuddy: Mcp Servers" setting
4. For servers requiring API keys, add them to your environment or the server configuration

## Example Configuration

```json
{
  "srebuddy.mcpServers": [
    {
      "name": "filesystem",
      "type": "local",
      "command": "npx",
      "args": [
        "@modelcontextprotocol/server-filesystem",
        "/Users/username/docs"
      ],
      "description": "Local documentation folder"
    },
    {
      "name": "github",
      "type": "local",
      "command": "npx",
      "args": ["@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your_token_here"
      },
      "description": "GitHub repository access"
    }
  ]
}
```

## Environment Variables

For security, it's recommended to set environment variables rather than storing tokens in VS Code settings:

```bash
export GITHUB_PERSONAL_ACCESS_TOKEN="your_github_token"
export BRAVE_API_KEY="your_brave_api_key"
```

## Adding Custom Servers

You can add both local (npx-based) and remote (HTTP-based) MCP servers:

### Local Server

```json
{
  "name": "my-local-server",
  "type": "local",
  "command": "npx",
  "args": ["my-mcp-server", "--config", "path/to/config"],
  "env": {
    "API_KEY": "value"
  }
}
```

### Remote Server

```json
{
  "name": "my-remote-server",
  "type": "remote",
  "url": "https://api.example.com/mcp",
  "apiKey": "your_api_key"
}
```
