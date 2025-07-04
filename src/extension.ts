import * as vscode from 'vscode';
import * as path from 'path';
import { SreBuddyChatParticipant } from './chatParticipant';
import { SreBuddyAgentHandler } from './agentHandler';
import { McpServerManager } from './mcpServerManager';
import { SreTaskParser } from './sreTaskParser';
import { Logger } from './logger';

let mcpServerManager: McpServerManager | undefined;

/**
 * This method is called when the extension is activated
 * The extension is activated when a chat participant is registered or on startup
 */
export function activate(context: vscode.ExtensionContext) {
    const logger = new Logger();
    logger.info('SreBuddy extension is being activated...');

    try {
        // Initialize MCP Server Manager
        mcpServerManager = new McpServerManager(logger);
        
        // Initialize SRE Task Parser
        const sreTaskParser = new SreTaskParser(logger);
        
        // Create and register the chat participant (Chat Mode)
        const chatParticipant = new SreBuddyChatParticipant(
            mcpServerManager,
            sreTaskParser,
            logger,
            context
        );
        
        // Register the chat participant
        const participant = vscode.chat.createChatParticipant('srebuddy', chatParticipant.handleRequest.bind(chatParticipant));
        participant.iconPath = new vscode.ThemeIcon('server-process');
        participant.followupProvider = {
            provideFollowups: chatParticipant.provideFollowups.bind(chatParticipant)
        };
        
        // Create Agent Handler (Agent Mode)
        const agentHandler = new SreBuddyAgentHandler(
            mcpServerManager,
            sreTaskParser,
            logger
        );
        
        // Register Agent Mode commands
        const commands = [
            vscode.commands.registerCommand('srebuddy.configure', () => {
                chatParticipant.showConfigurationUI();
            }),
            vscode.commands.registerCommand('srebuddy.implementTask', () => {
                agentHandler.handleImplementTask();
            }),
            vscode.commands.registerCommand('srebuddy.generateConfig', () => {
                agentHandler.handleGenerateConfig();
            }),
            vscode.commands.registerCommand('srebuddy.deploymentPlan', () => {
                agentHandler.handleDeploymentPlan();
            }),
            vscode.commands.registerCommand('srebuddy.troubleshoot', () => {
                agentHandler.handleTroubleshooting();
            }),
            vscode.commands.registerCommand('srebuddy.monitoring', () => {
                agentHandler.handleMonitoring();
            }),
            vscode.commands.registerCommand('srebuddy.setupTemplates', () => {
                setupWorkspace(context, logger);
            })
        ];
        
        // Add to subscriptions for cleanup
        context.subscriptions.push(
            participant,
            ...commands
        );
        
        logger.info('SreBuddy extension activated successfully in both Chat and Agent modes!');
        
        // Show welcome message only on first activation
        const hasShownWelcome = context.globalState.get('srebuddy.hasShownWelcome', false);
        if (!hasShownWelcome) {
            vscode.window.showInformationMessage(
                'SreBuddy is ready! Use @srebuddy in Chat or "SreBuddy" commands in Command Palette.',
                'Open Chat',
                'View Commands',
                'Don\'t Show Again'
            ).then(selection => {
                if (selection === 'Open Chat') {
                    vscode.commands.executeCommand('workbench.panel.chat.view.copilot.focus');
                } else if (selection === 'View Commands') {
                    vscode.commands.executeCommand('workbench.action.showCommands').then(() => {
                        vscode.commands.executeCommand('workbench.action.quickOpen', '>SreBuddy');
                    });
                } else if (selection === 'Don\'t Show Again') {
                    context.globalState.update('srebuddy.hasShownWelcome', true);
                }
            });
        }
        
        // Set up workspace with SreBuddy template files
        setupWorkspace(context, logger);
        
    } catch (error) {
        logger.error('Failed to activate SreBuddy extension:', error);
        vscode.window.showErrorMessage(`Failed to activate SreBuddy: ${error}`);
    }
}

/**
 * This method is called when the extension is deactivated
 */
export function deactivate() {
    // Cleanup MCP servers
    if (mcpServerManager) {
        mcpServerManager.cleanup();
    }
    // Other cleanup will be handled by VS Code disposing of subscriptions
}

/**
 * Set up workspace with SreBuddy configuration files
 */
async function setupWorkspace(context: vscode.ExtensionContext, logger: Logger): Promise<void> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        logger.debug('No workspace folders found, skipping template setup');
        return;
    }

    for (const workspaceFolder of workspaceFolders) {
        await setupWorkspaceFolder(workspaceFolder, context, logger);
    }
}

/**
 * Set up individual workspace folder with templates
 */
async function setupWorkspaceFolder(
    workspaceFolder: vscode.WorkspaceFolder, 
    context: vscode.ExtensionContext, 
    logger: Logger
): Promise<void> {
    try {
        const workspacePath = workspaceFolder.uri.fsPath;
        const githubDir = path.join(workspacePath, '.github');
        const targetFile = path.join(githubDir, 'copilot-instructions.md');
        
        // Check if the file already exists
        try {
            await vscode.workspace.fs.stat(vscode.Uri.file(targetFile));
            logger.debug(`SreBuddy prompt templates already exist in ${workspaceFolder.name}`);
            return; // File exists, don't overwrite
        } catch {
            // File doesn't exist, continue with setup
        }

        // Get the source template from the extension
        const sourceFile = path.join(context.extensionPath, '.github', 'copilot-instructions.md');
        
        try {
            // Read the template file from extension
            const templateContent = await vscode.workspace.fs.readFile(vscode.Uri.file(sourceFile));
            
            // Ensure .github directory exists
            await vscode.workspace.fs.createDirectory(vscode.Uri.file(githubDir));
            
            // Write the template to workspace
            await vscode.workspace.fs.writeFile(vscode.Uri.file(targetFile), templateContent);
            
            logger.info(`Created SreBuddy prompt templates in ${workspaceFolder.name}/.github/copilot-instructions.md`);
            
            // Show user notification
            const action = await vscode.window.showInformationMessage(
                `SreBuddy: Created prompt templates in ${workspaceFolder.name}/.github/copilot-instructions.md`,
                'Open File',
                'Learn More'
            );
            
            if (action === 'Open File') {
                const doc = await vscode.workspace.openTextDocument(targetFile);
                await vscode.window.showTextDocument(doc);
            } else if (action === 'Learn More') {
                vscode.env.openExternal(vscode.Uri.parse('https://github.com/srebuddy/vscode-extension#prompt-templates'));
            }
            
        } catch (error) {
            logger.error(`Failed to copy template to ${workspaceFolder.name}:`, error);
        }
        
    } catch (error) {
        logger.error(`Error setting up workspace ${workspaceFolder.name}:`, error);
    }
}
