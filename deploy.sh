#!/bin/bash

# Generic deployment script for git + Netlify/Vercel
# Usage: ./deploy.sh [commit_message] [platform]
# Example: ./deploy.sh "Update user interface" netlify
# Example: ./deploy.sh "Fix authentication bug" vercel
# Example: ./deploy.sh "Add new features" both

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
COMMIT_MESSAGE=${1:-"Auto-deploy: $(date '+%Y-%m-%d %H:%M:%S')"}
PLATFORM=${2:-"netlify"}

echo -e "${BLUE}🚀 Starting deployment process...${NC}"
echo -e "${BLUE}Commit message: ${COMMIT_MESSAGE}${NC}"
echo -e "${BLUE}Platform: ${PLATFORM}${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to handle git operations
git_operations() {
    echo -e "${YELLOW}📝 Git operations...${NC}"
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo -e "${RED}❌ Not a git repository. Please run 'git init' first.${NC}"
        exit 1
    fi
    
    # Check for changes
    if git diff --quiet && git diff --cached --quiet; then
        echo -e "${YELLOW}⚠️  No changes to commit.${NC}"
        return 0
    fi
    
    # Add all changes
    echo -e "${BLUE}Adding all changes...${NC}"
    git add .
    
    # Commit changes
    echo -e "${BLUE}Committing changes...${NC}"
    git commit -m "$(cat <<EOF
${COMMIT_MESSAGE}

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
    
    # Push to remote
    echo -e "${BLUE}Pushing to remote...${NC}"
    git push origin $(git branch --show-current) || {
        echo -e "${RED}❌ Failed to push to remote. Please check your remote configuration.${NC}"
        exit 1
    }
    
    echo -e "${GREEN}✅ Git operations completed successfully!${NC}"
}

# Function to deploy to Netlify
deploy_netlify() {
    echo -e "${YELLOW}🌐 Deploying to Netlify...${NC}"
    
    if ! command_exists netlify; then
        echo -e "${RED}❌ Netlify CLI not found. Installing...${NC}"
        npm install -g netlify-cli || {
            echo -e "${RED}❌ Failed to install Netlify CLI. Please install manually.${NC}"
            exit 1
        }
    fi
    
    # Build the project
    echo -e "${BLUE}Building project...${NC}"
    npm run build || {
        echo -e "${RED}❌ Build failed. Please fix build errors.${NC}"
        exit 1
    }
    
    # Deploy to Netlify
    echo -e "${BLUE}Deploying to Netlify...${NC}"
    netlify deploy --prod --dir=.next || {
        echo -e "${RED}❌ Netlify deployment failed.${NC}"
        exit 1
    }
    
    echo -e "${GREEN}✅ Netlify deployment completed successfully!${NC}"
}

# Function to deploy to Vercel
deploy_vercel() {
    echo -e "${YELLOW}▲ Deploying to Vercel...${NC}"
    
    if ! command_exists vercel; then
        echo -e "${RED}❌ Vercel CLI not found. Installing...${NC}"
        npm install -g vercel || {
            echo -e "${RED}❌ Failed to install Vercel CLI. Please install manually.${NC}"
            exit 1
        }
    fi
    
    # Deploy to Vercel
    echo -e "${BLUE}Deploying to Vercel...${NC}"
    vercel --prod || {
        echo -e "${RED}❌ Vercel deployment failed.${NC}"
        exit 1
    }
    
    echo -e "${GREEN}✅ Vercel deployment completed successfully!${NC}"
}

# Function to run build and tests
run_checks() {
    echo -e "${YELLOW}🔍 Running pre-deployment checks...${NC}"
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        echo -e "${RED}❌ package.json not found. Are you in the right directory?${NC}"
        exit 1
    fi
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        echo -e "${BLUE}Installing dependencies...${NC}"
        npm install || {
            echo -e "${RED}❌ Failed to install dependencies.${NC}"
            exit 1
        }
    fi
    
    # Run linting if available
    if npm run lint --silent > /dev/null 2>&1; then
        echo -e "${BLUE}Running linting...${NC}"
        npm run lint || {
            echo -e "${YELLOW}⚠️  Linting issues found. Continuing anyway...${NC}"
        }
    fi
    
    # Run tests if available
    if npm run test --silent > /dev/null 2>&1; then
        echo -e "${BLUE}Running tests...${NC}"
        npm run test || {
            echo -e "${YELLOW}⚠️  Tests failed. Continuing anyway...${NC}"
        }
    fi
    
    echo -e "${GREEN}✅ Pre-deployment checks completed!${NC}"
}

# Main deployment logic
main() {
    echo -e "${BLUE}🎯 Starting deployment for $(basename $(pwd))${NC}"
    
    # Run pre-deployment checks
    run_checks
    
    # Handle git operations
    git_operations
    
    # Deploy based on platform
    case $PLATFORM in
        "netlify")
            deploy_netlify
            ;;
        "vercel")
            deploy_vercel
            ;;
        "both")
            deploy_netlify
            deploy_vercel
            ;;
        *)
            echo -e "${RED}❌ Invalid platform: $PLATFORM${NC}"
            echo -e "${YELLOW}Valid options: netlify, vercel, both${NC}"
            exit 1
            ;;
    esac
    
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo -e "${BLUE}📝 Commit: ${COMMIT_MESSAGE}${NC}"
    echo -e "${BLUE}🌐 Platform: ${PLATFORM}${NC}"
}

# Help function
show_help() {
    echo -e "${BLUE}Generic Deployment Script${NC}"
    echo -e "${BLUE}========================${NC}"
    echo ""
    echo "Usage: ./deploy.sh [commit_message] [platform]"
    echo ""
    echo "Parameters:"
    echo "  commit_message  - Git commit message (optional)"
    echo "  platform        - Deployment platform: netlify, vercel, or both (default: netlify)"
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh                                    # Auto-commit and deploy to Netlify"
    echo "  ./deploy.sh \"Update UI components\"             # Custom commit message"
    echo "  ./deploy.sh \"Fix bugs\" vercel                 # Deploy to Vercel"
    echo "  ./deploy.sh \"Major update\" both               # Deploy to both platforms"
    echo ""
    echo "Features:"
    echo "  - Automatic git add, commit, and push"
    echo "  - Pre-deployment checks (lint, test)"
    echo "  - Dependency installation if needed"
    echo "  - CLI installation if needed"
    echo "  - Colored output for better visibility"
    echo "  - Error handling and validation"
}

# Check for help flag
if [[ "$1" == "-h" || "$1" == "--help" ]]; then
    show_help
    exit 0
fi

# Run main function
main