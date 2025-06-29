import * as vscode from 'vscode';

/**
 * Logger utility for SreBuddy extension
 * Provides structured logging with configurable output levels
 */
export class Logger {
    private outputChannel: vscode.OutputChannel;
    private isLoggingEnabled: boolean;

    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('SreBuddy');
        this.isLoggingEnabled = this.getLoggingConfiguration();
        
        // Watch for configuration changes
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration('srebuddy.enableLogging')) {
                this.isLoggingEnabled = this.getLoggingConfiguration();
            }
        });
    }

    private getLoggingConfiguration(): boolean {
        return vscode.workspace.getConfiguration('srebuddy').get('enableLogging', false);
    }

    private log(level: string, message: string, ...args: any[]): void {
        const timestamp = new Date().toISOString();
        const formattedMessage = `[${timestamp}] [${level}] ${message}`;
        
        if (this.isLoggingEnabled) {
            this.outputChannel.appendLine(formattedMessage);
            if (args.length > 0) {
                this.outputChannel.appendLine(`  Data: ${JSON.stringify(args, null, 2)}`);
            }
        }

        // Always log errors to console for debugging
        if (level === 'ERROR') {
            console.error(formattedMessage, ...args);
        }
    }

    /**
     * Log an info message
     */
    info(message: string, ...args: any[]): void {
        this.log('INFO', message, ...args);
    }

    /**
     * Log a warning message
     */
    warn(message: string, ...args: any[]): void {
        this.log('WARN', message, ...args);
    }

    /**
     * Log an error message
     */
    error(message: string, ...args: any[]): void {
        this.log('ERROR', message, ...args);
    }

    /**
     * Log a debug message
     */
    debug(message: string, ...args: any[]): void {
        this.log('DEBUG', message, ...args);
    }

    /**
     * Show the output channel
     */
    show(): void {
        this.outputChannel.show();
    }

    /**
     * Dispose of the logger resources
     */
    dispose(): void {
        this.outputChannel.dispose();
    }
}
