# SreBuddy VS Code Extension - Complete Recreation Prompt

Create a comprehensive VS Code extension called "SreBuddy" - an AI-powered Site Reliability Engineering (SRE) assistant that integrates with GitHub Copilot and provides both Chat Mode and Agent Mode functionality for automating SRE tasks.

## 📋 Extension Overview

**Name**: SreBuddy SRE Assistant  
**Version**: 0.1.0  
**Compatibility**: VS Code ^1.99.0  
**License**: MIT  
**Category**: AI, Other

### Description

AI-powered SRE assistant with advanced LLM integration via GitHub Copilot for automating SRE tasks, generating configurations, and accessing internal documentation via MCP servers.

## 🏗️ Architecture & Core Components

The extension should have the following TypeScript modules:

### 1. Main Extension Module (`src/extension.ts`)

- **Activation**: Activates on chat participant registration and startup
- **Dual Mode Setup**: Registers both Chat Mode (@srebuddy) and Agent Mode (Command Palette)
- **MCP Auto-Installation**: First-time setup with user prompt for MCP server installation
- **Workspace Template Setup**: Creates `.github/copilot-instructions.md` in workspaces
- **Welcome Flow**: Shows informational messages on first activation
- **Cleanup**: Proper deactivation and resource cleanup

### 2. Chat Participant (`src/chatParticipant.ts`)

- **GitHub Copilot Integration**: Implements `@srebuddy` chat participant
- **Command Handling**: Supports `/implement`, `/configure`, `/monitor`, `/deploy`, `/troubleshoot`, `/docs`
- **Natural Language Processing**: Handles general queries without specific commands
- **LLM Integration**: Uses VS Code Language Model API with streaming support
- **Progress Indication**: Shows progress during task processing
- **Interactive Elements**: Provides action buttons and follow-up suggestions
- **Error Handling**: Comprehensive error handling with user-friendly messages

### 3. Agent Handler (`src/agentHandler.ts`)

- **Command Palette Interface**: Provides guided UI for SRE tasks
- **Task Types**: Implement, Configure, Deploy, Troubleshoot, Monitor
- **Interactive Prompts**: Uses VS Code QuickPick and InputBox for user input
- **Results Display**: Opens results in new markdown documents
- **Export Options**: Copy to clipboard and save to file functionality
- **Progress Tracking**: Shows progress notifications during execution

### 4. Task Parser (`src/sreTaskParser.ts`)

- **Natural Language Understanding**: Parses user input into structured task context
- **Pattern Recognition**: Identifies tools (Dynatrace, Prometheus, K8s, etc.) and environments
- **Risk Assessment**: Evaluates implementation risk based on environment and target
- **Implementation Planning**: Generates detailed step-by-step implementation plans
- **Rollback Planning**: Creates rollback procedures for each task
- **Validation Steps**: Provides verification steps for implementations

### 5. MCP Integration (`src/mcpServerManager.ts`)

- **Simplified Management**: Delegates to VS Code's native MCP system
- **Server Status**: Retrieves available MCP servers from VS Code configuration
- **No Direct Management**: VS Code handles all MCP server lifecycle

### 6. MCP Installation (`src/mcpInstaller.ts` & `src/mcpConfig.ts`)

- **Auto-Installation**: Installs default MCP servers to VS Code settings
- **Configuration Management**: Manages MCP server configurations
- **Platform Support**: Cross-platform settings file handling (Windows, macOS, Linux)
- **Conflict Resolution**: Checks for existing servers before installation
- **Minimal Setup**: Only includes essential MCP servers (SQLite by default)

### 7. Dynamic Prompt System (`src/srePromptLoader.ts`)

- **Template Loading**: Reads prompt templates from `.github/copilot-instructions.md`
- **Pattern Matching**: Matches user requests to appropriate prompt templates
- **Template Enhancement**: Combines base prompts with MCP documentation context
- **Fallback Support**: Uses hardcoded prompts when templates aren't available
- **Example-Based Matching**: Uses examples in templates to find best matches

### 8. Logging System (`src/logger.ts`)

- **Configurable Logging**: Debug, info, warn, error levels
- **VS Code Integration**: Uses VS Code's output channel
- **Extension Settings**: Controlled via `srebuddy.enableLogging` setting

## 🎯 Key Features to Implement

### Chat Mode (@srebuddy)

- **Participant Registration**: Register as `srebuddy` chat participant with server-process icon
- **Command Support**: Handle commands like `/implement`, `/configure`, `/monitor`, `/deploy`, `/troubleshoot`
- **Natural Language**: Process general queries without specific commands
- **LLM Integration**: Use VS Code Language Model API for intelligent responses
- **Streaming Responses**: Stream LLM responses in real-time
- **Interactive Elements**: Add action buttons and follow-up suggestions
- **Progress Indicators**: Show progress during long-running operations

### Agent Mode (Command Palette)

- **Guided UI**: Interactive prompts for task selection and configuration
- **Task Categories**: Implement, Configure, Deploy, Troubleshoot, Monitor
- **Input Validation**: Ensure required fields are provided
- **Rich Results**: Display results in formatted markdown documents
- **Export Options**: Copy results or save to files

### SRE Task Support

The extension should support these SRE task types:

#### Implementation Tasks

- Monitoring agents (Dynatrace, Datadog, New Relic)
- Observability tools (Prometheus, Grafana, ELK stack)
- Infrastructure components (Load balancers, caches, databases)
- CI/CD pipelines and automation tools

#### Configuration Generation

- YAML configurations for Kubernetes, Docker Compose
- Infrastructure as Code (Terraform, CloudFormation)
- Monitoring configurations (Prometheus rules, Grafana dashboards)
- Security policies and authentication configs

#### Deployment Planning

- Blue/green, canary, rolling deployment strategies
- Infrastructure provisioning and scaling
- Health checks and validation procedures
- Rollback and disaster recovery plans

#### Monitoring & Alerting

- Metrics collection and aggregation
- Dashboard creation and customization
- Alert rules and notification routing
- SLI/SLO definition and tracking

#### Troubleshooting Guides

- Incident response procedures
- Diagnostic commands and tools
- Common issue resolution
- Escalation paths and communication

### MCP Integration Features

- **Auto-Installation**: Prompt users to install default MCP servers on first use
- **Documentation Access**: Leverage MCP servers for internal documentation
- **Context Enhancement**: Use MCP documentation to enhance LLM prompts
- **Server Management**: Check and display available MCP server status

## 📁 File Structure

```
src/
├── extension.ts              # Main extension entry point
├── chatParticipant.ts        # GitHub Copilot chat integration
├── agentHandler.ts          # Command Palette agent mode
├── sreTaskParser.ts         # Natural language task parsing
├── mcpServerManager.ts      # MCP server management
├── mcpInstaller.ts          # MCP server installation
├── mcpConfig.ts             # MCP configuration management
├── srePromptLoader.ts       # Dynamic prompt template system
├── logger.ts                # Logging utilities
└── test/
    └── extension.test.ts    # Extension tests

.github/
└── copilot-instructions.md  # SRE prompt templates

package.json                  # Extension manifest
tsconfig.json                # TypeScript configuration
esbuild.js                   # Build configuration
eslint.config.mjs            # ESLint configuration
```

## 📦 Package.json Configuration

### Activation Events

```json
"activationEvents": [
  "onChatParticipant:srebuddy",
  "onStartupFinished"
]
```

### Chat Participant Contribution

```json
"chatParticipants": [
  {
    "id": "srebuddy",
    "name": "SreBuddy",
    "description": "AI-powered SRE assistant for automating SRE tasks and accessing documentation",
    "isSticky": true,
    "commands": [
      {
        "name": "implement",
        "description": "Implement a specific SRE solution or deployment"
      },
      {
        "name": "configure",
        "description": "Generate configuration files for SRE tools"
      },
      {
        "name": "monitor",
        "description": "Set up monitoring and alerting solutions"
      },
      {
        "name": "deploy",
        "description": "Create deployment scripts and configurations"
      },
      {
        "name": "docs",
        "description": "Search and retrieve SRE documentation"
      }
    ]
  }
]
```

### Command Contributions

```json
"commands": [
  {
    "command": "srebuddy.implementTask",
    "title": "Implement SRE Task",
    "category": "SreBuddy"
  },
  {
    "command": "srebuddy.generateConfig",
    "title": "Generate Configuration",
    "category": "SreBuddy"
  },
  {
    "command": "srebuddy.deploymentPlan",
    "title": "Create Deployment Plan",
    "category": "SreBuddy"
  },
  {
    "command": "srebuddy.troubleshoot",
    "title": "Troubleshooting Guide",
    "category": "SreBuddy"
  },
  {
    "command": "srebuddy.monitoring",
    "title": "Setup Monitoring",
    "category": "SreBuddy"
  },
  {
    "command": "srebuddy.setupTemplates",
    "title": "Setup Prompt Templates",
    "category": "SreBuddy"
  }
]
```

### Configuration Properties

```json
"configuration": {
  "title": "SreBuddy",
  "properties": {
    "srebuddy.enableLogging": {
      "type": "boolean",
      "default": false,
      "description": "Enable detailed logging for debugging"
    },
    "srebuddy.agentMode": {
      "type": "boolean",
      "default": true,
      "description": "Enable Agent mode commands in Command Palette"
    }
  }
}
```

### Dependencies

```json
"dependencies": {
  "@modelcontextprotocol/sdk": "^1.13.2"
}
```

## 🎨 Prompt Template System

Create a comprehensive prompt template file (`.github/copilot-instructions.md`) with sections for:

### Template Structure

Each template should have:

- **Examples**: Sample user inputs that match this template
- **Prompt**: Detailed prompt with placeholders ({{target}}, {{environment}}, {{rawInput}}, {{riskLevel}})
- **Tags**: Keywords for template matching

### Required Templates

1. **SRE Implement Prompts** - Infrastructure implementation guidance
2. **SRE Configure Prompts** - Configuration generation
3. **SRE Monitor Prompts** - Monitoring and observability setup
4. **SRE Deploy Prompts** - Deployment strategies and planning
5. **SRE Troubleshoot Prompts** - Incident response and debugging

### Template Features

- Dynamic placeholder replacement
- Risk assessment integration
- Best practices inclusion
- Production-ready focus
- Security considerations
- Rollback procedures

## 🔧 Technical Implementation Details

### VS Code API Usage

- **Chat API**: `vscode.chat.createChatParticipant()` for @srebuddy
- **Language Model API**: `vscode.lm.selectChatModels()` for LLM integration
- **Commands**: `vscode.commands.registerCommand()` for agent mode
- **UI Elements**: QuickPick, InputBox, Progress notifications
- **File System**: Workspace and extension file operations

### Error Handling Strategy

- Graceful degradation when LLM is unavailable
- User-friendly error messages
- Logging for debugging
- Fallback to basic functionality

### Performance Considerations

- Lazy loading of templates
- Efficient pattern matching
- Streaming responses for better UX
- Background task execution

### Security & Privacy

- No sensitive data storage
- User consent for MCP server installation
- Secure API token handling
- Privacy-conscious logging

## 🚀 User Experience Flow

### First-Time Setup

1. Extension activates on VS Code startup
2. Shows welcome message with options to explore
3. Prompts for MCP server installation
4. Creates workspace template files
5. Shows tutorial or getting started guide

### Chat Mode Usage

1. User types `@srebuddy implement prometheus monitoring`
2. Extension parses the request
3. Loads appropriate prompt template
4. Enhances with MCP documentation
5. Calls Language Model API
6. Streams response with progress
7. Shows action buttons for follow-up

### Agent Mode Usage

1. User opens Command Palette → "SreBuddy: Implement SRE Task"
2. Extension shows guided prompts
3. Collects task details through UI
4. Generates implementation plan
5. Opens results in new document
6. Provides export options

## 🧪 Testing Requirements

### Unit Tests

- Task parsing logic
- Template matching algorithms
- Configuration management
- Error handling scenarios

### Integration Tests

- Chat participant registration
- LLM API integration
- MCP server communication
- File system operations

### User Acceptance Tests

- End-to-end chat interactions
- Agent mode workflows
- Template system functionality
- Error recovery scenarios

## 📚 Documentation Requirements

### User Documentation

- Comprehensive README with examples
- Installation and setup guide
- Command reference
- Troubleshooting guide

### Developer Documentation

- Architecture overview
- API documentation
- Contributing guidelines
- Development setup

### Template Documentation

- Prompt template format
- Example creation guide
- Best practices for prompts
- Template testing procedures

## 🔄 Version Control & Deployment

### Build Configuration

- TypeScript compilation with strict settings
- ESBuild for bundling and optimization
- ESLint for code quality
- Source maps for debugging

### Packaging

- VSIX generation with `vsce package`
- Extension marketplace publishing
- Version management and changelogs
- Release automation

### Quality Assurance

- Automated testing in CI/CD
- Code coverage requirements
- Performance benchmarking
- Security scanning

## 🎯 Success Criteria

The extension should successfully:

1. Register as a chat participant accessible via `@srebuddy`
2. Process natural language SRE requests intelligently
3. Generate production-ready implementation plans
4. Provide guided agent mode for complex tasks
5. Integrate with MCP servers for documentation access
6. Handle errors gracefully with user feedback
7. Maintain high performance and responsiveness
8. Provide comprehensive logging and debugging capabilities

## 🚀 Future Enhancement Ideas

- Custom template creation UI
- Integration with more SRE tools
- Team collaboration features
- Analytics and usage tracking
- Advanced natural language understanding
- Workflow automation capabilities
- Integration with external ticketing systems
- Real-time collaboration features

This prompt provides a complete specification for recreating the SreBuddy extension with all its current features and architecture. Use this as a comprehensive guide to rebuild the extension from scratch while maintaining all existing functionality and improving upon the current implementation.
