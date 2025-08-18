#!/bin/bash
# GitHub Branch Protection Setup for Modern CI/CD
# This script configures branch protection rules for the main branch

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔒 Setting up GitHub Branch Protection Rules${NC}"

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed${NC}"
    echo -e "${YELLOW}💡 Install with: brew install gh${NC}"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}🔐 GitHub CLI authentication required${NC}"
    gh auth login
fi

# Get repository information
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo -e "${BLUE}📁 Repository: ${REPO}${NC}"

# Configure main branch protection
echo -e "${YELLOW}🛡️  Configuring main branch protection...${NC}"

gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "/repos/${REPO}/branches/main/protection" \
  -f required_status_checks='{"strict":true,"contexts":["quality-gate","integration-tests","mobile-builds","e2e-tests"]}' \
  -f enforce_admins=true \
  -f required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true,"require_code_owner_reviews":true,"require_last_push_approval":false}' \
  -f restrictions=null \
  -f allow_force_pushes=false \
  -f allow_deletions=false \
  -f block_creations=false \
  -f required_conversation_resolution=true \
  -f lock_branch=false \
  -f allow_fork_syncing=true

echo -e "${GREEN}✅ Main branch protection configured successfully!${NC}"

# Configure repository settings for optimal CI/CD
echo -e "${YELLOW}⚙️  Configuring repository settings...${NC}"

# Enable auto-merge for PRs
gh api \
  --method PATCH \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "/repos/${REPO}" \
  -f allow_auto_merge=true \
  -f allow_merge_commit=false \
  -f allow_squash_merge=true \
  -f allow_rebase_merge=false \
  -f delete_branch_on_merge=true \
  -f allow_update_branch=true

echo -e "${GREEN}✅ Repository settings configured!${NC}"

# Display protection summary
echo -e "\n${BLUE}📋 Branch Protection Summary:${NC}"
echo -e "  🔐 Required status checks: quality-gate, integration-tests, mobile-builds, e2e-tests"
echo -e "  👥 Required reviews: 1 approving review"
echo -e "  🔄 Dismiss stale reviews: enabled"
echo -e "  👑 Require code owner reviews: enabled"
echo -e "  🚫 Restrict pushes: admin enforcement enabled"
echo -e "  💬 Require conversation resolution: enabled"
echo -e "  🔀 Auto-merge: enabled (squash only)"
echo -e "  🗑️  Delete branch on merge: enabled"

echo -e "\n${GREEN}🎉 Modern CI/CD branch protection setup complete!${NC}"
echo -e "${YELLOW}💡 Next steps:${NC}"
echo -e "  1. Configure repository secrets for CI/CD"
echo -e "  2. Set up Firebase, Apple, and Google Play credentials"
echo -e "  3. Configure Slack webhook for notifications"
echo -e "  4. Create your first feature branch and PR"
