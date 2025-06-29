# SreBuddy - AI-Powered SRE Assistant

SreBuddy is an AI-powered Site Reliability Engineering (SRE) assistant integrated with GitHub Copilot via the `@srebuddy` chat participant. It helps automate SRE tasks, generates deployment scripts, configurations, and provides access to internal documentation through MCP (Model Context Protocol) servers.

## 🚀 Features

- **GitHub Copilot Integration**: Use `@srebuddy` in GitHub Copilot Chat to get SRE assistance
- **Natural Language Processing**: Describe SRE tasks in plain English and get actionable implementation plans
- **MCP Server Support**: Connect to internal documentation and standards repositories via `npx` commands
- **Multi-Tool Support**: Generate configurations for Dynatrace, Prometheus, Kubernetes, Docker, and more
- **Smart Task Parsing**: Automatically detects task types, environments, and parameters from user input
- **Implementation Plans**: Provides step-by-step implementation guides with code examples
- **Documentation Search**: Search and retrieve relevant internal SRE documentation
- **Risk Assessment**: Evaluates implementation risk and provides rollback plans
- **Dynamic Prompt Templates**: Uses `.github/copilot-instructions.md` for LLM prompt templates

## 🎯 Usage

### Basic Commands

Use the following commands with `@srebuddy` in GitHub Copilot Chat:

- `@srebuddy implement dynatrace agent` - Implement Dynatrace monitoring
- `@srebuddy configure prometheus` - Set up Prometheus monitoring
- `@srebuddy monitor kubernetes cluster` - Create monitoring setup for K8s
- `@srebuddy deploy application to production` - Generate deployment scripts
- `@srebuddy troubleshoot high cpu usage` - Get troubleshooting guide

### Supported Commands

- **implement** - Implement a specific SRE solution or deployment
- **configure** - Generate configuration files for SRE tools
- **monitor** - Set up monitoring and alerting solutions
- **deploy** - Create deployment scripts and configurations
- **troubleshoot** - Get incident response and debugging guides

### Example Interactions

```
@srebuddy implement dynatrace agent in production kubernetes cluster
```

This will generate:

- Step-by-step implementation plan
- Kubernetes DaemonSet configuration
- Security considerations
- Validation steps
- Rollback procedures

## ⚙️ Quick Start

### Prerequisites

- VS Code 1.101.0 or later
- Node.js 20.x or later
- GitHub Copilot extension installed and activated

### Installation from VSIX

1. Download the latest `srebuddy-0.1.0.vsix` from releases
2. Install in VS Code: `code --install-extension srebuddy-0.1.0.vsix`
3. Reload VS Code
4. Use `@srebuddy` in GitHub Copilot Chat

### Installation from Source

```bash
git clone https://github.com/your-username/srebuddy-extension.git
cd srebuddy-extension
npm install
npm run compile
```

Press `F5` to launch the extension in a new Extension Development Host window.

## 🔧 Configuration

### MCP Server Setup

The extension comes with **three pre-configured MCP servers** using `npx` commands:

1. **Filesystem Server**: `npx @modelcontextprotocol/server-filesystem /`
2. **GitHub Server**: `npx @modelcontextprotocol/server-github` (requires `GITHUB_PERSONAL_ACCESS_TOKEN`)
3. **Brave Search**: `npx @modelcontextprotocol/server-brave-search` (requires `BRAVE_API_KEY`)

#### Configuration Steps

1. Open VS Code Settings (`Cmd+,` on Mac, `Ctrl+,` on Windows/Linux)
2. Search for "SreBuddy"
3. Configure `srebuddy.mcpServers` to customize servers or add your own

#### Environment Variables (Optional)

For servers that require API keys:

```bash
export GITHUB_PERSONAL_ACCESS_TOKEN="your_github_token"
export BRAVE_API_KEY="your_brave_api_key"
```

#### Custom Configuration Example

```json
{
  "srebuddy.mcpServers": [
    {
      "name": "custom-docs",
      "type": "remote",
      "url": "https://docs.internal.company.com/mcp",
      "apiKey": "your-api-key-here"
    },
    {
      "name": "local-filesystem",
      "type": "local",
      "command": "npx",
      "args": ["@modelcontextprotocol/server-filesystem", "/path/to/docs"]
    }
  ],
  "srebuddy.enableLogging": true
}
```

See [MCP_CONFIGURATION.md](./MCP_CONFIGURATION.md) for detailed setup instructions.

### Available Settings

- `srebuddy.mcpServers`: Array of MCP server configurations for accessing documentation
- `srebuddy.enableLogging`: Enable detailed logging for debugging (default: false)
- `srebuddy.agentMode`: Enable Agent mode commands in Command Palette (default: true)

## 🔧 Development

### Prerequisites

- VS Code 1.101.0 or later
- Node.js 20.x or later
- TypeScript 5.8.3 or later
- Git

### Setup Instructions

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/srebuddy-extension.git
   cd srebuddy-extension
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Development workflow**

   ```bash
   npm run compile          # Compile TypeScript and bundle with esbuild
   npm run watch           # Watch mode for development
   npm run test            # Run tests
   npm run lint            # Run ESLint
   npm run check-types     # Type checking
   ```

4. **Launch extension for testing**

   - Press `F5` to launch in Extension Development Host
   - Or run: `code --extensionDevelopmentPath=.`

5. **Package for distribution**
   ```bash
   npm run vsce:package    # Creates .vsix file
   ```

### Project Structure

```
srebuddy-extension/
├── .github/
│   └── copilot-instructions.md    # SRE prompt templates
├── .vscode/
│   └── extensions.json            # Recommended extensions
├── src/
│   ├── extension.ts               # Main extension entry point
│   ├── chatParticipant.ts         # Chat participant handler
│   ├── mcpServerManager.ts        # MCP server management
│   ├── srePromptLoader.ts         # Dynamic prompt loading
│   ├── sreTaskParser.ts           # Task parsing logic
│   ├── agentHandler.ts            # Agent mode commands
│   └── logger.ts                  # Logging utilities
├── dist/                          # Compiled output
├── package.json                   # Extension manifest
├── tsconfig.json                  # TypeScript configuration
├── eslint.config.mjs              # ESLint configuration
├── esbuild.js                     # Build configuration
├── MCP_CONFIGURATION.md           # MCP setup guide
└── README.md                      # This file
```

### Key Files

- **`.github/copilot-instructions.md`**: Contains all SRE prompt templates that are dynamically loaded
- **`src/chatParticipant.ts`**: Main chat handler, integrates prompts with MCP documentation
- **`src/mcpServerManager.ts`**: Manages both local (npx) and remote MCP servers
- **`package.json`**: Extension configuration with default MCP servers

## 🏗️ Architecture

### Core Components

- **SreBuddyChatParticipant**: Main chat interface handler that processes user requests
- **SrePromptLoader**: Dynamically loads SRE prompt templates from `.github/copilot-instructions.md`
- **McpServerManager**: Manages connections to both local (npx) and remote MCP servers
- **SreTaskParser**: Parses natural language input into structured SRE tasks
- **SreBuddyAgentHandler**: Handles agent mode commands via Command Palette
- **Logger**: Structured logging with configurable output levels

### How It Works

1. **User Input**: User types `@srebuddy [command] [description]` in Copilot Chat
2. **Task Parsing**: `SreTaskParser` extracts command, target, environment, and risk level
3. **Prompt Loading**: `SrePromptLoader` finds the best matching prompt template from `.github/copilot-instructions.md`
4. **Documentation Retrieval**: `McpServerManager` searches configured MCP servers for relevant documentation
5. **LLM Integration**: Combined prompt template + MCP documentation sent to LLM via Copilot
6. **Response**: LLM generates comprehensive SRE guidance based on templates and documentation

### Supported Tools & Technologies

- **Monitoring**: Dynatrace, Datadog, Prometheus, Grafana, New Relic, Elastic APM
- **Orchestration**: Kubernetes, Docker, Docker Swarm
- **Infrastructure**: Terraform, Ansible, CloudFormation, Pulumi
- **Web Services**: Nginx, Apache, Load Balancers
- **Databases**: Redis, Elasticsearch, MySQL, PostgreSQL
- **CI/CD**: Jenkins, GitLab CI, GitHub Actions
- **Cloud Platforms**: AWS, Azure, GCP

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Add JSDoc comments for public APIs
- Write tests for new functionality
- Update documentation for new features
- Use conventional commit messages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Known Issues

- MCP server connections require proper network access and authentication
- Some complex deployment scenarios may require manual refinement
- Documentation search quality depends on MCP server implementation
- Local MCP servers require `npx` and proper package availability

## 📋 Release Notes

### 0.1.0

Initial release featuring:

- GitHub Copilot Chat integration with `@srebuddy` participant
- Dynamic SRE prompt templates from `.github/copilot-instructions.md`
- Support for both local (npx) and remote MCP servers
- Pre-configured filesystem, GitHub, and Brave Search MCP servers
- Comprehensive SRE command support (implement, configure, monitor, deploy, troubleshoot)
- Automatic workspace setup with prompt templates
- Agent mode commands via Command Palette

## 📚 Additional Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [GitHub Copilot Extensions](https://code.visualstudio.com/docs/copilot/copilot-chat)
- [Model Context Protocol](https://github.com/modelcontextprotocol)
- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
