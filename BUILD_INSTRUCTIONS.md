# BudgetWise Android App - Build Instructions for GitHub Codespaces

## Prerequisites

1. **GitHub Codespace Setup**
   - Open your repository in GitHub Codespaces
   - Ensure you have Java 17+ installed
   - Install Android SDK and tools

## Step 1: Setup Android SDK in Codespace

```bash
# Install Android SDK
sudo apt update
sudo apt install -y wget unzip

# Download Android Command Line Tools
cd /opt
sudo wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip
sudo unzip commandlinetools-linux-9477386_latest.zip
sudo mv cmdline-tools latest
sudo mkdir -p android-sdk/cmdline-tools
sudo mv latest android-sdk/cmdline-tools/

# Set environment variables
echo 'export ANDROID_HOME=/opt/android-sdk' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools' >> ~/.bashrc
source ~/.bashrc

# Accept licenses and install required packages
yes | sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.0"
```

## Step 2: Setup Project

```bash
# Clone your repository (if not already in codespace)
git clone https://github.com/yourusername/budgetwise-android.git
cd budgetwise-android/project

# Make gradlew executable
chmod +x gradlew

# Create local.properties file
echo "sdk.dir=/opt/android-sdk" > local.properties
```

## Step 3: Build the Project

```bash
# Clean and build the project
./gradlew clean

# Build debug APK
./gradlew assembleDebug

# Build release APK (unsigned)
./gradlew assembleRelease
```

## Step 4: Find Your APK

```bash
# Debug APK location
ls -la app/build/outputs/apk/debug/

# Release APK location  
ls -la app/build/outputs/apk/release/
```

## Step 5: Download APK from Codespace

1. **Using VS Code in Codespace:**
   - Navigate to `app/build/outputs/apk/debug/`
   - Right-click on `app-debug.apk`
   - Select "Download"

2. **Using Command Line:**
   ```bash
   # Copy APK to workspace root for easy access
   cp app/build/outputs/apk/debug/app-debug.apk ~/workspace/budgetwise-debug.apk
   ```

## Step 6: Troubleshooting

### Common Issues:

1. **Gradle Build Failed:**
   ```bash
   # Check Java version
   java -version
   
   # If wrong version, install Java 17
   sudo apt install openjdk-17-jdk
   export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
   ```

2. **SDK Not Found:**
   ```bash
   # Verify ANDROID_HOME
   echo $ANDROID_HOME
   
   # Reinstall if needed
   sdkmanager --list
   ```

3. **Permission Denied:**
   ```bash
   # Fix gradlew permissions
   chmod +x gradlew
   ```

## Step 7: Push Clean Java Code to GitHub

### Remove Non-Java Files Before Push:

```bash
# Remove React/JS files if any exist
find . -name "*.js" -not -path "./node_modules/*" -delete
find . -name "*.jsx" -delete
find . -name "*.ts" -not -path "./app/src/main/java/*" -delete
find . -name "*.tsx" -delete
find . -name "package.json" -delete
find . -name "package-lock.json" -delete
find . -name "yarn.lock" -delete
find . -name "node_modules" -type d -exec rm -rf {} +

# Keep only Android/Java related files
git add app/
git add gradle/
git add *.gradle
git add gradlew*
git add *.md
git add .gitignore

# Commit and push
git commit -m "Android app with bug fixes - Java only"
git push origin main
```

## Step 8: Automated Build Script

Create `build.sh` for easy building:

```bash
#!/bin/bash
echo "Building BudgetWise Android App..."

# Check if Android SDK is available
if [ ! -d "$ANDROID_HOME" ]; then
    echo "Error: ANDROID_HOME not set or Android SDK not found"
    exit 1
fi

# Clean previous builds
./gradlew clean

# Build debug APK
echo "Building debug APK..."
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    echo "✅ Debug APK built successfully!"
    echo "📱 APK location: app/build/outputs/apk/debug/app-debug.apk"
    
    # Copy to easy access location
    cp app/build/outputs/apk/debug/app-debug.apk ./budgetwise-debug.apk
    echo "📋 APK copied to: ./budgetwise-debug.apk"
else
    echo "❌ Build failed!"
    exit 1
fi
```

Make it executable:
```bash
chmod +x build.sh
./build.sh
```

## Key Bug Fixes Applied:

1. **MainActivity**: Added proper fragment management and navigation
2. **Transaction Model**: Added validation and proper data handling
3. **Budget Model**: Added validation and calculation methods
4. **EncryptionManager**: Fixed security implementation with proper error handling
5. **AddTransactionDialogFragment**: Added comprehensive input validation
6. **Layout Files**: Fixed missing views and proper structure
7. **Dependencies**: Updated to latest stable versions
8. **Manifest**: Added required permissions and activities

The APK will be ready for installation on Android devices after following these steps!