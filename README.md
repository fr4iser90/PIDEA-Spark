# 🚀 PIDEA-Spark - AI-Powered Workflow Automation

**PIDEA-Spark** is an intelligent automation system that uses AI to create, plan, and execute workflows with templates on projects through Cursor IDE integration.

## 🎯 Current Status

### **Available Workflows:**
- ✅ **Execution Workflow** - Task execution and implementation
- ✅ **Planning Workflow** - Project planning and task generation
- ❌ **Debugging Workflow** - Issue resolution *(empty)*
- ❌ **Testing Workflow** - Quality assurance *(empty)*
- ❌ **Analyzation Workflow** - Code analysis *(empty)*

### **Available Templates:**
- ✅ **Game Development** - Complete template with 105 tasks
- ❌ **Web Application** - Template structure missing
- ❌ **Backend API** - Template missing
- ❌ **Mobile App** - Template missing
- ❌ **Desktop App** - Template missing

### **Run Full Workflows with Templates:**
- ✅ **Game Development** - From idea via planning/execution to testing/documentation/deploy
- ❌ **Web Application** - Template and workflow missing
- ❌ **Backend API** - Template and workflow missing
- ❌ **Mobile App** - Template and workflow missing

## 🎮 What is PIDEA-Spark?

PIDEA-Spark automates the entire development workflow:

- **🎯 Project Planning**: Converts ideas into structured development plans
- **🤖 AI-Powered Task Generation**: Creates detailed task breakdowns using AI
- **🚀 Automated Execution**: Executes tasks through Cursor IDE integration
- **📊 Progress Tracking**: Monitors and reports on project progress
- **🔄 Multi-Agent Support**: Run multiple projects simultaneously

## 🏗️ Architecture

```
PIDEA-Spark
├── 🎮 Game Ideas → AI Analysis → Project Structure
├── 📋 Task Templates → AI Customization → Detailed Tasks  
├── 🤖 Cursor IDE Integration → CDP Automation → Task Execution
├── 📊 Progress Tracking → Status Reports → Completion
└── 🔄 Multi-Agent System → Parallel Development
```

## 🚀 Quick Start

### 1. Prerequisites

- **Node.js** (v18 or higher)
- **Cursor IDE** (for automation) with Remote CDP port up + Unsandboxed (Linux)
- **Git** (for version control)

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/fr4iser90/PIDEA-Spark.git
cd PIDEA-Spark

# Install dependencies
npm install
node pidea-spark.js
```

### 3. Start Cursor IDE

```bash
# Linux/macOS
./start_ide_example.sh start

# Windows PowerShell
.\start_ide_example.ps1 start

# Windows Batch
start_ide_example.bat start
```

### 4. Run PIDEA-Spark

```bash
# Start the main application
node pidea-spark.js
```

## 🎯 Features

### **Project Planning**
- Convert game ideas into structured projects
- AI-powered task breakdown and customization
- Template-based project structure generation
- Dependency management and task ordering

### **AI Integration**
- Direct integration with Cursor IDE's AI
- Automated task execution through CDP
- Intelligent task customization based on project type
- Progress tracking and status updates

### **Multi-Agent System**
- Run multiple projects simultaneously
- Workspace isolation for parallel development
- Agent detection and management
- Resource optimization and conflict prevention

### **Development Workflows**
- **Planning Workflow**: Create new projects
- **Execution Workflow**: Run existing project tasks
- **Debugging Workflow**: Analyze and fix issues *(coming soon)*
- **Testing Workflow**: Automated testing and validation *(coming soon)*

## 📁 Project Structure

```
PIDEA-Spark/
├── automation/
│   ├── ai/                 # AI prompts and processing
│   │   ├── prompts/
│   │   │   ├── gaming/     # ✅ Game development prompts
│   │   │   ├── webapps/    # ⚠️  Partial webapp prompts
│   │   │   ├── shared/     # ✅ Shared prompts
│   │   │   └── debugging/  # ❌ Missing prompts
│   ├── core/              # Core system components
│   ├── file-operations/   # File and flag detection
│   ├── git-operations/    # Git integration
│   ├── ide/              # Cursor IDE integration
│   ├── managers/         # Task and workflow managers
│   ├── templates/        # Project templates
│   │   └── games/        # ✅ Complete game template
│   ├── ui/              # User interface components
│   ├── utils/           # Utility functions
│   └── workflows/       # Main workflow implementations
│       ├── planning-workflow.js      # ✅ Complete
│       ├── execution-workflow.js     # ✅ Complete
│       ├── testing-workflow.js       # ❌ Empty
│       ├── debugging-workflow.js     # ❌ Empty
│       └── analyzation-workflow.js   # ❌ Empty
├── pidea-spark-output/   # Generated projects
├── pidea-spark.js       # Main application entry point
└── README.md           # This file
```

## 🎮 Usage Examples

### Create a New Game Project

```bash
# Start PIDEA-Spark
node pidea-spark.js

# Select: Planning Workflow → Create New Game Project
# Enter your game idea: "A 2D platformer with puzzle elements"
# AI will generate a complete project structure with 105 tasks
```

### Convert Idea to Project

```bash
# Select: Planning Workflow → Convert Idea to Project
# Choose from available ideas
# AI will analyze and create a structured project
```

### Execute Project Tasks

```bash
# Select: Execute Workflow → Execute All Tasks
# AI will process tasks through Cursor IDE
# Monitor progress in real-time
```

## 🔧 Configuration

### Cursor IDE Setup

1. **Download Cursor IDE** from https://cursor.sh
2. **Configure paths** in `automation/ide/ide-config.local.env`
3. **Start Cursor** with CDP enabled on port 9222

### Environment Variables

```bash
# Optional: Set custom paths
export PIDEA_PROJECT_ROOT="/path/to/projects"
export PIDEA_TEMPLATE_DIR="/path/to/templates"
export PIDEA_CDP_PORT=9222
```

## 📊 Multi-Agent System

PIDEA-Spark supports running multiple agents simultaneously:

```
🎮 PIDEA-Spark Multi-Agent Dashboard
====================================

🤖 Agent 1 (Port 9222):
   📁 Workspace: /home/user/Documents/Git/project1
   🎮 Project: platformer-game
   ⏱️  Runtime: 2h 15m
   📊 Status: AI processing task 45/105

🤖 Agent 2 (Port 9223):
   📁 Workspace: /home/user/Documents/Git/project2
   🎮 Project: puzzle-game
   ⏱️  Runtime: 1h 30m
   📊 Status: Planning phase
```

### Agent Management

- **Automatic Port Discovery**: Finds available ports (9222-9230)
- **Workspace Isolation**: Each agent works in separate workspace
- **Resource Management**: Prevents conflicts and optimizes resources
- **Health Monitoring**: Tracks agent status and performance

## 🐛 Troubleshooting

### Common Issues

**Cursor IDE not found:**
```bash
# Check Cursor installation
ls -la Cursor-1.2.2-x86_64.AppImage

# Update path in configuration
nano automation/ide/ide-config.local.env
```

**Port already in use:**
```bash
# Check port usage
netstat -tuln | grep :9222

# Stop existing Cursor
./automation/ide/start_ide_example.sh stop

# Start fresh
./automation/ide/start_ide_example.sh start
```

**AI not responding:**
```bash
# Check CDP connection
curl http://localhost:9222/json/version

# Restart Cursor IDE
./automation/ide/start_ide_example.sh restart
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=* node pidea-spark.js

# Check specific component
DEBUG=pidea-spark:ai node pidea-spark.js
```

## 📋 TODO: Missing Components

### **Templates to Implement:**

#### **1. Web Application Template** 🚧
- [ ] Create `automation/templates/webapps/` directory
- [ ] Add task structure (frontend, backend, deployment)
- [ ] Create AI prompts for webapp development
- [ ] Add webapp-specific task categories

#### **2. Backend API Template** 📋
- [ ] Create `automation/templates/backend/` directory
- [ ] Add API development task structure
- [ ] Create backend-specific AI prompts
- [ ] Add database, authentication, testing tasks

#### **3. Mobile App Template** 📱
- [ ] Create `automation/templates/mobile/` directory
- [ ] Add React Native/Flutter task structure
- [ ] Create mobile-specific AI prompts
- [ ] Add platform-specific tasks (iOS/Android)

#### **4. Desktop App Template** 💻
- [ ] Create `automation/templates/desktop/` directory
- [ ] Add Electron/Tauri task structure
- [ ] Create desktop-specific AI prompts
- [ ] Add packaging and distribution tasks

### **Workflows to Implement:**

#### **1. Testing Workflow** 🧪
- [ ] Implement `automation/workflows/testing-workflow.js`
- [ ] Add unit test generation
- [ ] Add integration test setup
- [ ] Add E2E test automation
- [ ] Add coverage reporting

#### **2. Debugging Workflow** 🐛
- [ ] Implement `automation/workflows/debugging-workflow.js`
- [ ] Add error analysis and categorization
- [ ] Add bug reproduction and isolation
- [ ] Add fix generation and validation
- [ ] Add root cause analysis

#### **3. Analyzation Workflow** 📊
- [ ] Implement `automation/workflows/analyzation-workflow.js`
- [ ] Add code quality assessment
- [ ] Add architecture review
- [ ] Add performance analysis
- [ ] Add security audit

### **AI Prompts to Add:**

#### **1. Backend Prompts** 🔧
- [ ] Create `automation/ai/prompts/backend/` directory
- [ ] Add backend planning prompts
- [ ] Add API design prompts
- [ ] Add database schema prompts

#### **2. Mobile Prompts** 📱
- [ ] Create `automation/ai/prompts/mobile/` directory
- [ ] Add mobile app planning prompts
- [ ] Add platform-specific prompts
- [ ] Add UI/UX prompts

#### **3. Testing Prompts** 🧪
- [ ] Create `automation/ai/prompts/testing/` directory
- [ ] Add test generation prompts
- [ ] Add test planning prompts
- [ ] Add quality assurance prompts

## 🔄 Development

### Adding New Templates

1. Create template in `automation/templates/[type]/`
2. Add task structure and AI prompts
3. Update template registry
4. Test with new project creation

### Extending AI Prompts

1. Modify prompts in `automation/ai/prompts/[type]/`
2. Add new prompt types as needed
3. Update response processing
4. Test with AI integration

### Custom Workflows

1. Create workflow in `automation/workflows/`
2. Implement workflow interface
3. Add to menu system
4. Test integration

## 📈 Roadmap

### Phase 1: Core Features ✅
- [x] Basic project planning
- [x] AI integration
- [x] Task execution
- [x] Progress tracking
- [x] Game development template

### Phase 2: Additional Templates 🚧
- [ ] Web application template
- [ ] Backend API template
- [ ] Mobile app template
- [ ] Desktop app template

### Phase 3: Advanced Workflows 📋
- [ ] Testing workflow
- [ ] Debugging workflow
- [ ] Analyzation workflow
- [ ] Documentation workflow

### Phase 4: Multi-Agent System 🔄
- [ ] Agent detection and management
- [ ] Port auto-discovery
- [ ] Workspace isolation
- [ ] Agent coordination

### Phase 5: Ecosystem 📊
- [ ] Plugin system
- [ ] Template marketplace
- [ ] Community features
- [ ] Enterprise features

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

### Development Setup

```bash
# Clone and setup
git clone https://github.com/fr4iser90/PIDEA-Spark.git
cd PIDEA-Spark
npm install

node pidea-spark.js
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Cursor IDE** for the amazing AI-powered development environment
- **Chrome DevTools Protocol** for enabling automation
- **Node.js** community for the excellent ecosystem
- **OpenAI** for inspiring AI integration

---

**Happy Development with PIDEA-Spark! 🚀💻**
