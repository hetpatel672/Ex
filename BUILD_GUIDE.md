# Android APK Build Guide for BudgetWise

## Current Status

The React Native project (BudgetWise) is set up with the following configuration:
- React Native 0.75.0
- Android SDK 34
- Java 17
- Gradle 8.7
- Android Gradle Plugin 8.5.0

## Build Environment Setup

### Prerequisites
1. **Java 17** - Installed and configured
2. **Android SDK** - Installed with the following components:
   - Platform Tools
   - Android API 34 (android-34)
   - Android API 33 (android-33)
   - Build Tools 34.0.0
   - NDK 25.1.8937393

### Environment Variables
```bash
export ANDROID_HOME=~/android-sdk
export ANDROID_SDK_ROOT=~/android-sdk
export JAVA_HOME=/usr/lib/jvm/openjdk-17
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin
```

## Current Issues and Solutions

### Issue 1: react-native-gesture-handler Compilation Error
**Problem**: ViewManagerWithGeneratedInterface cannot be resolved
**Status**: Unresolved - This is a known compatibility issue between react-native-gesture-handler 2.27.1 and certain Android Gradle Plugin versions.

**Potential Solutions**:
1. Downgrade react-native-gesture-handler to a compatible version
2. Update to a newer version that supports the current setup
3. Use a different navigation library temporarily

### Issue 2: androidx.core Dependency Conflicts
**Problem**: androidx.core:core:1.16.0 requires Android Gradle Plugin 8.6.0+ and compileSdk 35
**Status**: Partially resolved with dependency forcing

**Applied Solution**:
```gradle
configurations.all {
    resolutionStrategy {
        force 'androidx.core:core:1.13.1'
        force 'androidx.core:core-ktx:1.13.1'
    }
}
```

## Build Steps

### Manual Build Process

1. **Navigate to project directory**:
   ```bash
   cd /workspace/Ex
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create autolinking directory**:
   ```bash
   mkdir -p android/build/generated/autolinking
   ```

4. **Generate autolinking configuration**:
   ```bash
   npx react-native config --platform android > android/build/generated/autolinking/autolinking.json
   ```

5. **Make gradlew executable**:
   ```bash
   chmod +x android/gradlew
   ```

6. **Build APK**:
   ```bash
   cd android
   ./gradlew assembleDebug  # For debug build
   # or
   ./gradlew assembleRelease  # For release build (currently failing)
   ```

### Automated Build (GitHub Actions)

A GitHub Actions workflow has been created at `.github/workflows/android-build.yml` that automates the build process.

## Configuration Files Modified

### 1. android/build.gradle
- Updated Android Gradle Plugin to 8.5.0
- Set compileSdkVersion to 34

### 2. android/app/build.gradle
- Removed Flipper integration dependency
- Added dependency resolution strategy
- Added forced androidx.core versions

### 3. android/gradle-wrapper.properties
- Updated Gradle version to 8.7

## Troubleshooting

### Common Issues

1. **Java Path Issues**: Ensure JAVA_HOME points to a valid Java 17 installation
2. **SDK License Issues**: Run `sdkmanager --licenses` to accept all licenses
3. **Gradle Daemon Issues**: Run `./gradlew --stop` to stop daemon and retry

### Debug Commands

```bash
# Check React Native doctor
npx react-native doctor

# Check Java version
java -version

# Check Android SDK
sdkmanager --list

# Clean build
cd android && ./gradlew clean
```

## Next Steps

To resolve the current build issues:

1. **Option 1**: Downgrade react-native-gesture-handler
   ```bash
   npm install react-native-gesture-handler@2.16.0
   ```

2. **Option 2**: Update to newer compatible versions
   - Update Android Gradle Plugin to 8.6.1+
   - Update compileSdk to 35
   - Ensure all dependencies are compatible

3. **Option 3**: Temporarily remove gesture handler
   - Comment out gesture handler imports
   - Use basic navigation without gestures

## Expected Output

Once the build succeeds, the APK will be located at:
- Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release: `android/app/build/outputs/apk/release/app-release.apk`

## Build Environment Details

- **OS**: Ubuntu Linux
- **Node.js**: 18.x
- **npm**: Latest
- **React Native CLI**: Latest
- **Metro**: 0.80.12

## Dependencies Status

✅ Java 17 - Installed
✅ Android SDK - Installed
✅ Gradle 8.7 - Configured
✅ Node dependencies - Installed
❌ Build compilation - Failing due to gesture handler
✅ Autolinking - Configured
✅ Environment variables - Set

## Recommendations

For a quick working build, consider:
1. Creating a minimal version without gesture handler
2. Using a proven dependency combination
3. Testing with a fresh React Native 0.75.0 template

This guide provides a comprehensive overview of the current build setup and the steps taken to resolve various issues encountered during the Android APK build process.