# 🔄 Migration Guide: Develop Branch → Main Branch CI/CD

## **Migration Overview**
This guide helps transition from the **develop branch CI/CD** workflow to the modern **main branch** approach with automated beta testing and production releases.

---

## **🔀 Workflow Changes**

### **Before (Develop Branch Model)**
```
feature → develop → CI/CD → staging → main → production
```

### **After (Main Branch Model)**
```
feature → main → CI/CD → beta → production (via tags)
```

---

## **📋 Migration Checklist**

### **1. Repository Cleanup**
- [ ] **Archive develop branch**: `git branch -D develop`
- [ ] **Update default branch**: Set main as default in GitHub
- [ ] **Clean old workflows**: Remove `.github/workflows/develop-ci.yml`
- [ ] **Update documentation**: Replace develop references with main

### **2. Branch Protection Setup**
- [ ] **Run protection script**: `./scripts/setup-branch-protection.sh`
- [ ] **Configure required checks**: quality-gate, integration-tests, mobile-builds, e2e-tests
- [ ] **Set review requirements**: 1 approving review minimum
- [ ] **Enable auto-merge**: For streamlined PR workflow

### **3. CI/CD Configuration**
- [ ] **Repository secrets setup**:
  - `FIREBASE_ANDROID_APP_ID`: Firebase App Distribution
  - `FIREBASE_TOKEN`: Firebase CI token
  - `APP_STORE_CONNECT_API_KEY`: Apple App Store Connect
  - `GOOGLE_PLAY_SERVICE_ACCOUNT`: Google Play Console
  - `SLACK_WEBHOOK_URL`: Team notifications
- [ ] **Fastlane initialization**: `cd packages/app && fastlane init`
- [ ] **Test new pipeline**: Create test PR to validate workflow

### **4. Team Communication**
- [ ] **Update README**: New workflow documentation
- [ ] **Team training**: Brief team on new process
- [ ] **Update Git aliases**: Remove develop-specific shortcuts
- [ ] **IDE configurations**: Update default branches

---

## **🚀 New Development Workflow**

### **Feature Development**
```bash
# Old workflow
git checkout develop
git pull origin develop
git checkout -b feature/new-feature

# New workflow  
git checkout main
git pull origin main
git checkout -b feature/new-feature
```

### **Pull Request Process**
```bash
# Create feature
git checkout -b feature/user-profiles
git commit -m "feat: add user profile management"
git push -u origin feature/user-profiles

# Create PR (CI automatically runs)
gh pr create --title "Add user profiles" --body "Implements user profile CRUD operations"

# After review approval + CI pass → Auto-merge to main
# Main branch push → Automatic beta distribution
```

### **Release Process**
```bash
# Beta testing (automatic on main branch push)
git push origin main  # → Triggers beta distribution

# Production release (manual tag creation)
git tag v1.2.0
git push origin v1.2.0  # → Triggers production deployment
gh release create v1.2.0 --title "v1.2.0" --notes "Release notes"
```

---

## **🔧 Configuration Updates**

### **Update Local Git Configuration**
```bash
# Update default branch
git config init.defaultBranch main

# Update remote HEAD
git remote set-head origin main

# Clean up old tracking
git branch -d develop 2>/dev/null || true
git remote prune origin
```

### **Update IDE Settings**
- **VS Code**: Update workspace default branch settings
- **IntelliJ**: Configure VCS to use main as default
- **Git GUI tools**: Update default branch preferences

### **Update Scripts and Documentation**
```bash
# Update any scripts that reference develop
find . -name "*.sh" -exec sed -i '' 's/develop/main/g' {} \;
find . -name "*.md" -exec sed -i '' 's/develop branch/main branch/g' {} \;

# Update package.json deploy scripts
# (Already updated in package.json)
```

---

## **📊 Pipeline Comparison**

### **Old Develop Workflow**
```yaml
develop push → CI tests → Merge to main → Manual deployment
```
- ⏱️ **Feedback time**: Slow (develop → main → deploy)
- 🔄 **Release frequency**: Manual, infrequent
- 🧪 **Testing**: Limited beta testing
- 🚀 **Deployment**: Manual process

### **New Main Workflow**
```yaml
PR → CI tests → Main merge → Auto beta → Tagged release → Auto production
```
- ⏱️ **Feedback time**: Fast (immediate beta on merge)
- 🔄 **Release frequency**: Continuous beta, tagged production
- 🧪 **Testing**: Comprehensive E2E + automated beta testing
- 🚀 **Deployment**: Fully automated pipeline

---

## **🎯 Benefits of New Approach**

### **Development Velocity**
- ✅ **Faster feedback**: Immediate beta testing on main merge
- ✅ **Simplified workflow**: Single branch strategy
- ✅ **Reduced complexity**: No develop/main synchronization
- ✅ **Continuous deployment**: Automated beta distribution

### **Quality Assurance**  
- ✅ **Comprehensive testing**: Quality gate → Integration → E2E → Beta
- ✅ **Real user feedback**: Beta testing with every main branch change
- ✅ **Production confidence**: Thoroughly tested releases
- ✅ **Quick rollbacks**: Fast issue resolution

### **Team Productivity**
- ✅ **Clear process**: Simple feature → main → beta → production flow
- ✅ **Automated notifications**: Slack integration for team updates
- ✅ **Self-service releases**: Developers can trigger releases via tags
- ✅ **Reduced manual work**: Automated build and distribution

---

## **🚨 Common Migration Issues**

### **Issue 1: Old Develop References**
**Problem**: Scripts/docs still reference develop branch
**Solution**: 
```bash
# Find and replace all references
grep -r "develop" . --exclude-dir=node_modules --exclude-dir=.git
# Manual review and update each reference
```

### **Issue 2: Team Habits**
**Problem**: Team continues using old workflow
**Solution**: 
- Update team documentation
- Provide workflow training session
- Set up Git aliases for new process
- Remove develop branch to force new workflow

### **Issue 3: CI Secrets Missing**
**Problem**: New pipeline fails due to missing secrets
**Solution**:
```bash
# Check required secrets in GitHub repo settings
gh secret list
# Add missing secrets one by one
gh secret set FIREBASE_TOKEN
```

### **Issue 4: Fastlane Not Configured**
**Problem**: Mobile builds fail without Fastlane setup
**Solution**:
```bash
cd packages/app
gem install fastlane
fastlane init
# Follow Fastlane setup prompts
```

---

## **📚 Additional Resources**

### **Documentation Updates**
- [ ] **README.md**: Update with new workflow
- [ ] **CONTRIBUTING.md**: New contribution guidelines  
- [ ] **Onboarding docs**: Update for new developers
- [ ] **Release notes**: Communicate changes to stakeholders

### **Training Materials**
- [ ] **Team workshop**: New workflow walkthrough
- [ ] **Git commands cheat sheet**: Updated for main branch
- [ ] **CI/CD troubleshooting guide**: Common issues and solutions
- [ ] **Beta testing guide**: For QA and stakeholders

### **Monitoring Setup**
- [ ] **Pipeline metrics**: Track build success rates
- [ ] **Beta adoption**: Monitor beta app usage
- [ ] **Release velocity**: Measure deployment frequency
- [ ] **Quality metrics**: Track issue rates post-migration

---

## **🏁 Validation Steps**

### **Test Complete Workflow**
1. **Create test feature branch**
2. **Submit PR with changes**  
3. **Verify CI pipeline execution**
4. **Confirm auto-merge after approval**
5. **Validate beta distribution**
6. **Test production release with tag**

### **Success Criteria**
- ✅ All CI stages pass consistently
- ✅ Beta apps distribute automatically
- ✅ Team comfortable with new workflow
- ✅ Production releases work via tags
- ✅ No develop branch dependencies remain

---

**🎉 Migration Complete!** Your team now has a modern, efficient CI/CD pipeline with automated beta testing and streamlined production releases.
