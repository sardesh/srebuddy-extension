# SreBuddy Extension - Installation Guide

## 📦 VSIX Package Generated

The SreBuddy extension has been successfully packaged as `srebuddy-0.1.0.vsix` (32.4 KB).

## 🚀 Installation

### Option 1: Install from VSIX File

1. **Install the Extension:**

   ```bash
   code --install-extension srebuddy-0.1.0.vsix
   ```

2. **Or via VS Code UI:**
   - Open VS Code
   - Go to Extensions view (Ctrl+Shift+X)
   - Click "..." menu → "Install from VSIX..."
   - Select `srebuddy-0.1.0.vsix`

### Option 2: Manual Installation

1. Copy the VSIX file to your VS Code extensions directory
2. Restart VS Code

## ✨ First-Time Setup

1. **Automatic MCP Server Setup:**

   - On first activation, SreBuddy will prompt you to install the default MCP server
   - Click "Install Now" for automatic configuration
   - Restart VS Code when prompted

2. **Manual MCP Server Installation (if needed):**
   ```bash
   npm install -g @modelcontextprotocol/server-sqlite
   ```

## 🛠 Usage

- Use `@srebuddy` in GitHub Copilot Chat
- Access SreBuddy commands via Command Palette (Ctrl+Shift+P)
- Available commands:
  - `SreBuddy: Implementation Task`
  - `SreBuddy: Generate Config`
  - `SreBuddy: Deployment Plan`
  - `SreBuddy: Troubleshooting Guide`
  - `SreBuddy: Setup Monitoring`

## 🔧 Key Features

- **Zero Configuration:** Works out of the box
- **Native MCP Integration:** Uses VS Code's built-in MCP system
- **Automatic Setup:** One-click MCP server installation
- **Modular Design:** Clean, maintainable codebase
- **Single MCP Server:** Lightweight with just SQLite server for database exploration

## 📁 What's Included

The VSIX package includes:

- Compiled extension code (`dist/extension.js`)
- SRE prompt templates (`copilot-instructions.md`)
- Documentation (`README.md`, `MCP_CONFIGURATION.md`)
- License and changelog

## 🔄 Code Improvements Made

1. **Eliminated Duplication:** Removed `install-mcp-servers.js` script
2. **Modular Architecture:** Created shared modules (`mcpConfig.ts`, `mcpInstaller.ts`)
3. **Simplified Configuration:** Only one essential MCP server (SQLite)
4. **Single Source of Truth:** All MCP configuration in one place
5. **Automatic Installation:** Extension handles MCP setup automatically
6. **Correct Settings Structure:** Uses proper `"mcp": { "servers": { ... } }` format

The extension is now ready for distribution and provides a seamless user experience!
