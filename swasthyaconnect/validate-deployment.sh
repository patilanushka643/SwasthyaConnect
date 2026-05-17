#!/bin/bash

# SwasthyaConnect Pre-Deployment Configuration Validator
# This script validates all configuration files and environment setup
# Run before deploying to Render

set -e

echo "=========================================="
echo "  SwasthyaConnect Pre-Deployment Check"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check status
check() {
  local name=$1
  local condition=$2
  
  if eval "$condition"; then
    echo -e "${GREEN}✓${NC} $name"
    return 0
  else
    echo -e "${RED}✗${NC} $name"
    return 1
  fi
}

# Function to warn
warn() {
  echo -e "${YELLOW}⚠${NC} $1"
}

# Counters
CHECKS_PASSED=0
CHECKS_FAILED=0

echo "📋 PHASE 1: Repository & Git Configuration"
echo "=========================================="
echo ""

# Check Git status
if check "Git repository initialized" "[ -d .git ]"; then
  ((CHECKS_PASSED++))
else
  ((CHECKS_FAILED++))
fi

# Check .gitignore exists
if check ".gitignore file exists" "[ -f .gitignore ]"; then
  ((CHECKS_PASSED++))
  
  # Check if .gitignore includes .env
  if grep -q "^\.env$" .gitignore; then
    echo -e "  ${GREEN}✓${NC} .env is ignored"
  else
    echo -e "  ${RED}✗${NC} .env is NOT in .gitignore - FIX REQUIRED"
    ((CHECKS_FAILED++))
  fi
  
  # Check if .gitignore includes node_modules
  if grep -q "^node_modules" .gitignore; then
    echo -e "  ${GREEN}✓${NC} node_modules is ignored"
  else
    echo -e "  ${RED}✗${NC} node_modules is NOT in .gitignore - FIX REQUIRED"
    ((CHECKS_FAILED++))
  fi
else
  ((CHECKS_FAILED++))
fi

# Check for accidentally committed .env files
if ! git ls-files --error-unmatch .env > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} .env file not tracked in Git"
  ((CHECKS_PASSED++))
else
  echo -e "${RED}✗${NC} .env IS tracked in Git - REMOVE IMMEDIATELY"
  echo "  Run: git rm --cached .env"
  ((CHECKS_FAILED++))
fi

echo ""
echo "📋 PHASE 2: Backend Configuration"
echo "=================================="
echo ""

# Check backend directory
if check "Backend directory exists" "[ -d backend ]"; then
  ((CHECKS_PASSED++))
else
  ((CHECKS_FAILED++))
fi

# Check backend package.json
if check "backend/package.json exists" "[ -f backend/package.json ]"; then
  ((CHECKS_PASSED++))
else
  ((CHECKS_FAILED++))
fi

# Check backend .env.example
if check "backend/.env.example exists" "[ -f backend/.env.example ]"; then
  ((CHECKS_PASSED++))
  
  # Verify required variables in .env.example
  echo "  Checking required environment variables:"
  
  for var in "PORT" "NODE_ENV" "MONGO_URI" "JWT_SECRET" "CLIENT_URL"; do
    if grep -q "^$var=" backend/.env.example; then
      echo -e "    ${GREEN}✓${NC} $var defined"
    else
      echo -e "    ${RED}✗${NC} $var NOT defined - add to backend/.env.example"
      ((CHECKS_FAILED++))
    fi
  done
else
  ((CHECKS_FAILED++))
fi

# Check server.js for dynamic port binding
if [ -f backend/server.js ]; then
  if grep -q "process.env.PORT" backend/server.js; then
    echo -e "${GREEN}✓${NC} server.js uses dynamic PORT from environment"
    ((CHECKS_PASSED++))
  else
    echo -e "${RED}✗${NC} server.js doesn't use process.env.PORT"
    ((CHECKS_FAILED++))
  fi
  
  if grep -q "0.0.0.0" backend/server.js; then
    echo -e "${GREEN}✓${NC} server.js listens on 0.0.0.0 (all interfaces)"
    ((CHECKS_PASSED++))
  else
    warn "server.js should listen on 0.0.0.0 for cloud deployment"
  fi
else
  echo -e "${RED}✗${NC} backend/server.js not found"
  ((CHECKS_FAILED++))
fi

echo ""
echo "📋 PHASE 3: Frontend Configuration"
echo "===================================="
echo ""

# Check frontend directory
if check "Frontend directory exists" "[ -d frontend ]"; then
  ((CHECKS_PASSED++))
else
  ((CHECKS_FAILED++))
fi

# Check frontend package.json
if check "frontend/package.json exists" "[ -f frontend/package.json ]"; then
  ((CHECKS_PASSED++))
else
  ((CHECKS_FAILED++))
fi

# Check frontend .env.example
if check "frontend/.env.example exists" "[ -f frontend/.env.example ]"; then
  ((CHECKS_PASSED++))
  
  echo "  Checking required environment variables:"
  
  for var in "VITE_API_URL" "VITE_SOCKET_URL"; do
    if grep -q "^$var=" frontend/.env.example; then
      echo -e "    ${GREEN}✓${NC} $var defined"
    else
      echo -e "    ${RED}✗${NC} $var NOT defined - add to frontend/.env.example"
      ((CHECKS_FAILED++))
    fi
  done
else
  ((CHECKS_FAILED++))
fi

# Check AuthContext for environment-aware URL detection
if [ -f frontend/src/context/AuthContext.jsx ]; then
  if grep -q "VITE_API_URL" frontend/src/context/AuthContext.jsx; then
    echo -e "${GREEN}✓${NC} frontend/src/context/AuthContext.jsx uses VITE_API_URL"
    ((CHECKS_PASSED++))
  else
    echo -e "${RED}✗${NC} frontend/src/context/AuthContext.jsx doesn't use VITE_API_URL"
    ((CHECKS_FAILED++))
  fi
  
  if grep -q "getAPIBaseURL" frontend/src/context/AuthContext.jsx; then
    echo -e "${GREEN}✓${NC} frontend uses dynamic API base URL detection"
    ((CHECKS_PASSED++))
  else
    warn "frontend should use getAPIBaseURL() for environment detection"
  fi
else
  echo -e "${RED}✗${NC} frontend/src/context/AuthContext.jsx not found"
  ((CHECKS_FAILED++))
fi

echo ""
echo "📋 PHASE 4: Node.js & Dependencies"
echo "==================================="
echo ""

# Check Node.js version
if command -v node > /dev/null; then
  NODE_VERSION=$(node -v)
  echo -e "${GREEN}✓${NC} Node.js installed: $NODE_VERSION"
  ((CHECKS_PASSED++))
  
  # Check if Node version is 18+
  MAJOR_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
  if [ "$MAJOR_VERSION" -ge 18 ]; then
    echo -e "  ${GREEN}✓${NC} Node.js version 18+ (required)"
  else
    echo -e "  ${RED}✗${NC} Node.js version < 18 (upgrade required)"
    ((CHECKS_FAILED++))
  fi
else
  echo -e "${RED}✗${NC} Node.js not installed"
  ((CHECKS_FAILED++))
fi

# Check npm
if command -v npm > /dev/null; then
  NPM_VERSION=$(npm -v)
  echo -e "${GREEN}✓${NC} npm installed: $NPM_VERSION"
  ((CHECKS_PASSED++))
else
  echo -e "${RED}✗${NC} npm not installed"
  ((CHECKS_FAILED++))
fi

# Check backend node_modules
if [ -d backend/node_modules ]; then
  echo -e "${GREEN}✓${NC} backend/node_modules exists"
  ((CHECKS_PASSED++))
else
  warn "backend/node_modules not found (run 'cd backend && npm install')"
fi

# Check frontend node_modules
if [ -d frontend/node_modules ]; then
  echo -e "${GREEN}✓${NC} frontend/node_modules exists"
  ((CHECKS_PASSED++))
else
  warn "frontend/node_modules not found (run 'cd frontend && npm install')"
fi

echo ""
echo "📋 PHASE 5: Environment Variables & Secrets"
echo "==========================================="
echo ""

# Check for hardcoded URLs in backend
if grep -r "http://localhost" backend/src backend/*.js 2>/dev/null | grep -v node_modules > /dev/null; then
  echo -e "${RED}✗${NC} Found hardcoded localhost URLs in backend"
  echo "  Replace with process.env.CLIENT_URL"
  ((CHECKS_FAILED++))
else
  echo -e "${GREEN}✓${NC} No hardcoded localhost URLs in backend"
  ((CHECKS_PASSED++))
fi

# Check for hardcoded URLs in frontend
if grep -r "http://localhost:5000" frontend/src 2>/dev/null | grep -v node_modules | grep -v ".env" > /dev/null; then
  echo -e "${RED}✗${NC} Found hardcoded localhost URLs in frontend source"
  echo "  Use environment variables (VITE_API_URL, VITE_SOCKET_URL)"
  ((CHECKS_FAILED++))
else
  echo -e "${GREEN}✓${NC} No hardcoded localhost URLs in frontend source"
  ((CHECKS_PASSED++))
fi

# Check .env file is not committed
if [ -f backend/.env ] || [ -f frontend/.env ]; then
  echo -e "${RED}✗${NC} .env files found in working directory"
  warn "These should only exist locally, not in Git"
fi

echo ""
echo "📋 PHASE 6: Build Verification"
echo "==============================="
echo ""

# Check if backend can build
echo -n "Testing backend build... "
if [ -d backend ] && [ -f backend/package.json ]; then
  if (cd backend && npm list > /dev/null 2>&1); then
    echo -e "${GREEN}OK${NC}"
    ((CHECKS_PASSED++))
  else
    echo -e "${RED}FAILED${NC}"
    echo "  Run: cd backend && npm install"
    ((CHECKS_FAILED++))
  fi
fi

# Check if frontend can build
echo -n "Testing frontend build... "
if [ -d frontend ] && [ -f frontend/package.json ]; then
  if (cd frontend && npm list > /dev/null 2>&1); then
    echo -e "${GREEN}OK${NC}"
    ((CHECKS_PASSED++))
  else
    echo -e "${RED}FAILED${NC}"
    echo "  Run: cd frontend && npm install"
    ((CHECKS_FAILED++))
  fi
fi

echo ""
echo "=========================================="
echo "  Pre-Deployment Check Complete"
echo "=========================================="
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All checks passed!${NC}"
  echo ""
  echo "Your SwasthyaConnect project is ready for Render deployment."
  echo ""
  echo "Next steps:"
  echo "  1. Ensure Git repository is pushed to GitHub/GitLab"
  echo "  2. Create Render services (see RENDER_DEPLOYMENT_GUIDE.md)"
  echo "  3. Set environment variables in Render dashboard"
  echo "  4. Monitor deployment logs"
  echo ""
  exit 0
else
  echo -e "${RED}✗ $CHECKS_FAILED check(s) failed${NC}"
  echo ""
  echo "Please fix the issues above before deploying to Render."
  echo ""
  exit 1
fi
