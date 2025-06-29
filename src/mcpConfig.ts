/**
 * Shared MCP server configuration for SreBuddy
 * This is the single source of truth for default MCP servers
 */

export interface McpServerConfig {
    command: string;
    args: string[];
    env?: Record<string, string>;
}

export interface McpServersConfig {
    [serverName: string]: McpServerConfig;
}

/**
 * Default MCP servers for SreBuddy
 * Keep this minimal - only include essential servers
 */
export const defaultMcpServers: McpServersConfig = {
    "srebuddy-sqlite": {
        "command": "npx",
        "args": ["@modelcontextprotocol/server-sqlite"]
    }
};

/**
 * Get VS Code settings path for the current platform
 */
export function getVSCodeSettingsPath(): string {
    const os = require('os');
    const path = require('path');
    
    const platform = os.platform();
    const home = os.homedir();
    
    switch (platform) {
        case 'win32':
            return path.join(home, 'AppData', 'Roaming', 'Code', 'User', 'settings.json');
        case 'darwin':
            return path.join(home, 'Library', 'Application Support', 'Code', 'User', 'settings.json');
        case 'linux':
            return path.join(home, '.config', 'Code', 'User', 'settings.json');
        default:
            throw new Error(`Unsupported platform: ${platform}`);
    }
}
