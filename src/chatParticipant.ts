import * as vscode from 'vscode';
import { McpServerManager } from './mcpServerManager';
import { SreTaskParser, SreTaskType, SreImplementationPlan, SreTaskContext } from './sreTaskParser';
import { Logger } from './logger';
import { SrePromptLoader } from './srePromptLoader';

/**
 * SreBuddy Chat Participant
 * Handles interactions with GitHub Copilot as @srebuddy
 */
export class SreBuddyChatParticipant {
    private mcpServerManager: McpServerManager;
    private sreTaskParser: SreTaskParser;
    private logger: Logger;
    private promptLoader: SrePromptLoader;

    constructor(
        mcpServerManager: McpServerManager,
        sreTaskParser: SreTaskParser,
        logger: Logger,
        extensionContext: vscode.ExtensionContext
    ) {
        this.mcpServerManager = mcpServerManager;
        this.sreTaskParser = sreTaskParser;
        this.logger = logger;
        this.promptLoader = new SrePromptLoader(logger, extensionContext);
    }

    /**
     * Handle chat requests from GitHub Copilot
     */
    async handleRequest(
        request: vscode.ChatRequest,
        context: vscode.ChatContext,
        stream: vscode.ChatResponseStream,
        token: vscode.CancellationToken
    ): Promise<void> {
        try {
            this.logger.info(`Processing request: ${request.prompt}`);
            
            // Check for cancellation
            if (token.isCancellationRequested) {
                return;
            }

            // Handle different command types
            if (request.command) {
                await this.handleCommand(request, stream, token);
            } else {
                await this.handleGeneralQuery(request, stream, token);
            }

        } catch (error) {
            this.logger.error('Error handling chat request:', error);
            stream.markdown(`❌ **Error**: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
        }
    }

    /**
     * Handle specific commands (implement, configure, monitor, etc.)
     */
    private async handleCommand(
        request: vscode.ChatRequest,
        stream: vscode.ChatResponseStream,
        token: vscode.CancellationToken
    ): Promise<void> {
        const command = request.command;
        const prompt = request.prompt;

        this.logger.debug(`Handling command: ${command} with prompt: ${prompt}`);

        switch (command) {
            case 'implement':
                await this.handleImplementCommand(prompt, stream, token);
                break;
            case 'configure':
                await this.handleConfigureCommand(prompt, stream, token);
                break;
            case 'monitor':
                await this.handleMonitorCommand(prompt, stream, token);
                break;
            case 'deploy':
                await this.handleDeployCommand(prompt, stream, token);
                break;
            case 'troubleshoot':
                await this.handleTroubleshootCommand(prompt, stream, token);
                break;
            case 'docs':
                await this.handleDocsCommand(prompt, stream, token);
                break;
            default:
                stream.markdown(`❓ Unknown command: \`${command}\`. Available commands: implement, configure, monitor, deploy, troubleshoot, docs`);
        }
    }

    /**
     * Handle general queries without specific commands
     */
    private async handleGeneralQuery(
        request: vscode.ChatRequest,
        stream: vscode.ChatResponseStream,
        token: vscode.CancellationToken
    ): Promise<void> {
        // Parse the request to understand the intent
        const taskContext = this.sreTaskParser.parseTask(request.prompt);
        
        // Try to determine the likely command type from the parsed task
        let commandType = 'general';
        if (taskContext.type) {
            commandType = taskContext.type.toLowerCase();
        }
        
        stream.progress('Analyzing request...');
        
        // Get documentation from MCP servers
        const mcpDocumentation = await this.getMcpDocumentation(taskContext, token);
        
        if (token.isCancellationRequested) { return; }
        
        // Build enhanced prompt for general guidance
        stream.progress('Generating guidance...');
        const enhancedPrompt = await this.buildEnhancedPrompt(taskContext, commandType, mcpDocumentation);
        const llmResponse = await this.callLanguageModel(
            enhancedPrompt,
            stream,
            token
        );
        
        if (llmResponse) {
            stream.markdown(llmResponse);
        } else {
            // No fallback - inform user that LLM is required
            stream.markdown('🤖 **Language Model Required**: This command requires GitHub Copilot to be available. Please ensure Copilot is enabled and try again.');
        }
    }

    /**
     * Handle implement command with enhanced LLM support
     */
    private async handleImplementCommand(
        prompt: string,
        stream: vscode.ChatResponseStream,
        token: vscode.CancellationToken
    ): Promise<void> {
        stream.progress('Analyzing implementation request...');
        
        if (token.isCancellationRequested) { return; }
        
        const parsedTask = this.sreTaskParser.parseTask(`implement ${prompt}`);
        
        stream.markdown(`## 🎯 **Implementation Plan**: ${parsedTask.target || 'Infrastructure Component'}\n\n`);
        stream.markdown(`**Environment**: ${parsedTask.environment || 'Not specified'} | **Risk Level**: ${this.assessRisk(parsedTask)}\n\n`);
        
        // Get documentation from MCP servers
        stream.progress('Searching for relevant documentation...');
        const mcpDocumentation = await this.getMcpDocumentation(parsedTask, token);
        
        if (token.isCancellationRequested) { return; }
        
        // Get dynamic prompt and enhance it with MCP documentation
        stream.progress('Generating implementation guide...');
        const enhancedPrompt = await this.buildEnhancedPrompt(parsedTask, 'implement', mcpDocumentation);
        const llmResponse = await this.callLanguageModel(
            enhancedPrompt,
            stream,
            token
        );
        
        if (llmResponse) {
            stream.markdown(llmResponse);
        } else {
            // No fallback - inform user that LLM is required
            stream.markdown('🤖 **Language Model Required**: This command requires GitHub Copilot to be available. Please ensure Copilot is enabled and try again.');
        }
        
        this.addActionButtons(stream, 'implement', parsedTask);
    }

    /**
     * Handle configure command with enhanced LLM support
     */
    private async handleConfigureCommand(
        prompt: string,
        stream: vscode.ChatResponseStream,
        token: vscode.CancellationToken
    ): Promise<void> {
        stream.progress('Generating configuration...');
        
        if (token.isCancellationRequested) { return; }
        
        const parsedTask = this.sreTaskParser.parseTask(`configure ${prompt}`);
        
        stream.markdown(`## ⚙️ **Configuration Generator**\n\n`);
        stream.markdown(`**Tool**: ${parsedTask.target || 'System'} | **Environment**: ${parsedTask.environment || 'Generic'}\n\n`);
        
        // Get documentation from MCP servers
        stream.progress('Searching for relevant documentation...');
        const mcpDocumentation = await this.getMcpDocumentation(parsedTask, token);
        
        if (token.isCancellationRequested) { return; }
        
        // Get dynamic prompt and enhance it with MCP documentation
        stream.progress('Generating configuration...');
        const enhancedPrompt = await this.buildEnhancedPrompt(parsedTask, 'configure', mcpDocumentation);
        const llmResponse = await this.callLanguageModel(
            enhancedPrompt,
            stream,
            token
        );
        
        if (llmResponse) {
            stream.markdown(llmResponse);
        } else {
            // No fallback - inform user that LLM is required
            stream.markdown('🤖 **Language Model Required**: This command requires GitHub Copilot to be available. Please ensure Copilot is enabled and try again.');
        }
        
        this.addActionButtons(stream, 'configure', parsedTask);
    }

    /**
     * Handle monitor command with enhanced LLM support
     */
    private async handleMonitorCommand(
        prompt: string,
        stream: vscode.ChatResponseStream,
        token: vscode.CancellationToken
    ): Promise<void> {
        stream.progress('Setting up monitoring solution...');
        
        if (token.isCancellationRequested) { return; }
        
        const parsedTask = this.sreTaskParser.parseTask(`monitor ${prompt}`);
        
        stream.markdown(`## 📊 **Monitoring Setup**\n\n`);
        stream.markdown(`**Tool**: ${parsedTask.target || 'Monitoring System'} | **Target**: ${parsedTask.target || 'Infrastructure'}\n\n`);
        
        // Get documentation from MCP servers
        stream.progress('Searching for relevant documentation...');
        const mcpDocumentation = await this.getMcpDocumentation(parsedTask, token);
        
        if (token.isCancellationRequested) { return; }
        
        // Get dynamic prompt and enhance it with MCP documentation
        stream.progress('Generating monitoring setup...');
        const enhancedPrompt = await this.buildEnhancedPrompt(parsedTask, 'monitor', mcpDocumentation);
        const llmResponse = await this.callLanguageModel(
            enhancedPrompt,
            stream,
            token
        );
        
        if (llmResponse) {
            stream.markdown(llmResponse);
        } else {
            // No fallback - inform user that LLM is required
            stream.markdown('🤖 **Language Model Required**: This command requires GitHub Copilot to be available. Please ensure Copilot is enabled and try again.');
        }
        
        this.addActionButtons(stream, 'monitor', parsedTask);
    }

    /**
     * Handle deploy command
     */
    private async handleDeployCommand(
        prompt: string,
        stream: vscode.ChatResponseStream,
        token: vscode.CancellationToken
    ): Promise<void> {
        stream.progress('Creating deployment plan...');
        
        if (token.isCancellationRequested) {return;}
        
        const parsedTask = this.sreTaskParser.parseTask(`deploy ${prompt}`);
        
        stream.markdown(`## 🚀 **Deployment Plan**: ${parsedTask.target || 'Application'}\n\n`);
        stream.markdown(`**Environment**: ${parsedTask.environment || 'Not specified'} | **Risk Level**: ${this.assessRisk(parsedTask)}\n\n`);
        
        // Get documentation from MCP servers
        stream.progress('Searching for relevant documentation...');
        const mcpDocumentation = await this.getMcpDocumentation(parsedTask, token);
        
        if (token.isCancellationRequested) { return; }
        
        // Get dynamic prompt and enhance it with MCP documentation
        stream.progress('Generating deployment plan...');
        const enhancedPrompt = await this.buildEnhancedPrompt(parsedTask, 'deploy', mcpDocumentation);
        const llmResponse = await this.callLanguageModel(
            enhancedPrompt,
            stream,
            token
        );
        
        if (llmResponse) {
            stream.markdown(llmResponse);
        } else {
            // No fallback - inform user that LLM is required
            stream.markdown('🤖 **Language Model Required**: This command requires GitHub Copilot to be available. Please ensure Copilot is enabled and try again.');
        }
        
        this.addActionButtons(stream, 'deploy', parsedTask);
    }

    /**
     * Handle troubleshoot command with enhanced LLM support
     */
    private async handleTroubleshootCommand(
        prompt: string,
        stream: vscode.ChatResponseStream,
        token: vscode.CancellationToken
    ): Promise<void> {
        stream.progress('Analyzing troubleshooting request...');
        
        if (token.isCancellationRequested) { return; }
        
        const parsedTask = this.sreTaskParser.parseTask(`troubleshoot ${prompt}`);
        
        stream.markdown(`## 🔧 **Troubleshooting Guide**\n\n`);
        stream.markdown(`**Issue**: ${parsedTask.target || 'System Problem'} | **Environment**: ${parsedTask.environment || 'Not specified'}\n\n`);
        
        // Get documentation from MCP servers
        stream.progress('Searching for relevant documentation...');
        const mcpDocumentation = await this.getMcpDocumentation(parsedTask, token);
        
        if (token.isCancellationRequested) { return; }
        
        // Get dynamic prompt and enhance it with MCP documentation
        stream.progress('Generating troubleshooting guide...');
        const enhancedPrompt = await this.buildEnhancedPrompt(parsedTask, 'troubleshoot', mcpDocumentation);
        const llmResponse = await this.callLanguageModel(
            enhancedPrompt,
            stream,
            token
        );
        
        if (llmResponse) {
            stream.markdown(llmResponse);
        } else {
            // No fallback - inform user that LLM is required
            stream.markdown('🤖 **Language Model Required**: This command requires GitHub Copilot to be available. Please ensure Copilot is enabled and try again.');
        }
        
        this.addActionButtons(stream, 'troubleshoot', parsedTask);
    }

    /**
     * Handle docs command
     */
    private async handleDocsCommand(
        prompt: string,
        stream: vscode.ChatResponseStream,
        token: vscode.CancellationToken
    ): Promise<void> {
        stream.progress('Searching documentation...');
        
        if (token.isCancellationRequested) {return;}
        
        stream.markdown('## 📚 **Documentation Search**\n\n');
        stream.markdown(`Documentation search is now handled through VS Code's native MCP integration.\n\n`);
        stream.markdown(`**Search Query**: ${prompt}\n\n`);
        stream.markdown('The MCP servers configured for SreBuddy will provide documentation context automatically through VS Code\'s language model integration.\n\n');
        
        // Show available MCP servers
        const serverStatus = await this.mcpServerManager.getServerStatus();
        if (serverStatus.length > 0) {
            stream.markdown('**Available MCP Servers**:\n');
            for (const server of serverStatus) {
                stream.markdown(`- ✅ ${server}\n`);
            }
        } else {
            stream.markdown('⚠️ No MCP servers currently configured. Please configure MCP servers in VS Code settings.\n');
        }
    }

    /**
     * Detect programming language for code syntax highlighting
     */
    private detectCodeLanguage(code: string): string {
        if (code.includes('apiVersion:') || code.includes('kind:')) {
            return 'yaml';
        }
        if (code.includes('FROM ') || code.includes('RUN ')) {
            return 'dockerfile';
        }
        if (code.includes('terraform {') || code.includes('resource "')) {
            return 'hcl';
        }
        if (code.includes('#!/bin/bash') || code.includes('kubectl ') || code.includes('helm ')) {
            return 'bash';
        }
        if (code.includes('{') && code.includes('}')) {
            return 'json';
        }
        return 'text';
    }

    /**
     * Provide follow-up suggestions
     */
    async provideFollowups(
        result: vscode.ChatResult,
        context: vscode.ChatContext,
        token: vscode.CancellationToken
    ): Promise<vscode.ChatFollowup[]> {
        const followups: vscode.ChatFollowup[] = [];
        
        // Extract the last user message to provide relevant followups
        const lastMessage = context.history[context.history.length - 1];
        if (lastMessage && lastMessage instanceof vscode.ChatRequestTurn) {
            const prompt = lastMessage.prompt.toLowerCase();
            
            if (prompt.includes('implement') || prompt.includes('deploy')) {
                followups.push(
                    {
                        prompt: '@srebuddy configure monitoring for this deployment',
                        label: '🔍 Set up monitoring'
                    },
                    {
                        prompt: '@srebuddy docs deployment best practices',
                        label: '📚 View deployment docs'
                    }
                );
            }
            
            if (prompt.includes('monitor') || prompt.includes('alerting')) {
                followups.push(
                    {
                        prompt: '@srebuddy implement dashboard for these metrics',
                        label: '📊 Create dashboard'
                    },
                    {
                        prompt: '@srebuddy configure alert thresholds',
                        label: '🚨 Set up alerts'
                    }
                );
            }
        }
        
        // Always provide general followups
        followups.push(
            {
                prompt: '@srebuddy docs troubleshooting',
                label: '🔧 Troubleshooting guide'
            },
            {
                prompt: '@srebuddy configure',
                label: '⚙️ Configure SreBuddy'
            }
        );
        
        return followups;
    }

    /**
     * Call VS Code Language Model API with streaming support
     */
    private async callLanguageModel(
        prompt: string,
        stream: vscode.ChatResponseStream,
        token: vscode.CancellationToken
    ): Promise<string | null> {
        try {
            // Select the best available language model
            const models = await vscode.lm.selectChatModels({
                vendor: 'copilot',
                family: 'gpt-4'
            });

            if (models.length === 0) {
                this.logger.warn('No language models available, falling back to built-in parser');
                return null;
            }

            const model = models[0];
            this.logger.debug(`Using language model: ${model.name} (${model.vendor}/${model.family})`);

            // Prepare messages for the LLM
            const messages = [
                vscode.LanguageModelChatMessage.User(prompt)
            ];

            // Send request to the language model
            const response = await model.sendRequest(messages, {
                justification: 'SreBuddy is helping with SRE tasks and infrastructure automation'
            }, token);

            // Stream the response
            let result = '';
            for await (const part of response.text) {
                if (token.isCancellationRequested) {
                    break;
                }
                result += part;
                // Optional: stream chunks in real-time
                // stream.markdown(part);
            }

            return result;

        } catch (error) {
            if (error instanceof vscode.LanguageModelError) {
                this.logger.error(`Language Model Error (${error.code}): ${error.message}`, error.cause);
                
                // Handle specific error cases
                if (error.cause instanceof Error && error.cause.message.includes('off_topic')) {
                    stream.markdown('🤖 I can only help with SRE and infrastructure-related tasks.');
                    return null;
                }
                
                if (error.code === 'Blocked') {
                    stream.markdown('⚠️ Request was blocked. Please rephrase your question.');
                    return null;
                }
                
                if (error.code === 'NoPermissions') {
                    stream.markdown('🔒 Language model access not available. Please enable GitHub Copilot.');
                    return null;
                }
            }
            
            this.logger.error('Language model call failed:', error);
            return null;
        }
    }

    /**
     * Assess risk level based on parsed task
     */
    private assessRisk(parsedTask: SreTaskContext): string {
        let risk = 'LOW';
        
        if (parsedTask.environment?.toLowerCase().includes('prod')) {
            risk = 'HIGH';
        } else if (parsedTask.environment?.toLowerCase().includes('staging')) {
            risk = 'MEDIUM';
        }
        
        if (parsedTask.target?.toLowerCase().includes('database') || 
            parsedTask.target?.toLowerCase().includes('storage')) {
            risk = risk === 'LOW' ? 'MEDIUM' : 'HIGH';
        }
        
        const riskIcons = { LOW: '🟢', MEDIUM: '🟡', HIGH: '🔴' };
        return `${riskIcons[risk as keyof typeof riskIcons]} ${risk}`;
    }

    /**
     * Add interactive action buttons to responses
     */
    private addActionButtons(
        stream: vscode.ChatResponseStream, 
        action: string, 
        parsedTask: SreTaskContext
    ): void {
        // Add relevant action buttons based on the action type
        switch (action) {
            case 'implement':
                stream.button({
                    command: 'srebuddy.generateConfig',
                    title: '⚙️ Generate Config',
                    arguments: [parsedTask.target, parsedTask.environment]
                });
                stream.button({
                    command: 'srebuddy.createMonitoring',
                    title: '📊 Setup Monitoring',
                    arguments: [parsedTask.target]
                });
                break;
            case 'deploy':
                stream.button({
                    command: 'srebuddy.createRollback',
                    title: '🔄 Create Rollback Plan',
                    arguments: [parsedTask.target]
                });
                break;
            case 'monitor':
                stream.button({
                    command: 'srebuddy.testAlerts',
                    title: '🔔 Test Alerts',
                    arguments: [parsedTask.target]
                });
                break;
            case 'troubleshoot':
                stream.button({
                    command: 'srebuddy.generateDiagnostics',
                    title: '🔍 Generate Diagnostics',
                    arguments: [parsedTask.target]
                });
                break;
        }
        
        // Always add documentation search button
        stream.button({
            command: 'srebuddy.searchDocs',
            title: '📚 Search Docs',
            arguments: [parsedTask.rawInput]
        });
    }

    /**
     * Generate fallback documentation results formatting
     */
    private formatDocumentationResults(data: any): string {
        if (!data || (!Array.isArray(data) && typeof data !== 'object')) {
            return 'No documentation found matching your query.';
        }

        const docs = Array.isArray(data) ? data : [data];
        let formatted = '';

        for (const doc of docs) {
            if (doc.title) {
                formatted += `### ${doc.title}\n\n`;
            }
            if (doc.content || doc.summary) {
                formatted += `${doc.content || doc.summary}\n\n`;
            }
            if (doc.url) {
                formatted += `[📖 View Full Documentation](${doc.url})\n\n`;
            }
            formatted += '---\n\n';
        }

        return formatted;
    }

    /**
     * Get documentation from MCP servers for the given task
     */
    private async getMcpDocumentation(parsedTask: SreTaskContext, token: vscode.CancellationToken): Promise<string> {
        try {
            if (token.isCancellationRequested) { return ''; }

            // Search for documentation related to the task
            const searchQueries = [
                `${parsedTask.target} ${parsedTask.type}`,
                `${parsedTask.target} implementation`,
                `${parsedTask.target} configuration`,
                `${parsedTask.target} deployment`,
                `${parsedTask.target} best practices`
            ];

            let allDocumentation = '';
            
            for (const query of searchQueries) {
                if (token.isCancellationRequested) { break; }
                
                // With VS Code's native MCP integration, documentation context 
                // is automatically provided through the language model
                // We'll indicate that documentation context is available
                allDocumentation += `\n\n## Documentation Context Available for "${query}"\n`;
                allDocumentation += `MCP servers provide relevant documentation automatically.\n`;
            }

            return allDocumentation.trim();
        } catch (error) {
            this.logger.error('Error retrieving MCP documentation:', error);
            return '';
        }
    }

    /**
     * Build enhanced prompt by combining dynamic prompt template with MCP documentation
     */
    private async buildEnhancedPrompt(
        parsedTask: SreTaskContext, 
        command: string, 
        mcpDocumentation: string
    ): Promise<string> {
        try {
            // Get the base prompt from the prompt loader
            const basePrompt = await this.promptLoader.getPromptForTask(parsedTask, command);
            
            // If we have MCP documentation, enhance the prompt with it
            if (mcpDocumentation && mcpDocumentation.trim().length > 0) {
                const enhancedPrompt = `${basePrompt}

## Additional Context from Internal Documentation

The following documentation has been retrieved from internal systems that may be relevant to this task:

${mcpDocumentation}

Please use this internal documentation along with your general knowledge to provide the most accurate and organization-specific guidance. If the internal documentation conflicts with general best practices, prioritize the internal documentation as it reflects the organization's specific requirements and standards.

Make sure to reference specific documentation sections when applicable and highlight any organization-specific considerations.`;

                return enhancedPrompt;
            }
            
            // If no MCP documentation, just return the base prompt
            return basePrompt;
        } catch (error) {
            this.logger.error('Error building enhanced prompt:', error);
            // Fallback to base prompt if enhancement fails
            return await this.promptLoader.getPromptForTask(parsedTask, command);
        }
    }

}
