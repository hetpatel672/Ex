import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import CryptoJS from 'crypto-js';
import DatabaseService from './DatabaseService';

class AuthService {
  constructor() {
    this.isAuthenticated = false;
    this.authMethod = null; // 'biometric', 'pin', 'none'
    this.sessionTimeout = 5 * 60 * 1000; // 5 minutes
    this.lastActivity = Date.now();
    this.sessionTimer = null;
  }

  async initialize() {
    // Check if biometric authentication is available
    const biometricAvailable = await this.isBiometricAvailable();
    const savedAuthMethod = await DatabaseService.getSetting('authMethod');
    
    this.authMethod = savedAuthMethod || (biometricAvailable ? 'biometric' : 'none');
    
    // Start session timer
    this.startSessionTimer();
  }

  async isBiometricAvailable() {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      return hasHardware && isEnrolled && supportedTypes.length > 0;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  }

  async getSupportedBiometricTypes() {
    try {
      return await LocalAuthentication.supportedAuthenticationTypesAsync();
    } catch (error) {
      console.error('Error getting supported biometric types:', error);
      return [];
    }
  }

  async authenticateWithBiometric() {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access BudgetWise',
        fallbackLabel: 'Use PIN',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        this.isAuthenticated = true;
        this.updateLastActivity();
        return { success: true };
      } else {
        return { 
          success: false, 
          error: result.error || 'Authentication failed',
          errorCode: result.error
        };
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return { success: false, error: error.message };
    }
  }

  async setupPIN(pin) {
    try {
      // Hash the PIN before storing
      const hashedPIN = CryptoJS.SHA256(pin).toString();
      await SecureStore.setItemAsync('userPIN', hashedPIN);
      await DatabaseService.setSetting('authMethod', 'pin');
      this.authMethod = 'pin';
      return { success: true };
    } catch (error) {
      console.error('Error setting up PIN:', error);
      return { success: false, error: error.message };
    }
  }

  async authenticateWithPIN(pin) {
    try {
      const storedHashedPIN = await SecureStore.getItemAsync('userPIN');
      if (!storedHashedPIN) {
        return { success: false, error: 'No PIN set up' };
      }

      const hashedInputPIN = CryptoJS.SHA256(pin).toString();
      
      if (hashedInputPIN === storedHashedPIN) {
        this.isAuthenticated = true;
        this.updateLastActivity();
        return { success: true };
      } else {
        return { success: false, error: 'Incorrect PIN' };
      }
    } catch (error) {
      console.error('PIN authentication error:', error);
      return { success: false, error: error.message };
    }
  }

  async changePIN(oldPIN, newPIN) {
    try {
      // Verify old PIN first
      const authResult = await this.authenticateWithPIN(oldPIN);
      if (!authResult.success) {
        return { success: false, error: 'Current PIN is incorrect' };
      }

      // Set new PIN
      return await this.setupPIN(newPIN);
    } catch (error) {
      console.error('Error changing PIN:', error);
      return { success: false, error: error.message };
    }
  }

  async removePIN() {
    try {
      await SecureStore.deleteItemAsync('userPIN');
      await DatabaseService.setSetting('authMethod', 'none');
      this.authMethod = 'none';
      return { success: true };
    } catch (error) {
      console.error('Error removing PIN:', error);
      return { success: false, error: error.message };
    }
  }

  async enableBiometric() {
    try {
      const available = await this.isBiometricAvailable();
      if (!available) {
        return { success: false, error: 'Biometric authentication not available' };
      }

      // Test biometric authentication
      const testResult = await this.authenticateWithBiometric();
      if (testResult.success) {
        await DatabaseService.setSetting('authMethod', 'biometric');
        this.authMethod = 'biometric';
        return { success: true };
      } else {
        return testResult;
      }
    } catch (error) {
      console.error('Error enabling biometric:', error);
      return { success: false, error: error.message };
    }
  }

  async disableBiometric() {
    try {
      await DatabaseService.setSetting('authMethod', 'none');
      this.authMethod = 'none';
      return { success: true };
    } catch (error) {
      console.error('Error disabling biometric:', error);
      return { success: false, error: error.message };
    }
  }

  async authenticate() {
    if (this.authMethod === 'none') {
      this.isAuthenticated = true;
      this.updateLastActivity();
      return { success: true };
    }

    if (this.authMethod === 'biometric') {
      return await this.authenticateWithBiometric();
    }

    // For PIN, we need to show PIN input UI
    return { success: false, requiresPIN: true };
  }

  logout() {
    this.isAuthenticated = false;
    this.clearSessionTimer();
  }

  updateLastActivity() {
    this.lastActivity = Date.now();
  }

  startSessionTimer() {
    this.clearSessionTimer();
    this.sessionTimer = setInterval(() => {
      if (this.isAuthenticated && Date.now() - this.lastActivity > this.sessionTimeout) {
        this.logout();
      }
    }, 30000); // Check every 30 seconds
  }

  clearSessionTimer() {
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  isUserAuthenticated() {
    return this.isAuthenticated;
  }

  getAuthMethod() {
    return this.authMethod;
  }

  async setSessionTimeout(minutes) {
    this.sessionTimeout = minutes * 60 * 1000;
    await DatabaseService.setSetting('sessionTimeout', minutes.toString());
  }

  async getSessionTimeout() {
    const saved = await DatabaseService.getSetting('sessionTimeout');
    return saved ? parseInt(saved) : 5; // Default 5 minutes
  }

  // Generate encryption key for data encryption
  async generateEncryptionKey() {
    try {
      let key = await SecureStore.getItemAsync('encryptionKey');
      if (!key) {
        // Generate a new key
        key = CryptoJS.lib.WordArray.random(256/8).toString();
        await SecureStore.setItemAsync('encryptionKey', key);
      }
      return key;
    } catch (error) {
      console.error('Error generating encryption key:', error);
      throw error;
    }
  }

  // Encrypt sensitive data
  async encryptData(data) {
    try {
      const key = await this.generateEncryptionKey();
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
      return encrypted;
    } catch (error) {
      console.error('Error encrypting data:', error);
      throw error;
    }
  }

  // Decrypt sensitive data
  async decryptData(encryptedData) {
    try {
      const key = await this.generateEncryptionKey();
      const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedString);
    } catch (error) {
      console.error('Error decrypting data:', error);
      throw error;
    }
  }

  // Security settings
  async getSecuritySettings() {
    return {
      authMethod: this.authMethod,
      biometricAvailable: await this.isBiometricAvailable(),
      supportedBiometricTypes: await this.getSupportedBiometricTypes(),
      sessionTimeout: await this.getSessionTimeout(),
      hasPIN: await SecureStore.getItemAsync('userPIN') !== null
    };
  }

  // Reset all security settings (for app reset)
  async resetSecurity() {
    try {
      await SecureStore.deleteItemAsync('userPIN');
      await SecureStore.deleteItemAsync('encryptionKey');
      await DatabaseService.setSetting('authMethod', 'none');
      this.authMethod = 'none';
      this.isAuthenticated = false;
      return { success: true };
    } catch (error) {
      console.error('Error resetting security:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new AuthService();

