import * as fs from 'fs';
import * as path from 'path';
import { defaultMcpServers, getVSCodeSettingsPath, McpServersConfig } from './mcpConfig';

export interface InstallResult {
    success: boolean;
    addedCount: number;
    message: string;
}

/**
 * Install MCP servers to VS Code configuration
 */
export async function installMcpServersToVSCode(): Promise<InstallResult> {
    try {
        const vsCodeConfigPath = getVSCodeSettingsPath();
        
        // Create settings file if it doesn't exist
        if (!fs.existsSync(vsCodeConfigPath)) {
            const settingsDir = path.dirname(vsCodeConfigPath);
            if (!fs.existsSync(settingsDir)) {
                fs.mkdirSync(settingsDir, { recursive: true });
            }
            fs.writeFileSync(vsCodeConfigPath, '{}');
        }
        
        // Read existing settings
        const settingsContent = fs.readFileSync(vsCodeConfigPath, 'utf8');
        let settings: any = {};
        
        try {
            settings = JSON.parse(settingsContent);
        } catch (error) {
            console.warn('Invalid JSON in settings file, creating new configuration');
            settings = {};
        }
        
        // Add MCP servers
        if (!settings['mcp']) {
            settings['mcp'] = {};
        }
        if (!settings['mcp']['servers']) {
            settings['mcp']['servers'] = {};
        }
        
        let addedCount = 0;
        for (const [serverName, serverConfig] of Object.entries(defaultMcpServers)) {
            if (!settings['mcp']['servers'][serverName]) {
                settings['mcp']['servers'][serverName] = serverConfig;
                addedCount++;
            }
        }
        
        // Write back settings
        fs.writeFileSync(vsCodeConfigPath, JSON.stringify(settings, null, 2));
        
        return {
            success: true,
            addedCount,
            message: `Successfully installed ${addedCount} MCP servers`
        };
        
    } catch (error) {
        return {
            success: false,
            addedCount: 0,
            message: `Failed to install MCP servers: ${error instanceof Error ? error.message : String(error)}`
        };
    }
}

/**
 * Check if MCP servers are already configured
 */
export function checkExistingMcpServers(): { hasServers: boolean; serverNames: string[] } {
    try {
        const vsCodeConfigPath = getVSCodeSettingsPath();
        
        if (!fs.existsSync(vsCodeConfigPath)) {
            return { hasServers: false, serverNames: [] };
        }
        
        const settingsContent = fs.readFileSync(vsCodeConfigPath, 'utf8');
        const settings = JSON.parse(settingsContent);
        
        const mcpServers = settings['mcp']?.['servers'] || {};
        const existingServerNames = Object.keys(defaultMcpServers).filter(
            serverName => mcpServers[serverName]
        );
        
        return {
            hasServers: existingServerNames.length > 0,
            serverNames: existingServerNames
        };
    } catch (error) {
        return { hasServers: false, serverNames: [] };
    }
}
