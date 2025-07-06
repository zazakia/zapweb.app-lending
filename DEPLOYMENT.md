# Deployment Guide

This project includes multiple deployment options for quick git commits and deployments to Netlify or Vercel.

## 🚀 Quick Deployment Options

### Option 1: Bash Script (Recommended)
```bash
# Make script executable (one-time setup)
chmod +x deploy.sh

# Deploy with auto-generated commit message to Netlify
./deploy.sh

# Deploy with custom commit message
./deploy.sh "Update user interface"

# Deploy to Vercel
./deploy.sh "Fix authentication bug" vercel

# Deploy to both platforms
./deploy.sh "Add new features" both
```

### Option 2: NPM Scripts
```bash
# Deploy to Netlify (default)
npm run deploy

# Deploy to Netlify specifically
npm run deploy:netlify

# Deploy to Vercel
npm run deploy:vercel
```

## 📋 What Each Method Does

1. **Pre-deployment checks**
   - Installs dependencies if needed
   - Runs linting (if available)
   - Runs tests (if available)

2. **Git operations**
   - Adds all changes (`git add .`)
   - Commits with provided or auto-generated message
   - Pushes to remote repository

3. **Build and deploy**
   - Builds the Next.js application
   - Deploys to selected platform(s)
   - Installs CLI tools if needed

## 🛠️ Script Features

- ✅ **Error handling** - Stops on any error
- ✅ **Colored output** - Easy to read status messages
- ✅ **Dependency checking** - Installs missing tools
- ✅ **Platform flexibility** - Supports Netlify, Vercel, or both
- ✅ **Git validation** - Checks for repository and changes
- ✅ **Build validation** - Ensures successful build before deploy

## 📖 Usage Examples

```bash
# Quick deploy with auto-commit
./deploy.sh

# Deploy with descriptive commit message
./deploy.sh "Implement user authentication system"

# Deploy to Vercel instead of Netlify
./deploy.sh "Fix responsive design issues" vercel

# Deploy to both platforms
./deploy.sh "Major feature update" both

# Get help
./deploy.sh --help
```

## 🔧 Environment Setup

### For Netlify
- Netlify CLI will be installed automatically
- Login required: `netlify login`
- Site linking: `netlify link` or `netlify init`

### For Vercel
- Vercel CLI will be installed automatically
- Login required: `vercel login`
- Project setup: `vercel` (first time)

## 🎯 Platform-Specific Notes

### Netlify
- Builds and deploys from `.next` directory
- Supports Next.js runtime automatically
- Environment variables set via Netlify dashboard or CLI

### Vercel
- Optimized for Next.js applications
- Zero-config deployment
- Environment variables managed via Vercel dashboard

## 🚨 Troubleshooting

### Common Issues

1. **Git not initialized**
   ```bash
   git init
   git remote add origin <your-repo-url>
   ```

2. **No changes to commit**
   - The script will skip commit if no changes detected
   - Still proceeds with deployment

3. **Build failures**
   - Fix TypeScript/ESLint errors
   - Check dependencies and versions

4. **CLI tool not found**
   - Script automatically installs missing tools
   - Manual install: `npm install -g netlify-cli` or `npm install -g vercel`

### Debug Mode
Add `set -x` to the script for verbose output:
```bash
# Edit deploy.sh and add this line after #!/bin/bash
set -x
```

## 🔐 Security Notes

- Environment variables are managed separately on each platform
- Sensitive keys should never be committed to git
- Use platform-specific environment variable management

## 📝 Customization

You can modify the deployment script to:
- Add custom build commands
- Include additional testing
- Add notification webhooks
- Implement blue-green deployments
- Add database migrations

## 🎉 Success Indicators

When deployment succeeds, you'll see:
- ✅ Git operations completed
- ✅ Build successful
- ✅ Deployment successful
- 🌐 Live URL provided

The script provides colored output to make it easy to track progress and identify any issues.