# Outsmart

> Your intelligent companion for productivity, innovation, and staying ahead of the curve.

## 🚀 Project Overview

Outsmart is a modern, cross-platform application built with cutting-edge technologies to provide an intelligent and intuitive user experience across web, mobile, and desktop platforms.

### Architecture

```
outsmart/
├── apps/
│   ├── mobile/             # Ionic + Capacitor + React (iOS, Android, Web)
│   ├── client/             # React Web Application (Landing Page)
│   └── server/             # Node.js Backend API
├── data/
│   ├── catalogue/          # Python Scripts + Ollama AI Integration
│   └── assets/             # Shared Assets (Images, Audio, Video)
└── packages/               # Shared Libraries (Future)
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Mobile**: Ionic React 8+ with Capacitor 6+
- **Styling**: Tailwind CSS 3+ with modern design system
- **Build Tool**: Vite 6+ for fast development and optimized builds
- **State Management**: React Hooks + Context API
- **Routing**: React Router (v5 for mobile, v6 for web)

### Backend
- **Runtime**: Node.js with TypeScript
- **Build Tool**: ESBuild for fast compilation
- **API**: RESTful APIs with potential GraphQL integration

### AI & Data Processing
- **AI Integration**: Ollama for local AI processing
- **Data Processing**: Python scripts with pandas, numpy
- **Validation**: TypeScript validation scripts
- **Formats**: Support for images, audio, video cataloguing

### DevOps & Tooling
- **Monorepo**: Nx workspace for efficient development
- **Package Manager**: npm with workspaces
- **Code Quality**: ESLint, Prettier, TypeScript strict mode
- **Testing**: Vitest for unit testing
- **CI/CD**: Ready for GitHub Actions integration

## 🏁 Quick Start

### Prerequisites

- Node.js 22+ (recommended via [nvm](https://github.com/nvm-sh/nvm))
- Python 3.8+ (for AI/data processing)
- Ollama (for AI features) - [Install Ollama](https://ollama.ai)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd outsmart
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Python environment (for AI features)**
   ```bash
   cd data/catalogue
   pip install -r requirements.txt
   cd ../..
   ```

4. **Install Ollama and pull models (optional)**
   ```bash
   ollama pull llama2
   ```

### Development

#### Start all applications
```bash
# Start the development servers
npm run dev
```

#### Individual applications

**Mobile App (Ionic + Capacitor)**
```bash
# Web development
npx nx serve mobile

# Build for production
npx nx build mobile

# Add mobile platforms
npx nx run mobile:cap:add:android
npx nx run mobile:cap:add:ios

# Run on device/emulator
npx nx run mobile:cap:run:android
npx nx run mobile:cap:run:ios
```

**Web Client**
```bash
# Development
npx nx serve client

# Build
npx nx build client
```

**Backend Server**
```bash
# Development
npx nx serve server

# Build
npx nx build server
```

**Data Catalogue**
```bash
# Python scripts
npx nx run catalogue:python:refresh
npx nx run catalogue:python:stats

# TypeScript validation
npx nx run catalogue:validate
```

## 📱 Mobile Development

The mobile application is built with Ionic React and Capacitor, providing native iOS and Android apps from a single codebase.

### Features
- **Cross-platform**: iOS, Android, and Progressive Web App
- **Native APIs**: Camera, geolocation, push notifications, haptics
- **Offline Support**: Local data caching and sync
- **Modern UI**: Tailwind CSS with Ionic components
- **Responsive Design**: Adapts to phones, tablets, and desktop

### Mobile-Specific Commands

```bash
# Check Capacitor setup and dependencies
npx nx run mobile:cap:doctor

# Sync web build with native projects (run after building)
npx nx run mobile:cap:sync

# Open in IDE
npx nx run mobile:cap:open:android  # Android Studio
npx nx run mobile:cap:open:ios      # Xcode

# Generate app icons and splash screens
npx nx run mobile:resources
```

### Supported Platforms
- **iOS**: 12.0+
- **Android**: API 22+ (Android 5.1+)
- **Web**: Modern browsers (Chrome 60+, Safari 12+, Firefox 63+, Edge 79+)

## 🤖 AI Integration

The project includes AI capabilities through Ollama integration for local AI processing.

### AI Features
- **Smart Cataloguing**: Automatic description generation for assets
- **Content Analysis**: Image, audio, and video metadata extraction
- **Natural Language Processing**: Query and interact with your data

### AI Setup

1. **Install Ollama**
   ```bash
   # macOS
   brew install ollama
   
   # Linux
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Windows
   # Download from https://ollama.ai/download
   ```

2. **Start Ollama service**
   ```bash
   ollama serve
   ```

3. **Pull AI models**
   ```bash
   ollama pull llama2
   ollama pull codellama  # For code-related tasks
   ```

4. **Test integration**
   ```bash
   npx nx run catalogue:python:test-ollama
   ```

## 📊 Data Management

The data catalogue system manages and processes various types of digital assets.

### Supported Asset Types
- **Images**: JPG, PNG, GIF, BMP, WebP
- **Audio**: MP3, WAV, FLAC, AAC, OGG
- **Video**: MP4, MOV, AVI, MKV, WebM

### Asset Management Commands
```bash
# Scan and catalogue assets
npx nx run catalogue:python:refresh

# View statistics
npx nx run catalogue:python:stats

# Validate catalogue data
npx nx run catalogue:validate
npx nx run catalogue:python:validate

# Generate AI descriptions
# (automatically included in refresh if Ollama is available)
```

## 🎨 Design System

The project uses a modern design system inspired by the Tailwind CSS Commit template.

### Design Principles
- **Utility-first**: Tailwind CSS for rapid development
- **Consistent**: Shared design tokens and components
- **Accessible**: WCAG 2.1 AA compliance
- **Responsive**: Mobile-first approach
- **Modern**: Glass morphism, smooth animations, and micro-interactions

### Color Palette
- **Primary**: Blue (500-600)
- **Secondary**: Green (500-600)
- **Accent**: Purple (500-600)
- **Neutrals**: Gray scale
- **Semantic**: Success (green), Warning (orange), Danger (red)

## 🧪 Testing

```bash
# Run all tests
npm test

# Test specific project
npx nx test mobile
npx nx test client
npx nx test server

# Test with coverage
npx nx test mobile --coverage
```

## 🚀 Building for Production

### Web Applications
```bash
# Build all web apps
npx nx build client
npx nx build server

# Build mobile for web
npx nx build mobile
```

### Mobile Applications
```bash
# Build for Android
npx nx run mobile:build:android

# Build for iOS
npx nx run mobile:build:ios
```

## 📦 Deployment

### Web Deployment
The web applications can be deployed to various platforms:
- **Vercel**: Automatic deployment from Git
- **Netlify**: Static site hosting
- **AWS S3**: Static hosting with CloudFront
- **Digital Ocean**: VPS deployment

### Mobile App Distribution
- **iOS**: App Store via Xcode and App Store Connect
- **Android**: Google Play Store via Android Studio
- **Progressive Web App**: Direct web deployment

### Environment Variables

Create `.env` files for different environments:

```bash
# .env.local
VITE_API_URL=http://localhost:3001
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama2

# .env.production
VITE_API_URL=https://api.outsmart.app
OLLAMA_HOST=https://ollama.outsmart.app
```

## 🔧 Configuration

### Nx Configuration
The project uses Nx for monorepo management. Key configurations:
- `nx.json`: Workspace configuration
- `project.json`: Individual project settings
- `tsconfig.base.json`: Shared TypeScript configuration

### Mobile Configuration
- `capacitor.config.ts`: Capacitor configuration
- `tailwind.config.js`: Tailwind CSS settings
- `vite.config.mts`: Vite build configuration

## 📚 Scripts Reference

### Global Scripts
```bash
npm run dev          # Start all development servers
npm run build        # Build all projects
npm run test         # Run all tests
npm run lint         # Lint all projects
npm run format       # Format code
```

### Project-Specific Scripts
```bash
# Mobile
npx nx serve mobile
npx nx build mobile
npx nx test mobile
npx nx run mobile:cap:sync

# Client
npx nx serve client
npx nx build client

# Server
npx nx serve server
npx nx build server

# Catalogue
npx nx run catalogue:python:refresh
npx nx run catalogue:validate
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** with proper commit messages
4. **Run tests**: `npm test`
5. **Submit a pull request**

### Code Style
- Use TypeScript for all new code
- Follow the existing code style (Prettier + ESLint)
- Write tests for new features
- Update documentation as needed

### Commit Convention
```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: test changes
chore: maintenance tasks
```

## 🐛 Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clear Nx cache
npx nx reset

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Mobile Development Issues**
```bash
# Check Capacitor setup
npx nx run mobile:cap:doctor

# Reinstall Capacitor if needed
npm uninstall @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios

# Clean and rebuild
npx nx build mobile
npx nx run mobile:cap:sync
```

**Python/AI Issues**
```bash
# Reinstall Python dependencies
cd data/catalogue
pip install -r requirements.txt --force-reinstall

# Test Ollama connection
ollama list
npx nx run catalogue:python:test-ollama
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Ionic Team**: For the amazing mobile framework
- **Tailwind CSS**: For the utility-first CSS framework
- **Nx Team**: For the powerful monorepo tools
- **Ollama**: For local AI capabilities
- **Capacitor**: For native mobile bridge

## 📞 Support

- **Documentation**: [Wiki](https://github.com/outsmart/wiki)
- **Issues**: [GitHub Issues](https://github.com/outsmart/issues)
- **Discussions**: [GitHub Discussions](https://github.com/outsmart/discussions)
- **Email**: hello@outsmart.app

---

**Made with ❤️ by the Outsmart Team**

Built for developers, by developers. Privacy-first, open-source, and designed for the future.