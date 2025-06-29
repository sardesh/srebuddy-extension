import * as assert from 'assert';
import * as vscode from 'vscode';
import { SreTaskParser, SreTaskType } from '../sreTaskParser';
import { Logger } from '../logger';

suite('SreBuddy Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('SreTaskParser - Parse Dynatrace Implementation', () => {
		const logger = new Logger();
		const parser = new SreTaskParser(logger);
		
		const context = parser.parseTask('implement dynatrace agent in production kubernetes');
		
		assert.strictEqual(context.type, SreTaskType.IMPLEMENT);
		assert.strictEqual(context.target, 'dynatrace');
		assert.strictEqual(context.environment, 'production');
	});

	test('SreTaskParser - Parse Monitoring Task', () => {
		const logger = new Logger();
		const parser = new SreTaskParser(logger);
		
		const context = parser.parseTask('monitor prometheus setup with grafana dashboard');
		
		assert.strictEqual(context.type, SreTaskType.MONITOR);
		assert.strictEqual(context.target, 'prometheus');
	});

	test('SreTaskParser - Generate Implementation Plan', () => {
		const logger = new Logger();
		const parser = new SreTaskParser(logger);
		
		const context = parser.parseTask('implement dynatrace agent in staging');
		const plan = parser.generateImplementationPlan(context);
		
		assert.ok(plan.taskSummary);
		assert.ok(plan.steps.length > 0);
		assert.ok(plan.prerequisites.length > 0);
		assert.ok(plan.rollbackSteps.length > 0);
		assert.ok(['low', 'medium', 'high'].includes(plan.riskLevel));
	});

	test('Logger - Basic Logging', () => {
		const logger = new Logger();
		
		// These should not throw errors
		logger.info('Test info message');
		logger.warn('Test warning message');
		logger.error('Test error message');
		logger.debug('Test debug message');
		
		assert.ok(true); // If we get here, logging didn't throw
	});
});
