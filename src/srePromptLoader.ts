import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from './logger';
import { SreTaskContext } from './sreTaskParser';

/**
 * Interface for prompt templates in copilot-instructions.md
 */
interface PromptTemplate {
    command: string;
    examples: string[];
    prompt: string;
    tags: string[];
}

/**
 * Dynamic prompt loader that reads from copilot-instructions.md
 * and matches user requests to appropriate prompt templates
 */
export class SrePromptLoader {
    private templates: PromptTemplate[] = [];
    private fallbackPrompts: Map<string, string> = new Map();
    private logger: Logger;
    private instructionsPath: string;

    constructor(logger: Logger, extensionContext?: vscode.ExtensionContext) {
        this.logger = logger;
        
        // Try to find prompt templates file in the workspace
        if (extensionContext) {
            // Use the main copilot-instructions.md file for prompts
            this.instructionsPath = path.join(extensionContext.extensionPath, '.github', 'copilot-instructions.md');
        } else {
            // Fallback to workspace root
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (workspaceFolders && workspaceFolders.length > 0) {
                this.instructionsPath = path.join(workspaceFolders[0].uri.fsPath, '.github', 'copilot-instructions.md');
            } else {
                this.instructionsPath = '';
            }
        }

        this.initializeFallbackPrompts();
        this.loadPromptTemplates();
    }

    /**
     * Get the best matching prompt for a given task context
     */
    async getPromptForTask(taskContext: SreTaskContext, command: string): Promise<string> {
        try {
            // Reload templates to get latest updates
            await this.loadPromptTemplates();

            // Find the best matching template
            const template = this.findBestMatchingTemplate(taskContext, command);
            
            if (template) {
                this.logger.debug(`Using template for command: ${command}, matched example: ${template.examples[0]}`);
                return this.buildPromptFromTemplate(template, taskContext);
            }

            // Fallback to hardcoded prompts
            const fallbackPrompt = this.fallbackPrompts.get(command);
            if (fallbackPrompt) {
                this.logger.debug(`Using fallback prompt for command: ${command}`);
                return this.buildPromptFromFallback(fallbackPrompt, taskContext);
            }

            // Ultimate fallback - generic SRE prompt
            this.logger.warn(`No specific prompt found for command: ${command}, using generic prompt`);
            return this.buildGenericPrompt(taskContext, command);

        } catch (error) {
            this.logger.error('Error getting prompt for task:', error);
            return this.buildGenericPrompt(taskContext, command);
        }
    }

    /**
     * Load prompt templates from copilot-instructions.md
     */
    private async loadPromptTemplates(): Promise<void> {
        if (!this.instructionsPath || !fs.existsSync(this.instructionsPath)) {
            this.logger.warn('Prompt templates file not found. Create .github/copilot-instructions.md for custom prompts. Using fallback prompts.');
            return;
        }

        try {
            const content = fs.readFileSync(this.instructionsPath, 'utf8');
            this.templates = this.parsePromptTemplates(content);
            this.logger.info(`Loaded ${this.templates.length} prompt templates from ${path.basename(this.instructionsPath)}`);
        } catch (error) {
            this.logger.error('Error loading prompt templates:', error);
        }
    }

    /**
     * Parse prompt templates from markdown content
     */
    private parsePromptTemplates(content: string): PromptTemplate[] {
        const templates: PromptTemplate[] = [];
        const sections = content.split(/^## /m).filter(section => section.trim());

        for (const section of sections) {
            const template = this.parseTemplateSection(section);
            if (template) {
                templates.push(template);
            }
        }

        return templates;
    }

    /**
     * Parse a single template section
     */
    private parseTemplateSection(section: string): PromptTemplate | null {
        const lines = section.split('\n');
        const header = lines[0].trim();

        // Look for command-specific sections
        const commandMatch = header.match(/SRE (\\w+) Prompts?|Prompt Templates? for (\\w+)|LLM (\\w+) Instructions?/i);
        if (!commandMatch) {
            return null;
        }

        const command = (commandMatch[1] || commandMatch[2] || commandMatch[3]).toLowerCase();
        const examples: string[] = [];
        const tags: string[] = [];
        let prompt = '';
        let currentSection = '';

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();

            if (line.startsWith('### Examples') || line.startsWith('**Examples')) {
                currentSection = 'examples';
                continue;
            }

            if (line.startsWith('### Prompt') || line.startsWith('**Prompt')) {
                currentSection = 'prompt';
                continue;
            }

            if (line.startsWith('### Tags') || line.startsWith('**Tags')) {
                currentSection = 'tags';
                continue;
            }

            if (currentSection === 'examples' && line.startsWith('-')) {
                examples.push(line.substring(1).trim());
            }

            if (currentSection === 'prompt' && line) {
                prompt += line + '\\n';
            }

            if (currentSection === 'tags' && line.startsWith('-')) {
                tags.push(line.substring(1).trim());
            }
        }

        if (examples.length > 0 && prompt) {
            return { command, examples, prompt: prompt.trim(), tags };
        }

        return null;
    }

    /**
     * Find the best matching template for a task
     */
    private findBestMatchingTemplate(taskContext: SreTaskContext, command: string): PromptTemplate | null {
        const commandTemplates = this.templates.filter(t => t.command === command);
        
        if (commandTemplates.length === 0) {
            return null;
        }

        // Calculate similarity scores for each template
        let bestTemplate: PromptTemplate | null = null;
        let bestScore = 0;

        for (const template of commandTemplates) {
            const score = this.calculateSimilarityScore(taskContext, template);
            if (score > bestScore) {
                bestScore = score;
                bestTemplate = template;
            }
        }

        // Only return template if similarity is above threshold
        return bestScore > 0.3 ? bestTemplate : null;
    }

    /**
     * Calculate similarity score between task context and template
     */
    private calculateSimilarityScore(taskContext: SreTaskContext, template: PromptTemplate): number {
        const taskText = `${taskContext.rawInput} ${taskContext.target}`.toLowerCase();
        let totalScore = 0;
        let matchCount = 0;

        // Check similarity with examples
        for (const example of template.examples) {
            const exampleWords = example.toLowerCase().split(/\\s+/);
            const taskWords = taskText.split(/\\s+/);
            
            let matchingWords = 0;
            for (const word of exampleWords) {
                if (taskWords.some(tw => tw.includes(word) || word.includes(tw))) {
                    matchingWords++;
                }
            }
            
            const exampleScore = matchingWords / Math.max(exampleWords.length, taskWords.length);
            totalScore += exampleScore;
            matchCount++;
        }

        // Check similarity with tags
        for (const tag of template.tags) {
            if (taskText.includes(tag.toLowerCase())) {
                totalScore += 0.5; // Bonus for tag match
            }
        }

        return matchCount > 0 ? totalScore / matchCount : 0;
    }

    /**
     * Build prompt from template
     */
    private buildPromptFromTemplate(template: PromptTemplate, taskContext: SreTaskContext): string {
        let prompt = template.prompt;

        // Replace placeholders with actual values
        prompt = prompt.replace(/\\{target\\}/g, taskContext.target || 'infrastructure component');
        prompt = prompt.replace(/\\{environment\\}/g, taskContext.environment || 'unspecified');
        prompt = prompt.replace(/\\{rawInput\\}/g, taskContext.rawInput);
        prompt = prompt.replace(/\\{type\\}/g, taskContext.type.toString());

        // Add dynamic context if parameters exist
        if (taskContext.parameters.size > 0) {
            let contextStr = '\\nAdditional Context:\\n';
            taskContext.parameters.forEach((value, key) => {
                contextStr += `- ${key}: ${value}\\n`;
            });
            prompt += contextStr;
        }

        return prompt;
    }

    /**
     * Build prompt from fallback template
     */
    private buildPromptFromFallback(fallbackPrompt: string, taskContext: SreTaskContext): string {
        return fallbackPrompt
            .replace('{target}', taskContext.target || 'infrastructure component')
            .replace('{environment}', taskContext.environment || 'unspecified')
            .replace('{rawInput}', taskContext.rawInput);
    }

    /**
     * Build generic prompt when no specific template is found
     */
    private buildGenericPrompt(taskContext: SreTaskContext, command: string): string {
        return `You are SreBuddy, an expert Site Reliability Engineer assistant.

Task: ${command} ${taskContext.target || 'infrastructure component'}
Environment: ${taskContext.environment || 'unspecified'}
Context: ${taskContext.rawInput}

Please provide comprehensive SRE guidance that includes:
1. **Step-by-step instructions** with clear actions
2. **Best practices** for production environments
3. **Code examples** with proper syntax highlighting
4. **Validation steps** to ensure success
5. **Rollback procedures** for safety
6. **Monitoring considerations** for observability

Focus on practical, battle-tested solutions that follow SRE principles.`;
    }

    /**
     * Initialize fallback prompts for when copilot-instructions.md is not available
     */
    private initializeFallbackPrompts(): void {
        this.fallbackPrompts.set('implement', `You are SreBuddy, an expert Site Reliability Engineer assistant. 

Task: Implement {target}
Environment: {environment}
Context: {rawInput}

Provide a comprehensive implementation guide with:
1. **Prerequisites** - All requirements and dependencies
2. **Step-by-step Implementation** - Detailed instructions
3. **Configuration Examples** - Complete configs with syntax highlighting
4. **Validation Steps** - How to verify success
5. **Monitoring Setup** - Basic observability
6. **Rollback Plan** - Safe reversion procedures
7. **Security Considerations** - Best practices
8. **Troubleshooting** - Common issues and solutions

Format with clear markdown, realistic estimates, and production-ready examples.`);

        this.fallbackPrompts.set('deploy', `You are SreBuddy, an expert Site Reliability Engineer assistant specializing in deployments.

Task: Deploy {target}
Environment: {environment}
Context: {rawInput}

Create a production-ready deployment plan with:
1. **Deployment Strategy** - Blue/green, rolling, canary
2. **Pre-deployment Checklist** - Required verifications
3. **Infrastructure Requirements** - Resources and networking
4. **Deployment Scripts** - Complete automation
5. **Health Checks** - Readiness and liveness probes
6. **Monitoring & Observability** - Metrics and alerting
7. **Rollback Procedures** - Automated recovery
8. **Post-deployment Validation** - Testing steps

Include Kubernetes, CI/CD, and IaC examples where applicable.`);

        this.fallbackPrompts.set('monitor', `You are SreBuddy, an expert Site Reliability Engineer assistant specializing in monitoring.

Task: Set up monitoring for {target}
Context: {rawInput}

Create a comprehensive monitoring strategy with:
1. **Monitoring Architecture** - Components and data flow
2. **Key Metrics** - SLIs to track
3. **Alerting Rules** - SLOs and notification strategy
4. **Dashboards** - Visual monitoring layouts
5. **Log Aggregation** - Centralized logging
6. **Configuration Files** - Complete monitoring configs
7. **Integration Setup** - Connecting to existing systems
8. **Maintenance** - Regular tasks and updates

Include Prometheus, Grafana, and AlertManager configurations.`);

        this.fallbackPrompts.set('configure', `You are SreBuddy, an expert Site Reliability Engineer assistant specializing in configuration management.

Task: Configure {target}
Environment: {environment}
Context: {rawInput}

Generate production-ready configuration with:
1. **Base Configuration** - Core settings
2. **Environment-Specific Settings** - Dev/staging/prod variations
3. **Security Configuration** - Authentication and encryption
4. **Performance Tuning** - Optimization settings
5. **Integration Points** - Service connections
6. **Backup & Recovery** - Data protection
7. **Monitoring Integration** - Health checks
8. **Deployment Instructions** - Application steps

Provide complete configs with comments and validation commands.`);

        this.fallbackPrompts.set('troubleshoot', `You are SreBuddy, an expert Site Reliability Engineer assistant specializing in incident response.

Issue: {rawInput}

Provide a structured troubleshooting guide with:
1. **Initial Assessment** - Quick triage steps
2. **Data Collection** - Logs, metrics, and diagnostics
3. **Root Cause Analysis** - Investigation approach
4. **Common Causes** - Most likely issues
5. **Resolution Steps** - Fix procedures
6. **Verification** - Confirming resolution
7. **Prevention** - Avoiding recurrence
8. **Escalation** - When and how to escalate

Include specific commands, log patterns, and runbook references.`);
    }

    /**
     * Reload prompt templates (useful for development/testing)
     */
    async reloadTemplates(): Promise<void> {
        await this.loadPromptTemplates();
    }

    /**
     * Get available templates for debugging
     */
    getAvailableTemplates(): PromptTemplate[] {
        return [...this.templates];
    }
}
