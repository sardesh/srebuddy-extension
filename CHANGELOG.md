# Changelog

All notable changes to the SreBuddy extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-06-29

### Added

#### Core Features
- GitHub Copilot Chat integration with `@srebuddy` participant
- Dynamic SRE prompt templates loaded from `.github/copilot-instructions.md`
- Support for five main SRE commands: implement, configure, monitor, deploy, troubleshoot
- Natural language task parsing with automatic target, environment, and risk level detection
- Comprehensive MCP (Model Context Protocol) server support

#### MCP Server Integration
- Support for both local (npx-based) and remote (HTTP-based) MCP servers
- Pre-configured default servers:
  - Filesystem server (`npx @modelcontextprotocol/server-filesystem`)
  - GitHub server (`npx @modelcontextprotocol/server-github`)
  - Brave Search server (`npx @modelcontextprotocol/server-brave-search`)
- Automatic MCP server process management with cleanup on deactivation
- Environment variable support for API keys and configuration

#### Workspace Integration
- Automatic creation of `.github/copilot-instructions.md` in each workspace
- Manual setup command: "SreBuddy: Setup Prompt Templates"
- Extension activation on startup for seamless workspace setup

#### Agent Mode
- Command Palette integration with dedicated SRE commands
- Interactive task execution via Command Palette

### Technical Details
- TypeScript implementation with strict type checking
- ESBuild bundling for optimized performance (~83KB)
- Comprehensive logging system with configurable output levels
- Compatible with VS Code 1.101.0+
- Support for SRE task automation with natural language processing
- MCP (Model Context Protocol) server integration for internal documentation access
- Comprehensive SRE task parser supporting multiple tools and technologies
- Smart implementation plan generation with step-by-step guides
- Support for the following SRE tools:
  - **Monitoring**: Dynatrace, Datadog, Prometheus, Grafana
  - **Orchestration**: Kubernetes, Docker
  - **Infrastructure**: Terraform, Ansible
  - **Web Services**: Nginx, Load Balancers
  - **Databases**: Redis, Elasticsearch
  - **CI/CD**: Jenkins, GitLab CI
- Risk assessment and rollback planning
- Configurable logging and debugging support
- Built-in commands: implement, configure, monitor, deploy, docs
- Environment detection (production, staging, development, testing)
- Code generation with syntax highlighting for multiple languages
- Follow-up suggestions for continued workflow
- Configuration UI for MCP server management
- Health checks for MCP server connectivity

### Features

- **Natural Language Processing**: Convert plain English descriptions into actionable SRE implementation plans
- **Multi-Environment Support**: Automatic detection and handling of different deployment environments
- **Code Generation**: Generate deployment manifests, configuration files, and scripts
- **Documentation Integration**: Search and retrieve relevant documentation from internal sources
- **Risk Management**: Assess implementation risks and provide rollback procedures
- **Validation Steps**: Include verification and testing steps for each implementation

### Technical Details

- Built with TypeScript for type safety and maintainability
- ESBuild integration for fast compilation and bundling
- Comprehensive error handling and logging
- Modular architecture with separation of concerns
- VS Code API integration following best practices
- Async/await patterns for optimal performance
