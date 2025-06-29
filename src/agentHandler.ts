import * as vscode from 'vscode';
import { McpServerManager, DocumentationSearch } from './mcpServerManager';
import { SreTaskParser, SreImplementationPlan } from './sreTaskParser';
import { Logger } from './logger';

/**
 * SreBuddy Agent Handler for Command Palette interactions
 * Provides guided UI for SRE task execution outside of chat mode
 */
export class SreBuddyAgentHandler {
    constructor(
        private mcpServerManager: McpServerManager,
        private sreTaskParser: SreTaskParser,
        private logger: Logger
    ) {}

    /**
     * Handle implement task command
     */
    async handleImplementTask(): Promise<void> {
        const input = await vscode.window.showInputBox({
            prompt: 'Describe the SRE task to implement',
            placeHolder: 'e.g., implement dynatrace agent, configure prometheus monitoring',
            validateInput: (value) => {
                if (!value || value.trim().length === 0) {
                    return 'Please enter a task description';
                }
                return undefined;
            }
        });

        if (!input) {
            return;
        }

        await this.executeTask(input, 'implement');
    }

    /**
     * Handle generate configuration command
     */
    async handleGenerateConfig(): Promise<void> {
        const tool = await vscode.window.showQuickPick([
            'Kubernetes',
            'Docker',
            'Terraform',
            'Ansible',
            'Prometheus',
            'Grafana',
            'Dynatrace',
            'Nginx',
            'Redis',
            'Elasticsearch',
            'Other'
        ], {
            placeHolder: 'Select the tool to configure'
        });

        if (!tool) {
            return;
        }

        const environment = await vscode.window.showQuickPick([
            'Development',
            'Staging',
            'Production',
            'Testing'
        ], {
            placeHolder: 'Select target environment'
        });

        if (!environment) {
            return;
        }

        const taskDescription = `configure ${tool.toLowerCase()} for ${environment.toLowerCase()}`;
        await this.executeTask(taskDescription, 'configure');
    }

    /**
     * Handle deployment plan command
     */
    async handleDeploymentPlan(): Promise<void> {
        const service = await vscode.window.showInputBox({
            prompt: 'Enter service or application name',
            placeHolder: 'e.g., user-service, payment-api, web-application'
        });

        if (!service) {
            return;
        }

        const environment = await vscode.window.showQuickPick([
            'Development',
            'Staging',
            'Production'
        ], {
            placeHolder: 'Select deployment environment'
        });

        if (!environment) {
            return;
        }

        const platform = await vscode.window.showQuickPick([
            'Kubernetes',
            'Docker',
            'AWS',
            'Azure',
            'GCP',
            'Bare Metal'
        ], {
            placeHolder: 'Select deployment platform'
        });

        if (!platform) {
            return;
        }

        const taskDescription = `deploy ${service} to ${environment.toLowerCase()} using ${platform.toLowerCase()}`;
        await this.executeTask(taskDescription, 'deploy');
    }

    /**
     * Handle troubleshooting guide command
     */
    async handleTroubleshooting(): Promise<void> {
        const issueType = await vscode.window.showQuickPick([
            'High CPU Usage',
            'Memory Issues',
            'Network Problems',
            'Service Unavailable',
            'Database Issues',
            'Authentication Failures',
            'Performance Issues',
            'Other'
        ], {
            placeHolder: 'Select the type of issue'
        });

        if (!issueType) {
            return;
        }

        let issue = issueType.toLowerCase();
        
        if (issueType === 'Other') {
            const customIssue = await vscode.window.showInputBox({
                prompt: 'Describe the specific issue',
                placeHolder: 'e.g., application crashes on startup, API timeouts'
            });
            
            if (!customIssue) {
                return;
            }
            
            issue = customIssue;
        }

        const taskDescription = `troubleshoot ${issue}`;
        await this.executeTask(taskDescription, 'troubleshoot');
    }

    /**
     * Handle monitoring setup command
     */
    async handleMonitoring(): Promise<void> {
        const service = await vscode.window.showInputBox({
            prompt: 'Enter service or component to monitor',
            placeHolder: 'e.g., web-server, database, api-gateway, microservice'
        });

        if (!service) {
            return;
        }

        const monitoringType = await vscode.window.showQuickPick([
            'Application Performance Monitoring',
            'Infrastructure Metrics',
            'Log Aggregation',
            'Alerting Rules',
            'Health Checks',
            'Custom Metrics',
            'Dashboard Creation'
        ], {
            placeHolder: 'Select monitoring type'
        });

        if (!monitoringType) {
            return;
        }

        const monitoringTool = await vscode.window.showQuickPick([
            'Prometheus + Grafana',
            'Dynatrace',
            'Datadog',
            'New Relic',
            'ELK Stack',
            'Other'
        ], {
            placeHolder: 'Select monitoring tool'
        });

        if (!monitoringTool) {
            return;
        }

        const taskDescription = `monitor ${service} with ${monitoringType.toLowerCase()} using ${monitoringTool.toLowerCase()}`;
        await this.executeTask(taskDescription, 'monitor');
    }

    /**
     * Execute SRE task and display results
     */
    private async executeTask(taskDescription: string, taskType: string): Promise<void> {
        try {
            // Show progress
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `SreBuddy: Processing ${taskType} task...`,
                cancellable: true
            }, async (progress, token) => {
                if (token.isCancellationRequested) {
                    return;
                }

                progress.report({ increment: 20, message: 'Parsing task...' });
                
                // Parse the task
                const parsedTask = this.sreTaskParser.parseTask(taskDescription);
                this.logger.info(`Parsed task: ${JSON.stringify(parsedTask)}`);
                
                if (token.isCancellationRequested) {
                    return;
                }

                progress.report({ increment: 40, message: 'Generating implementation plan...' });
                
                // Generate implementation plan
                const plan = this.sreTaskParser.generateImplementationPlan(parsedTask);
                
                if (token.isCancellationRequested) {
                    return;
                }

                progress.report({ increment: 60, message: 'Retrieving documentation...' });
                
                // Try to get additional context from MCP servers
                let additionalContext = '';
                try {
                    const searchResult = await this.mcpServerManager.searchDocumentation({
                        query: `${parsedTask.target} ${parsedTask.type} ${parsedTask.environment || ''}`,
                        maxResults: 3
                    });
                    
                    if (searchResult.success && searchResult.data) {
                        additionalContext = this.formatDocumentationResults(searchResult.data);
                    }
                } catch (error) {
                    this.logger.warn('Could not retrieve additional documentation:', error);
                }

                if (token.isCancellationRequested) {
                    return;
                }
                
                progress.report({ increment: 80, message: 'Formatting results...' });
                
                // Create and show results
                await this.showResults(plan, additionalContext, parsedTask);
                
                progress.report({ increment: 100, message: 'Complete!' });
            });
            
        } catch (error) {
            this.logger.error(`Failed to execute ${taskType} task:`, error);
            vscode.window.showErrorMessage(`Failed to execute task: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Format documentation results
     */
    private formatDocumentationResults(data: any): string {
        if (!data || (!Array.isArray(data) && typeof data !== 'object')) {
            return '';
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
                formatted += `[View Documentation](${doc.url})\n\n`;
            }
        }

        return formatted;
    }

    /**
     * Show results in a new document
     */
    private async showResults(plan: SreImplementationPlan, additionalContext: string, parsedTask: any): Promise<void> {
        const content = this.formatResults(plan, additionalContext, parsedTask);
        
        const doc = await vscode.workspace.openTextDocument({
            content: content,
            language: 'markdown'
        });
        
        await vscode.window.showTextDocument(doc, {
            preview: false,
            viewColumn: vscode.ViewColumn.Beside
        });

        // Show success message
        vscode.window.showInformationMessage(
            'SreBuddy task completed! Results opened in new document.',
            'Copy to Clipboard',
            'Save to File'
        ).then(selection => {
            if (selection === 'Copy to Clipboard') {
                vscode.env.clipboard.writeText(content);
                vscode.window.showInformationMessage('Results copied to clipboard!');
            } else if (selection === 'Save to File') {
                vscode.window.showSaveDialog({
                    defaultUri: vscode.Uri.file(`srebuddy-${parsedTask.type}-${Date.now()}.md`),
                    filters: {
                        'Markdown': ['md'],
                        'Text': ['txt'],
                        'All Files': ['*']
                    }
                }).then(uri => {
                    if (uri) {
                        vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf8'));
                        vscode.window.showInformationMessage(`Results saved to ${uri.fsPath}`);
                    }
                });
            }
        });
    }

    /**
     * Format results for display
     */
    private formatResults(plan: SreImplementationPlan, additionalContext: string, parsedTask: any): string {
        const timestamp = new Date().toISOString();
        const riskIcon = plan.riskLevel === 'high' ? '🔴' : plan.riskLevel === 'medium' ? '🟡' : '🟢';
        
        let content = `# SreBuddy Task Results

**Generated:** ${timestamp}
**Task Type:** ${parsedTask.type}
**Target:** ${parsedTask.target}
**Environment:** ${parsedTask.environment || 'Not specified'}
**Risk Level:** ${riskIcon} ${plan.riskLevel.toUpperCase()}
**Estimated Time:** ⏱️ ${plan.estimatedTime}

---

## 🎯 Task Summary

${plan.taskSummary}

---

## ✅ Prerequisites

`;

        for (const prereq of plan.prerequisites) {
            content += `- ${prereq}\n`;
        }

        content += `\n---\n\n## 📋 Implementation Steps\n\n`;

        for (const step of plan.steps) {
            content += `### Step ${step.step}: ${step.title}\n\n`;
            content += `${step.description}\n\n`;
            
            if (step.codeExample) {
                const language = this.detectCodeLanguage(step.codeExample);
                content += `\`\`\`${language}\n${step.codeExample}\n\`\`\`\n\n`;
            }
            
            if (step.validationSteps && step.validationSteps.length > 0) {
                content += `**Validation Steps:**\n`;
                for (const validation of step.validationSteps) {
                    content += `- ${validation}\n`;
                }
                content += '\n';
            }

            if (step.documentation && step.documentation.length > 0) {
                content += `**Documentation References:**\n`;
                for (const doc of step.documentation) {
                    content += `- ${doc}\n`;
                }
                content += '\n';
            }
        }

        if (additionalContext) {
            content += `---\n\n## 📖 Additional Documentation\n\n${additionalContext}`;
        }

        content += `---\n\n## 🔄 Rollback Plan\n\n`;
        for (let i = 0; i < plan.rollbackSteps.length; i++) {
            content += `${i + 1}. ${plan.rollbackSteps[i]}\n`;
        }

        content += `\n---\n\n## 💡 Next Steps

1. Review the implementation plan above carefully
2. Validate all prerequisites and dependencies
3. Test the implementation in a non-production environment first
4. Execute step-by-step with proper monitoring and logging
5. Document any changes, issues, or deviations encountered
6. Validate the implementation meets all requirements

## 🆘 Support

For additional assistance:
- Use \`@srebuddy\` in GitHub Copilot Chat for interactive help
- Access Command Palette: "SreBuddy" commands for guided tasks
- Search internal documentation via configured MCP servers
- Reference the validation steps provided above

---
*Generated by SreBuddy - AI-Powered SRE Assistant*
*Version: 0.0.1*
`;

        return content;
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
        if (code.includes('{') && code.includes('}') && (code.includes('"') || code.includes(':'))) {
            return 'json';
        }
        return 'text';
    }
}
