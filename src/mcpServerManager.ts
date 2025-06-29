import * as vscode from 'vscode';
import { Logger } from './logger';

/**
 * Simplified MCP Server Manager
 * No longer manages MCP servers directly - delegates to VS Code's native MCP system
 */
export class McpServerManager {
    private logger: Logger;

    constructor(logger: Logger) {
        this.logger = logger;
        this.logger.info('MCP Server Manager initialized - using VS Code native MCP system');
    }

    /**
     * Cleanup resources when deactivating (no-op since VS Code manages everything)
     */
    cleanup(): void {
        this.logger.info('MCP Server Manager cleanup completed');
    }

    /**
     * Get available MCP servers from VS Code's configuration
     */
    async getServerStatus(): Promise<string[]> {
        const config = vscode.workspace.getConfiguration('mcp');
        const servers = config.get<Record<string, any>>('servers', {});
        
        const serverNames = Object.keys(servers);
        this.logger.info(`Found ${serverNames.length} MCP servers in VS Code configuration`);
        
        return serverNames;
    }

    /**
     * Refresh MCP server configuration (delegates to VS Code)
     */
    refresh(): void {
        this.logger.info('MCP server refresh requested - handled by VS Code');
        // VS Code automatically handles MCP server configuration changes
    }
}
