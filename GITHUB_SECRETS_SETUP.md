# 🔐 GitHub Repository Secrets Configuration Guide

## **Overview**
This guide will help you configure the required repository secrets for your modern CI/CD pipeline. These secrets enable automated mobile builds, beta distribution, and production releases.

---

## **🚀 Quick Setup Steps**

### **1. Access Repository Secrets**
1. Go to your GitHub repository: https://github.com/pardhuparimi/vyeya
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each secret below

---

## **📱 Required Secrets**

### **🔥 Firebase App Distribution**

#### **FIREBASE_ANDROID_APP_ID**
```
Purpose: Identifies your Android app in Firebase App Distribution
How to get:
1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project (or create one)
3. Go to Project Settings → General
4. Under "Your apps" section, find your Android app
5. Copy the "App ID" (format: 1:123456789:android:abcdef123456)

Example: 1:123456789:android:abcdef123456789
```

#### **FIREBASE_TOKEN**
```
Purpose: Authenticates with Firebase for app distribution
How to get:
1. Install Firebase CLI: npm install -g firebase-tools
2. Login: firebase login:ci
3. Copy the token that's generated

Example: 1//abc123def456ghi789jkl0mn
```

### **🍎 Apple App Store Connect**

#### **APP_STORE_CONNECT_API_KEY**
```
Purpose: Authenticates with App Store Connect for TestFlight/App Store uploads
How to get:
1. Go to App Store Connect: https://appstoreconnect.apple.com/
2. Go to Users and Access → Keys
3. Click the "+" to create a new key
4. Give it a name (e.g., "CI/CD Pipeline")
5. Select "Developer" access
6. Download the .p8 file
7. Convert to base64: base64 -i AuthKey_XXXXXXXXXX.p8 | pbcopy
8. Paste the base64 string as the secret value

Also set these environment variables in your Fastlane configuration:
- FASTLANE_KEY_ID: The key ID (10 characters, e.g., XXXXXXXXXX)
- FASTLANE_ISSUER_ID: Your issuer ID from App Store Connect
```

### **🤖 Google Play Console**

#### **GOOGLE_PLAY_SERVICE_ACCOUNT**
```
Purpose: Authenticates with Google Play Console for app uploads
How to get:
1. Go to Google Play Console: https://play.google.com/console/
2. Go to Setup → API access
3. Choose your project or create a new one
4. Create a service account:
   - Go to Google Cloud Console
   - IAM & Admin → Service Accounts
   - Create service account
   - Download JSON key file
5. Grant permissions in Play Console:
   - Link the service account
   - Grant "Release Manager" permissions
6. Convert JSON to base64: base64 -i service-account.json | pbcopy
7. Paste the base64 string as the secret value
```

### **💬 Slack Notifications**

#### **SLACK_WEBHOOK_URL**
```
Purpose: Sends build and release notifications to your team
How to get:
1. Go to your Slack workspace
2. Go to Apps → Incoming Webhooks
3. Click "Add to Slack"
4. Choose a channel for notifications (e.g., #mobile-releases)
5. Copy the webhook URL

Example: https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
```

---

## **⚙️ GitHub Secrets Setup Commands**

You can also set secrets via GitHub CLI:

```bash
# Firebase secrets
gh secret set FIREBASE_ANDROID_APP_ID --body "1:123456789:android:abcdef123456789"
gh secret set FIREBASE_TOKEN --body "1//abc123def456ghi789jkl0mn"

# Apple secrets
gh secret set APP_STORE_CONNECT_API_KEY --body "$(base64 -i AuthKey_XXXXXXXXXX.p8)"

# Google Play secret
gh secret set GOOGLE_PLAY_SERVICE_ACCOUNT --body "$(base64 -i service-account.json)"

# Slack secret
gh secret set SLACK_WEBHOOK_URL --body "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX"
```

---

## **🧪 Testing Your Setup**

### **1. Verify Secrets Are Set**
```bash
# List all repository secrets
gh secret list
```

### **2. Test Firebase Distribution**
```bash
# Install Firebase CLI locally
npm install -g firebase-tools

# Test authentication
firebase login:ci

# Test app distribution (after setting up Firebase project)
cd packages/app
fastlane android beta
```

### **3. Test Branch Protection**
```bash
# Create a test branch
git checkout -b test/branch-protection
echo "# Test" > test-file.md
git add test-file.md
git commit -m "test: verify branch protection"
git push -u origin test/branch-protection

# Try to create PR - should require CI checks to pass
gh pr create --title "Test Branch Protection" --body "Testing the new branch protection rules"
```

---

## **🔒 Security Best Practices**

### **Secret Management**
- ✅ **Use environment-specific secrets** for dev/staging/prod
- ✅ **Rotate secrets regularly** (every 90 days)
- ✅ **Limit secret scope** to minimum required permissions
- ✅ **Monitor secret usage** in GitHub Actions logs
- ✅ **Use GitHub's secret scanning** to detect leaked secrets

### **Access Control**
- ✅ **Repository admins only** can manage secrets
- ✅ **Use service accounts** instead of personal accounts
- ✅ **Enable two-factor authentication** on all accounts
- ✅ **Review access permissions** regularly

### **Monitoring**
- ✅ **Set up alerts** for failed builds/deployments
- ✅ **Monitor secret expiration dates**
- ✅ **Track secret usage** in CI/CD logs
- ✅ **Regular security audits** of access patterns

---

## **🚀 Post-Setup Validation**

After configuring all secrets, your CI/CD pipeline will:

1. ✅ **Quality Gate** - Lint, test, type-check (2-3 minutes)
2. ✅ **Integration Tests** - Database and API validation (3-5 minutes)
3. ✅ **Mobile Builds** - Android/iOS compilation (8-12 minutes)
4. ✅ **E2E Tests** - Full application testing (10-15 minutes)
5. ✅ **Beta Distribution** - Firebase & TestFlight (5-8 minutes)
6. ✅ **Production Release** - App Store deployment (8-12 minutes)

### **Expected Notifications**
- 📱 **Slack messages** for successful builds
- 📧 **Email notifications** for beta app availability
- 🔔 **GitHub status checks** on pull requests
- 📊 **Firebase dashboard** updates

---

## **🆘 Troubleshooting**

### **Common Issues**

#### **Firebase Token Expired**
```bash
# Regenerate token
firebase logout
firebase login:ci
# Update FIREBASE_TOKEN secret with new value
```

#### **Apple Certificate Issues**
```bash
# Check certificate status
fastlane match development --readonly
fastlane match appstore --readonly
```

#### **Google Play API Issues**
```bash
# Verify service account permissions in Play Console
# Ensure "Release Manager" role is assigned
```

#### **Slack Webhook Not Working**
```bash
# Test webhook manually
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Test message from CI/CD"}' \
  YOUR_SLACK_WEBHOOK_URL
```

### **Debug Commands**
```bash
# Check GitHub Actions logs
gh run list --limit 5
gh run view --log [RUN_ID]

# Test Fastlane locally
cd packages/app
fastlane android build_debug
fastlane ios build_debug
```

---

## **📝 Configuration Checklist**

- [ ] **FIREBASE_ANDROID_APP_ID** configured
- [ ] **FIREBASE_TOKEN** configured  
- [ ] **APP_STORE_CONNECT_API_KEY** configured
- [ ] **GOOGLE_PLAY_SERVICE_ACCOUNT** configured
- [ ] **SLACK_WEBHOOK_URL** configured
- [ ] **Firebase project** set up with Android/iOS apps
- [ ] **Apple Developer** account with App Store Connect access
- [ ] **Google Play Console** account with API access enabled
- [ ] **Slack channel** created for notifications
- [ ] **Branch protection** rules active on main branch
- [ ] **Test PR** created to validate pipeline
- [ ] **Team members** notified of new workflow

Once all secrets are configured, your modern CI/CD pipeline will be fully operational! 🎉
