import { Logger } from './logger';

/**
 * Supported SRE task types
 */
export enum SreTaskType {
    IMPLEMENT = 'implement',
    CONFIGURE = 'configure',
    MONITOR = 'monitor',
    DEPLOY = 'deploy',
    DOCS = 'docs',
    TROUBLESHOOT = 'troubleshoot'
}

/**
 * SRE task context extracted from user input
 */
export interface SreTaskContext {
    type: SreTaskType;
    target: string;
    parameters: Map<string, string>;
    environment?: string;
    urgency?: 'low' | 'medium' | 'high';
    rawInput: string;
}

/**
 * Implementation plan step
 */
export interface ImplementationStep {
    step: number;
    title: string;
    description: string;
    codeExample?: string;
    documentation?: string[];
    validationSteps?: string[];
}

/**
 * Complete SRE implementation plan
 */
export interface SreImplementationPlan {
    taskSummary: string;
    steps: ImplementationStep[];
    prerequisites: string[];
    estimatedTime: string;
    riskLevel: 'low' | 'medium' | 'high';
    rollbackSteps: string[];
}

/**
 * Parser for SRE tasks from natural language input
 * Converts user descriptions into structured, actionable implementation plans
 */
export class SreTaskParser {
    private logger: Logger;
    
    // Common SRE tools and services patterns
    private readonly toolPatterns: Map<string, RegExp> = new Map([
        ['dynatrace', /dynatrace|dt\s+agent|dynatrace\s+agent/i],
        ['datadog', /datadog|dd\s+agent|datadog\s+agent/i],
        ['prometheus', /prometheus|prom\s+monitoring|prometheus\s+monitoring/i],
        ['grafana', /grafana|grafana\s+dashboard/i],
        ['kubernetes', /k8s|kubernetes|kubectl|kube/i],
        ['docker', /docker|container|containerize/i],
        ['terraform', /terraform|tf\s+deploy|infrastructure\s+as\s+code/i],
        ['ansible', /ansible|playbook|automation/i],
        ['nginx', /nginx|reverse\s+proxy|load\s+balancer/i],
        ['redis', /redis|cache|caching/i],
        ['elasticsearch', /elasticsearch|elk\s+stack|elastic/i],
        ['jenkins', /jenkins|ci\/cd|pipeline/i]
    ]);

    private readonly environmentPatterns: Map<string, RegExp> = new Map([
        ['production', /prod|production|live/i],
        ['staging', /staging|stage|uat/i],
        ['development', /dev|development|local/i],
        ['testing', /test|testing|qa/i]
    ]);

    constructor(logger: Logger) {
        this.logger = logger;
    }

    /**
     * Parse user input into structured SRE task context
     */
    parseTask(input: string): SreTaskContext {
        this.logger.debug('Parsing SRE task:', input);
        
        const lowerInput = input.toLowerCase();
        const context: SreTaskContext = {
            type: this.extractTaskType(lowerInput),
            target: this.extractTarget(lowerInput),
            parameters: this.extractParameters(lowerInput),
            environment: this.extractEnvironment(lowerInput),
            urgency: this.extractUrgency(lowerInput),
            rawInput: input
        };

        this.logger.debug('Parsed context:', context);
        return context;
    }

    /**
     * Generate implementation plan from task context
     */
    generateImplementationPlan(context: SreTaskContext): SreImplementationPlan {
        this.logger.info(`Generating implementation plan for ${context.type} ${context.target}`);
        
        const plan: SreImplementationPlan = {
            taskSummary: this.generateTaskSummary(context),
            steps: this.generateSteps(context),
            prerequisites: this.generatePrerequisites(context),
            estimatedTime: this.estimateTime(context),
            riskLevel: this.assessRisk(context),
            rollbackSteps: this.generateRollbackSteps(context)
        };

        return plan;
    }

    /**
     * Extract task type from user input
     */
    private extractTaskType(input: string): SreTaskType {
        if (/monitor|monitoring|alert|alerting|dashboard/.test(input)) {
            return SreTaskType.MONITOR;
        }
        if (/implement|install|setup|add/.test(input)) {
            return SreTaskType.IMPLEMENT;
        }
        if (/configure|config|set\s+up|customize/.test(input)) {
            return SreTaskType.CONFIGURE;
        }
        if (/deploy|deployment|release|rollout/.test(input)) {
            return SreTaskType.DEPLOY;
        }
        if (/doc|documentation|guide|help|reference/.test(input)) {
            return SreTaskType.DOCS;
        }
        if (/troubleshoot|debug|issue|problem|fix/.test(input)) {
            return SreTaskType.TROUBLESHOOT;
        }
        
        // Default to implement
        return SreTaskType.IMPLEMENT;
    }

    /**
     * Extract target tool/service from user input
     */
    private extractTarget(input: string): string {
        for (const [tool, pattern] of this.toolPatterns) {
            if (pattern.test(input)) {
                return tool;
            }
        }
        
        // Try to extract from common patterns
        const words = input.split(/\s+/);
        const toolWords = words.filter(word => 
            word.length > 3 && 
            !/^(the|and|for|with|using|on|in|at|to|from)$/i.test(word)
        );
        
        return toolWords[0] || 'unknown';
    }

    /**
     * Extract parameters from user input
     */
    private extractParameters(input: string): Map<string, string> {
        const parameters = new Map<string, string>();
        
        // Extract version numbers
        const versionMatch = input.match(/version\s+([0-9.]+)|v([0-9.]+)/i);
        if (versionMatch) {
            parameters.set('version', versionMatch[1] || versionMatch[2]);
        }
        
        // Extract port numbers
        const portMatch = input.match(/port\s+([0-9]+)|:([0-9]+)/);
        if (portMatch) {
            parameters.set('port', portMatch[1] || portMatch[2]);
        }
        
        // Extract namespace for Kubernetes
        const namespaceMatch = input.match(/namespace\s+([a-z0-9-]+)/i);
        if (namespaceMatch) {
            parameters.set('namespace', namespaceMatch[1]);
        }
        
        return parameters;
    }

    /**
     * Extract environment from user input
     */
    private extractEnvironment(input: string): string | undefined {
        for (const [env, pattern] of this.environmentPatterns) {
            if (pattern.test(input)) {
                return env;
            }
        }
        return undefined;
    }

    /**
     * Extract urgency level from user input
     */
    private extractUrgency(input: string): 'low' | 'medium' | 'high' | undefined {
        if (/urgent|critical|asap|immediately|high\s+priority/.test(input)) {
            return 'high';
        }
        if (/soon|medium\s+priority|moderate/.test(input)) {
            return 'medium';
        }
        if (/low\s+priority|when\s+possible|eventually/.test(input)) {
            return 'low';
        }
        return undefined;
    }

    /**
     * Generate task summary
     */
    private generateTaskSummary(context: SreTaskContext): string {
        const envStr = context.environment ? ` in ${context.environment}` : '';
        return `${context.type.charAt(0).toUpperCase() + context.type.slice(1)} ${context.target}${envStr}`;
    }

    /**
     * Generate implementation steps based on context
     */
    private generateSteps(context: SreTaskContext): ImplementationStep[] {
        const steps: ImplementationStep[] = [];
        
        switch (context.target) {
            case 'dynatrace':
                return this.generateDynatraceSteps(context);
            case 'prometheus':
                return this.generatePrometheusSteps(context);
            case 'kubernetes':
                return this.generateKubernetesSteps(context);
            default:
                return this.generateGenericSteps(context);
        }
    }

    /**
     * Generate Dynatrace-specific implementation steps
     */
    private generateDynatraceSteps(context: SreTaskContext): ImplementationStep[] {
        return [
            {
                step: 1,
                title: 'Retrieve Dynatrace Configuration',
                description: 'Get tenant ID and API token from internal documentation',
                documentation: ['Dynatrace Setup Guide', 'Security Token Management']
            },
            {
                step: 2,
                title: 'Deploy OneAgent',
                description: 'Install Dynatrace OneAgent as DaemonSet',
                codeExample: this.getDynatraceK8sExample(context),
                validationSteps: ['Check pod status', 'Verify agent connectivity']
            },
            {
                step: 3,
                title: 'Configure Monitoring Rules',
                description: 'Set up application monitoring and alerting rules',
                validationSteps: ['Test alert triggers', 'Validate metrics collection']
            }
        ];
    }

    /**
     * Generate Prometheus-specific implementation steps
     */
    private generatePrometheusSteps(context: SreTaskContext): ImplementationStep[] {
        return [
            {
                step: 1,
                title: 'Deploy Prometheus Server',
                description: 'Set up Prometheus server with persistent storage',
                codeExample: 'kubectl apply -f prometheus-deployment.yaml'
            },
            {
                step: 2,
                title: 'Configure Service Discovery',
                description: 'Set up automatic service discovery for monitoring targets'
            },
            {
                step: 3,
                title: 'Create Alerting Rules',
                description: 'Define alerting rules for SRE metrics and SLIs'
            }
        ];
    }

    /**
     * Generate Kubernetes-specific implementation steps
     */
    private generateKubernetesSteps(context: SreTaskContext): ImplementationStep[] {
        return [
            {
                step: 1,
                title: 'Create Namespace',
                description: 'Set up dedicated namespace for the application'
            },
            {
                step: 2,
                title: 'Deploy Application',
                description: 'Create deployment and service manifests'
            },
            {
                step: 3,
                title: 'Configure Ingress',
                description: 'Set up ingress controller and routing rules'
            }
        ];
    }

    /**
     * Generate generic implementation steps
     */
    private generateGenericSteps(context: SreTaskContext): ImplementationStep[] {
        return [
            {
                step: 1,
                title: 'Research and Planning',
                description: `Research ${context.target} implementation requirements and best practices`
            },
            {
                step: 2,
                title: 'Environment Preparation',
                description: 'Prepare target environment and install dependencies'
            },
            {
                step: 3,
                title: 'Implementation',
                description: `Deploy and configure ${context.target}`
            },
            {
                step: 4,
                title: 'Validation and Testing',
                description: 'Validate implementation and run acceptance tests'
            }
        ];
    }

    /**
     * Generate prerequisites based on context
     */
    private generatePrerequisites(context: SreTaskContext): string[] {
        const prerequisites: string[] = [];
        
        if (context.target === 'kubernetes' || /k8s/.test(context.rawInput)) {
            prerequisites.push('Kubernetes cluster access', 'kubectl configured');
        }
        
        if (context.environment === 'production') {
            prerequisites.push('Change management approval', 'Backup verification');
        }
        
        prerequisites.push('Access to internal documentation', 'Required permissions verified');
        
        return prerequisites;
    }

    /**
     * Estimate implementation time
     */
    private estimateTime(context: SreTaskContext): string {
        const complexity = this.assessComplexity(context);
        
        switch (complexity) {
            case 'low': return '1-2 hours';
            case 'medium': return '4-8 hours';
            case 'high': return '1-2 days';
            default: return '2-4 hours';
        }
    }

    /**
     * Assess implementation risk
     */
    private assessRisk(context: SreTaskContext): 'low' | 'medium' | 'high' {
        if (context.environment === 'production') {
            return 'high';
        }
        if (context.urgency === 'high') {
            return 'medium';
        }
        return 'low';
    }

    /**
     * Generate rollback steps
     */
    private generateRollbackSteps(context: SreTaskContext): string[] {
        return [
            'Stop new deployment',
            'Restore previous configuration',
            'Verify system stability',
            'Update monitoring dashboards'
        ];
    }

    /**
     * Assess implementation complexity
     */
    private assessComplexity(context: SreTaskContext): 'low' | 'medium' | 'high' {
        const complexTools = ['kubernetes', 'prometheus', 'elasticsearch'];
        if (complexTools.includes(context.target)) {
            return 'high';
        }
        
        if (context.parameters.size > 2) {
            return 'medium';
        }
        
        return 'low';
    }

    /**
     * Get Dynatrace Kubernetes example
     */
    private getDynatraceK8sExample(context: SreTaskContext): string {
        const namespace = context.parameters.get('namespace') || 'dynatrace';
        
        return `apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: dynatrace-oneagent
  namespace: ${namespace}
spec:
  selector:
    matchLabels:
      name: dynatrace-oneagent
  template:
    metadata:
      labels:
        name: dynatrace-oneagent
    spec:
      containers:
      - name: dynatrace-oneagent
        image: dynatrace/oneagent
        env:
        - name: DT_TENANT
          valueFrom:
            secretKeyRef:
              name: dynatrace-secret
              key: tenant
        - name: DT_API_TOKEN
          valueFrom:
            secretKeyRef:
              name: dynatrace-secret
              key: apiToken
        - name: DT_CLUSTER_ID
          value: "production-cluster"
        securityContext:
          privileged: true
        volumeMounts:
        - name: host-root
          mountPath: /mnt/root
      volumes:
      - name: host-root
        hostPath:
          path: /
      hostNetwork: true
      hostPID: true
      hostIPC: true`;
    }
}
