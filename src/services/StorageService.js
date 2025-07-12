import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

class StorageService {
  constructor() {
    this.encryptionKey = null;
    this.isInitialized = false;
    this.storageKeys = {
      TRANSACTIONS: 'transactions',
      BUDGETS: 'budgets',
      SETTINGS: 'settings',
      USER_PROFILE: 'user_profile',
      ENCRYPTION_KEY: 'encryption_key',
      BACKUP_METADATA: 'backup_metadata',
      AI_INSIGHTS: 'ai_insights',
      NOTIFICATION_PREFERENCES: 'notification_preferences'
    };
  }

  // Initialize storage with encryption
  async initialize() {
    if (this.isInitialized) return true;

    try {
      // Generate or retrieve encryption key
      let storedKey = await AsyncStorage.getItem(this.storageKeys.ENCRYPTION_KEY);
      
      if (!storedKey) {
        // Generate new encryption key
        this.encryptionKey = CryptoJS.lib.WordArray.random(256/8).toString();
        await AsyncStorage.setItem(this.storageKeys.ENCRYPTION_KEY, this.encryptionKey);
      } else {
        this.encryptionKey = storedKey;
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize storage:', error);
      return false;
    }
  }

  // Encrypt data
  encrypt(data) {
    if (!this.encryptionKey) {
      throw new Error('Storage not initialized');
    }
    
    const jsonString = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(jsonString, this.encryptionKey).toString();
    return encrypted;
  }

  // Decrypt data
  decrypt(encryptedData) {
    if (!this.encryptionKey) {
      throw new Error('Storage not initialized');
    }
    
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
      const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      return null;
    }
  }

  // Store encrypted data
  async storeData(key, data) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const encryptedData = this.encrypt(data);
      await AsyncStorage.setItem(key, encryptedData);
      return true;
    } catch (error) {
      console.error('Failed to store data:', error);
      return false;
    }
  }

  // Retrieve and decrypt data
  async getData(key, defaultValue = null) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const encryptedData = await AsyncStorage.getItem(key);
      if (!encryptedData) {
        return defaultValue;
      }
      
      const decryptedData = this.decrypt(encryptedData);
      return decryptedData || defaultValue;
    } catch (error) {
      console.error('Failed to retrieve data:', error);
      return defaultValue;
    }
  }

  // Transaction management
  async saveTransactions(transactions) {
    return await this.storeData(this.storageKeys.TRANSACTIONS, transactions);
  }

  async getTransactions() {
    return await this.getData(this.storageKeys.TRANSACTIONS, []);
  }

  async addTransaction(transaction) {
    const transactions = await this.getTransactions();
    transactions.unshift(transaction); // Add to beginning
    return await this.saveTransactions(transactions);
  }

  async updateTransaction(transactionId, updatedTransaction) {
    const transactions = await this.getTransactions();
    const index = transactions.findIndex(t => t.id === transactionId);
    
    if (index !== -1) {
      transactions[index] = { ...transactions[index], ...updatedTransaction };
      return await this.saveTransactions(transactions);
    }
    
    return false;
  }

  async deleteTransaction(transactionId) {
    const transactions = await this.getTransactions();
    const filteredTransactions = transactions.filter(t => t.id !== transactionId);
    return await this.saveTransactions(filteredTransactions);
  }

  // Budget management
  async saveBudgets(budgets) {
    return await this.storeData(this.storageKeys.BUDGETS, budgets);
  }

  async getBudgets() {
    return await this.getData(this.storageKeys.BUDGETS, []);
  }

  async addBudget(budget) {
    const budgets = await this.getBudgets();
    budgets.push(budget);
    return await this.saveBudgets(budgets);
  }

  async updateBudget(budgetId, updatedBudget) {
    const budgets = await this.getBudgets();
    const index = budgets.findIndex(b => b.id === budgetId);
    
    if (index !== -1) {
      budgets[index] = { ...budgets[index], ...updatedBudget };
      return await this.saveBudgets(budgets);
    }
    
    return false;
  }

  async deleteBudget(budgetId) {
    const budgets = await this.getBudgets();
    const filteredBudgets = budgets.filter(b => b.id !== budgetId);
    return await this.saveBudgets(filteredBudgets);
  }

  // Settings management
  async saveSettings(settings) {
    return await this.storeData(this.storageKeys.SETTINGS, settings);
  }

  async getSettings() {
    const defaultSettings = {
      biometricLogin: false,
      notifications: true,
      darkMode: false,
      autoBackup: true,
      currency: 'USD',
      language: 'English',
      budgetAlerts: true,
      spendingReminders: true,
    };
    
    return await this.getData(this.storageKeys.SETTINGS, defaultSettings);
  }

  // User profile management
  async saveUserProfile(profile) {
    return await this.storeData(this.storageKeys.USER_PROFILE, profile);
  }

  async getUserProfile() {
    const defaultProfile = {
      name: '',
      email: '',
      avatar: null,
      createdAt: new Date().toISOString(),
    };
    
    return await this.getData(this.storageKeys.USER_PROFILE, defaultProfile);
  }

  // AI insights management
  async saveAIInsights(insights) {
    return await this.storeData(this.storageKeys.AI_INSIGHTS, insights);
  }

  async getAIInsights() {
    return await this.getData(this.storageKeys.AI_INSIGHTS, []);
  }

  // Backup and restore functionality
  async createBackup() {
    try {
      const backupData = {
        transactions: await this.getTransactions(),
        budgets: await this.getBudgets(),
        settings: await this.getSettings(),
        userProfile: await this.getUserProfile(),
        aiInsights: await this.getAIInsights(),
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      };

      // Create backup file
      const backupFileName = `account_records_backup_${Date.now()}.json`;
      const backupPath = `${FileSystem.documentDirectory}${backupFileName}`;
      
      // Encrypt backup data
      const encryptedBackup = this.encrypt(backupData);
      
      // Write to file
      await FileSystem.writeAsStringAsync(backupPath, encryptedBackup);
      
      // Update backup metadata
      const backupMetadata = {
        lastBackup: new Date().toISOString(),
        backupPath,
        backupFileName,
        size: encryptedBackup.length
      };
      
      await this.storeData(this.storageKeys.BACKUP_METADATA, backupMetadata);
      
      return {
        success: true,
        path: backupPath,
        fileName: backupFileName,
        size: encryptedBackup.length
      };
    } catch (error) {
      console.error('Failed to create backup:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async restoreFromBackup(backupPath) {
    try {
      // Read backup file
      const encryptedBackup = await FileSystem.readAsStringAsync(backupPath);
      
      // Decrypt backup data
      const backupData = this.decrypt(encryptedBackup);
      
      if (!backupData) {
        throw new Error('Invalid backup file or wrong encryption key');
      }
      
      // Validate backup structure
      if (!backupData.transactions || !backupData.budgets || !backupData.settings) {
        throw new Error('Invalid backup file structure');
      }
      
      // Restore data
      await this.saveTransactions(backupData.transactions);
      await this.saveBudgets(backupData.budgets);
      await this.saveSettings(backupData.settings);
      await this.saveUserProfile(backupData.userProfile);
      
      if (backupData.aiInsights) {
        await this.saveAIInsights(backupData.aiInsights);
      }
      
      return {
        success: true,
        restoredAt: new Date().toISOString(),
        backupTimestamp: backupData.timestamp
      };
    } catch (error) {
      console.error('Failed to restore backup:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Export data in various formats
  async exportData(format = 'json') {
    try {
      const exportData = {
        transactions: await this.getTransactions(),
        budgets: await this.getBudgets(),
        settings: await this.getSettings(),
        userProfile: await this.getUserProfile(),
        exportedAt: new Date().toISOString(),
        format
      };

      let exportContent;
      let fileName;
      let mimeType;

      switch (format.toLowerCase()) {
        case 'csv':
          exportContent = this.convertToCSV(exportData.transactions);
          fileName = `transactions_export_${Date.now()}.csv`;
          mimeType = 'text/csv';
          break;
        
        case 'json':
        default:
          exportContent = JSON.stringify(exportData, null, 2);
          fileName = `account_records_export_${Date.now()}.json`;
          mimeType = 'application/json';
          break;
      }

      const exportPath = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(exportPath, exportContent);

      return {
        success: true,
        path: exportPath,
        fileName,
        mimeType,
        size: exportContent.length
      };
    } catch (error) {
      console.error('Failed to export data:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Convert transactions to CSV format
  convertToCSV(transactions) {
    if (!transactions || transactions.length === 0) {
      return 'Date,Title,Category,Amount,Type\n';
    }

    const headers = 'Date,Title,Category,Amount,Type\n';
    const rows = transactions.map(transaction => {
      return [
        transaction.date,
        `"${transaction.title.replace(/"/g, '""')}"`, // Escape quotes
        transaction.category,
        transaction.amount,
        transaction.type
      ].join(',');
    }).join('\n');

    return headers + rows;
  }

  // Data validation and integrity checks
  async validateDataIntegrity() {
    try {
      const transactions = await this.getTransactions();
      const budgets = await this.getBudgets();
      const settings = await this.getSettings();

      const issues = [];

      // Validate transactions
      transactions.forEach((transaction, index) => {
        if (!transaction.id || !transaction.title || !transaction.amount || !transaction.date) {
          issues.push(`Transaction at index ${index} is missing required fields`);
        }
        
        if (isNaN(transaction.amount)) {
          issues.push(`Transaction "${transaction.title}" has invalid amount`);
        }
        
        if (!Date.parse(transaction.date)) {
          issues.push(`Transaction "${transaction.title}" has invalid date`);
        }
      });

      // Validate budgets
      budgets.forEach((budget, index) => {
        if (!budget.id || !budget.category || !budget.budgetAmount) {
          issues.push(`Budget at index ${index} is missing required fields`);
        }
        
        if (isNaN(budget.budgetAmount) || budget.budgetAmount <= 0) {
          issues.push(`Budget for "${budget.category}" has invalid amount`);
        }
      });

      return {
        isValid: issues.length === 0,
        issues,
        checkedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to validate data integrity:', error);
      return {
        isValid: false,
        issues: [`Validation failed: ${error.message}`],
        checkedAt: new Date().toISOString()
      };
    }
  }

  // Clear all data (for reset functionality)
  async clearAllData() {
    try {
      const keys = Object.values(this.storageKeys);
      await AsyncStorage.multiRemove(keys);
      
      // Reinitialize with new encryption key
      this.isInitialized = false;
      await this.initialize();
      
      return true;
    } catch (error) {
      console.error('Failed to clear all data:', error);
      return false;
    }
  }

  // Get storage usage statistics
  async getStorageStats() {
    try {
      const transactions = await this.getTransactions();
      const budgets = await this.getBudgets();
      const settings = await this.getSettings();
      const userProfile = await this.getUserProfile();
      const aiInsights = await this.getAIInsights();

      const stats = {
        transactions: {
          count: transactions.length,
          size: JSON.stringify(transactions).length
        },
        budgets: {
          count: budgets.length,
          size: JSON.stringify(budgets).length
        },
        settings: {
          size: JSON.stringify(settings).length
        },
        userProfile: {
          size: JSON.stringify(userProfile).length
        },
        aiInsights: {
          count: aiInsights.length,
          size: JSON.stringify(aiInsights).length
        }
      };

      const totalSize = Object.values(stats).reduce((sum, item) => sum + (item.size || 0), 0);
      
      return {
        ...stats,
        totalSize,
        totalSizeFormatted: this.formatBytes(totalSize),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return null;
    }
  }

  // Format bytes to human readable format
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}

export default new StorageService();

