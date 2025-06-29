# Contributing to SreBuddy

Thank you for your interest in contributing to SreBuddy! This document provides guidelines and information for contributors.

## 🚀 Quick Start

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/srebuddy-extension.git
   cd srebuddy-extension
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🛠️ Development Setup

### Prerequisites

- VS Code 1.101.0 or later
- Node.js 20.x or later
- TypeScript 5.8.3 or later
- Git

### Development Workflow

1. **Start development**:
   ```bash
   npm run watch    # Watch mode for auto-compilation
   ```

2. **Test the extension**:
   - Press `F5` in VS Code to launch Extension Development Host
   - Test your changes with `@srebuddy` in Copilot Chat

3. **Run checks**:
   ```bash
   npm run lint         # ESLint
   npm run check-types  # TypeScript type checking
   npm run test         # Run tests
   ```

4. **Build for production**:
   ```bash
   npm run compile      # Full build
   npm run vsce:package # Create VSIX package
   ```

## 📁 Project Structure

```
srebuddy-extension/
├── .github/
│   └── copilot-instructions.md    # SRE prompt templates (auto-copied to workspaces)
├── src/
│   ├── extension.ts               # Extension activation/deactivation
│   ├── chatParticipant.ts         # Main chat participant logic
│   ├── srePromptLoader.ts         # Dynamic prompt template loading
│   ├── mcpServerManager.ts        # MCP server management (local + remote)
│   ├── sreTaskParser.ts           # Natural language task parsing
│   ├── agentHandler.ts            # Command Palette agent mode
│   └── logger.ts                  # Structured logging
└── ...
```

## 🎯 How to Contribute

### 1. SRE Prompt Templates

Add new SRE scenarios to `.github/copilot-instructions.md`:

```markdown
## SRE [Action] Prompts

### Examples

- [action] [technology/tool]
- [action] [specific scenario]

### Prompt

You are SreBuddy, an expert Site Reliability Engineer assistant specializing in [domain].

Task: [Action] {{target}} in {{environment}} environment
Context: {{rawInput}}

[Detailed prompt template...]

### Tags

- tag1
- tag2
```

### 2. MCP Server Support

Add new MCP server configurations in `package.json`:

```json
{
  "name": "new-server",
  "type": "local",
  "command": "npx",
  "args": ["@some/mcp-server", "config"],
  "description": "Description of what this server provides"
}
```

### 3. Task Parsing

Extend `SreTaskParser` in `src/sreTaskParser.ts` to handle new command patterns:

```typescript
// Add new command recognition
if (input.includes('new-command')) {
    return {
        command: 'new-command',
        target: extractTarget(input),
        environment: extractEnvironment(input),
        riskLevel: assessRisk(input)
    };
}
```

### 4. Chat Participant Features

Enhance `SreBuddyChatParticipant` in `src/chatParticipant.ts`:

- Add new command handlers
- Improve response formatting
- Add new follow-up suggestions

## 🧪 Testing

### Manual Testing

1. **Launch Extension Development Host**:
   - Press `F5` in VS Code
   - Open Copilot Chat in the development instance

2. **Test scenarios**:
   ```
   @srebuddy implement prometheus monitoring
   @srebuddy configure kubernetes cluster
   @srebuddy troubleshoot high memory usage
   ```

3. **Test MCP integration**:
   - Configure test MCP servers
   - Verify documentation retrieval
   - Check prompt template matching

### Automated Testing

```bash
npm run test
```

## 📝 Code Guidelines

### TypeScript Standards

- Use strict TypeScript configuration
- Add JSDoc comments for public APIs
- Use proper type annotations
- Follow async/await patterns

### Example:

```typescript
/**
 * Parse natural language SRE task input
 * @param input - User's natural language request
 * @returns Structured task object with parsed components
 */
async parseTask(input: string): Promise<SreTask> {
    // Implementation
}
```

### ESLint Rules

- Follow the existing ESLint configuration
- Use consistent formatting
- Avoid `any` types where possible
- Use meaningful variable names

### Logging

Use the structured logger:

```typescript
this.logger.info('Operation completed successfully');
this.logger.warn('Potential issue detected');
this.logger.error('Operation failed:', error);
this.logger.debug('Detailed debug information');
```

## 🔄 Submission Process

### Before Submitting

1. **Test thoroughly**:
   - Manual testing in Extension Development Host
   - Run all automated tests
   - Test with different MCP server configurations

2. **Code quality**:
   ```bash
   npm run lint
   npm run check-types
   npm run compile
   ```

3. **Documentation**:
   - Update README.md if needed
   - Add JSDoc comments
   - Update CHANGELOG.md

### Pull Request Guidelines

1. **Create descriptive PR title**:
   - `feat: add support for Docker Swarm deployments`
   - `fix: resolve MCP server connection timeout`
   - `docs: update installation instructions`

2. **Provide detailed description**:
   - What changes were made
   - Why the changes were necessary
   - How to test the changes

3. **Reference issues**:
   - Link to related GitHub issues
   - Use keywords: `Fixes #123`, `Closes #456`

### Commit Message Format

Use conventional commits:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

Examples:
```
feat(mcp): add support for Slack MCP server
fix(parser): handle edge case in task parsing
docs(readme): update installation instructions
```

## 🏗️ Architecture Guidelines

### Adding New Commands

1. **Update prompt templates** in `.github/copilot-instructions.md`
2. **Extend task parser** to recognize new patterns
3. **Add command handler** in chat participant
4. **Update documentation**

### MCP Server Integration

1. **Local servers**: Use `npx` commands with proper error handling
2. **Remote servers**: Use HTTP clients with timeout and retry logic
3. **Configuration**: Add to default config in `package.json`
4. **Documentation**: Update `MCP_CONFIGURATION.md`

### Error Handling

- Use try-catch blocks for async operations
- Provide meaningful error messages to users
- Log errors with appropriate detail level
- Implement graceful degradation

## 📋 Issue Reporting

### Bug Reports

Include:
- VS Code version
- Extension version
- Steps to reproduce
- Expected vs actual behavior
- Error messages/logs
- MCP server configuration (if relevant)

### Feature Requests

Include:
- Use case description
- Proposed solution
- Alternative approaches considered
- Impact on existing functionality

## 🎉 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Acknowledged in documentation

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and ideas
- **Code Review**: Maintainers will provide feedback on PRs

Thank you for contributing to SreBuddy! 🚀
