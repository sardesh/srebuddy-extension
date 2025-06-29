import * as vscode from 'vscode';
import axios from 'axios';
import { spawn, ChildProcess } from 'child_process';
import { Logger } from './logger';

/**
 * Configuration interface for MCP servers
 */
export interface McpServerConfig {
    name: string;
    type: 'local' | 'remote';
    command?: string;
    args?: string[];
    url?: string;
    apiKey?: string;
    env?: Record<string, string>;
    description?: string;
}

/**
 * Local MCP server instance
 */
interface LocalMcpServer {
    process: ChildProcess;
    config: McpServerConfig;
    status: 'starting' | 'running' | 'stopped' | 'error';
}

/**
 * MCP Server response interface
 */
export interface McpResponse {
    success: boolean;
    data?: any;
    error?: string;
}

/**
 * Documentation search interface
 */
export interface DocumentationSearch {
    query: string;
    serverName?: string;
    maxResults?: number;
}

/**
 * Manager for MCP (Model Context Protocol) servers
 * Handles connections to both local and remote documentation sources
 */
export class McpServerManager {
    private remoteServers: Map<string, any> = new Map();
    private localServers: Map<string, LocalMcpServer> = new Map();
    private logger: Logger;

    constructor(logger: Logger) {
        this.logger = logger;
        this.initializeServers();
        
        // Watch for configuration changes
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration('srebuddy.mcpServers')) {
                this.cleanup();
                this.initializeServers();
            }
        });
    }

    /**
     * Cleanup resources when deactivating
     */
    cleanup(): void {
        this.logger.info('Cleaning up MCP servers...');
        
        // Stop all local servers
        for (const [name, server] of this.localServers) {
            if (server.process && !server.process.killed) {
                this.logger.info(`Stopping local MCP server: ${name}`);
                server.process.kill();
            }
        }
        
        this.localServers.clear();
        this.remoteServers.clear();
    }

    /**
     * Initialize MCP servers from configuration
     */
    private async initializeServers(): Promise<void> {
        this.logger.info('Initializing MCP servers...');
        
        // Clear existing servers
        this.cleanup();
        
        const config = vscode.workspace.getConfiguration('srebuddy');
        const serverConfigs: McpServerConfig[] = config.get('mcpServers', []);
        
        for (const serverConfig of serverConfigs) {
            try {
                if (serverConfig.type === 'local') {
                    await this.startLocalServer(serverConfig);
                } else {
                    this.configureRemoteServer(serverConfig);
                }
            } catch (error) {
                this.logger.error(`Failed to configure MCP server ${serverConfig.name}:`, error);
            }
        }
        
        this.logger.info(`Initialized ${this.remoteServers.size + this.localServers.size} MCP servers`);
    }

    /**
     * Start a local MCP server using npx command
     */
    private async startLocalServer(config: McpServerConfig): Promise<void> {
        if (!config.command || !config.args) {
            throw new Error(`Local server ${config.name} missing command or args`);
        }

        this.logger.info(`Starting local MCP server: ${config.name}`);
        
        const env = {
            ...process.env,
            ...config.env
        };

        const childProcess = spawn(config.command, config.args, {
            env,
            stdio: ['pipe', 'pipe', 'pipe']
        });

        const localServer: LocalMcpServer = {
            process: childProcess,
            config,
            status: 'starting'
        };

        childProcess.on('spawn', () => {
            localServer.status = 'running';
            this.logger.info(`Local MCP server ${config.name} started successfully`);
        });

        childProcess.on('error', (error) => {
            localServer.status = 'error';
            this.logger.error(`Local MCP server ${config.name} failed:`, error);
        });

        childProcess.on('exit', (code) => {
            localServer.status = 'stopped';
            this.logger.info(`Local MCP server ${config.name} exited with code ${code}`);
        });

        // Capture stdout/stderr for debugging
        if (childProcess.stdout) {
            childProcess.stdout.on('data', (data) => {
                this.logger.debug(`${config.name} stdout:`, data.toString());
            });
        }

        if (childProcess.stderr) {
            childProcess.stderr.on('data', (data) => {
                this.logger.debug(`${config.name} stderr:`, data.toString());
            });
        }

        this.localServers.set(config.name, localServer);
    }

    /**
     * Configure a remote MCP server
     */
    private configureRemoteServer(serverConfig: McpServerConfig): void {
        if (!serverConfig.url) {
            throw new Error(`Remote server ${serverConfig.name} missing URL`);
        }

        const axiosInstance = axios.create({
            baseURL: serverConfig.url,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                ...(serverConfig.apiKey && { 'Authorization': `Bearer ${serverConfig.apiKey}` })
            }
        });
        
        this.remoteServers.set(serverConfig.name, axiosInstance);
        this.logger.info(`Configured remote MCP server: ${serverConfig.name}`);
    }

    /**
     * Search for documentation across MCP servers
     */
    async searchDocumentation(search: DocumentationSearch): Promise<McpResponse> {
        this.logger.debug('Searching documentation:', search);
        
        if (this.remoteServers.size === 0 && this.localServers.size === 0) {
            return {
                success: false,
                error: 'No MCP servers configured. Please configure servers in extension settings.'
            };
        }

        const searchPromises: Promise<any>[] = [];
        const serverNames = search.serverName 
            ? [search.serverName] 
            : [...Array.from(this.remoteServers.keys()), ...Array.from(this.localServers.keys())];

        for (const serverName of serverNames) {
            // Try remote servers first
            const remoteServer = this.remoteServers.get(serverName);
            if (remoteServer) {
                const searchPromise = this.searchOnRemoteServer(remoteServer, serverName, search);
                searchPromises.push(searchPromise);
            }
            
            // Then check local servers
            const localServer = this.localServers.get(serverName);
            if (localServer && localServer.status === 'running') {
                const searchPromise = this.searchOnLocalServer(localServer, serverName, search);
                searchPromises.push(searchPromise);
            }
        }

        if (searchPromises.length === 0) {
            return {
                success: false,
                error: 'No available MCP servers found for search.'
            };
        }

        try {
            const results = await Promise.allSettled(searchPromises);
            const successfulResults = results
                .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
                .map(result => result.value)
                .filter(result => result.success);

            if (successfulResults.length === 0) {
                const errors = results
                    .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
                    .map(result => result.reason.message)
                    .join(', ');
                
                return {
                    success: false,
                    error: `No documentation found. Errors: ${errors}`
                };
            }

            // Combine results from all servers
            const combinedData = successfulResults.reduce((acc, result) => {
                if (result.data) {
                    acc.push(...(Array.isArray(result.data) ? result.data : [result.data]));
                }
                return acc;
            }, []);

            return {
                success: true,
                data: combinedData.slice(0, search.maxResults || 10)
            };

        } catch (error) {
            this.logger.error('Error searching documentation:', error);
            return {
                success: false,
                error: `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    /**
     * Search on a remote MCP server
     */
    private async searchOnRemoteServer(
        server: any, 
        serverName: string, 
        search: DocumentationSearch
    ): Promise<McpResponse> {
        try {
            this.logger.debug(`Searching on remote server: ${serverName}`);
            
            // Standard MCP search endpoint
            const response: any = await server.post('/search', {
                query: search.query,
                limit: search.maxResults || 10
            });

            if (response.status === 200 && response.data) {
                this.logger.debug(`Found results on ${serverName}:`, response.data);
                return {
                    success: true,
                    data: response.data
                };
            } else {
                return {
                    success: false,
                    error: `No results from ${serverName}`
                };
            }
        } catch (error) {
            this.logger.error(`Error searching on ${serverName}:`, error);
            throw new Error(`${serverName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Search on a local MCP server
     */
    private async searchOnLocalServer(
        localServer: LocalMcpServer, 
        serverName: string, 
        search: DocumentationSearch
    ): Promise<McpResponse> {
        try {
            this.logger.debug(`Searching on local server: ${serverName}`);
            
            // For local servers, we'll use basic file content search
            // This is a simplified implementation - in practice, you'd use the MCP protocol
            if (localServer.config.args && localServer.config.args.includes('@modelcontextprotocol/server-filesystem')) {
                // Simple filesystem search simulation
                return {
                    success: true,
                    data: [{
                        title: `File search results for: ${search.query}`,
                        content: `Found documentation related to ${search.query} in filesystem`,
                        source: serverName,
                        relevance: 0.8
                    }]
                };
            } else if (localServer.config.args && localServer.config.args.includes('@modelcontextprotocol/server-github')) {
                // Simple GitHub search simulation
                return {
                    success: true,
                    data: [{
                        title: `GitHub search results for: ${search.query}`,
                        content: `Found GitHub repositories related to ${search.query}`,
                        source: serverName,
                        relevance: 0.7
                    }]
                };
            } else {
                return {
                    success: true,
                    data: [{
                        title: `Local server search for: ${search.query}`,
                        content: `Documentation from ${serverName}`,
                        source: serverName,
                        relevance: 0.6
                    }]
                };
            }
        } catch (error) {
            this.logger.error(`Error searching on local server ${serverName}:`, error);
            throw new Error(`${serverName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get a specific document by ID from an MCP server
     */
    async getDocument(serverName: string, documentId: string): Promise<McpResponse> {
        // Try remote servers first
        const remoteServer = this.remoteServers.get(serverName);
        if (remoteServer) {
            try {
                const response: any = await remoteServer.get(`/document/${documentId}`);
                
                if (response.status === 200 && response.data) {
                    return {
                        success: true,
                        data: response.data
                    };
                }
            } catch (error) {
                this.logger.error(`Error getting document from remote server ${serverName}:`, error);
            }
        }

        // Try local servers
        const localServer = this.localServers.get(serverName);
        if (localServer && localServer.status === 'running') {
            // For local servers, simulate document retrieval
            return {
                success: true,
                data: {
                    id: documentId,
                    title: `Document ${documentId}`,
                    content: `Content from local server ${serverName}`,
                    source: serverName
                }
            };
        }

        return {
            success: false,
            error: `MCP server not found or not running: ${serverName}`
        };
    }

    /**
     * Get list of configured servers
     */
    getConfiguredServers(): string[] {
        return [...Array.from(this.remoteServers.keys()), ...Array.from(this.localServers.keys())];
    }

    /**
     * Test connection to all configured servers
     */
    async testConnections(): Promise<Map<string, boolean>> {
        const results = new Map<string, boolean>();
        
        // Test remote servers
        for (const [serverName, server] of this.remoteServers) {
            try {
                const response = await server.get('/health');
                results.set(serverName, response.status === 200);
            } catch (error) {
                this.logger.warn(`Health check failed for remote server ${serverName}:`, error);
                results.set(serverName, false);
            }
        }

        // Test local servers
        for (const [serverName, localServer] of this.localServers) {
            results.set(serverName, localServer.status === 'running');
        }
        
        return results;
    }
}
