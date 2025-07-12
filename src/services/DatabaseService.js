import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import { Transaction } from '../models/Transaction';
import { Budget } from '../models/Budget';

class DatabaseService {
  constructor() {
    this.db = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      this.db = await SQLite.openDatabaseAsync('budgetwise.db');
      await this.createTables();
      this.isInitialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  async createTables() {
    const createTransactionsTable = `
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        amount REAL NOT NULL,
        type TEXT NOT NULL,
        category TEXT,
        subcategory TEXT,
        description TEXT,
        date TEXT NOT NULL,
        account TEXT DEFAULT 'main',
        currency TEXT DEFAULT 'USD',
        tags TEXT,
        location TEXT,
        receipt TEXT,
        recurring INTEGER DEFAULT 0,
        recurringPattern TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `;

    const createBudgetsTable = `
      CREATE TABLE IF NOT EXISTS budgets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT,
        amount REAL NOT NULL,
        spent REAL DEFAULT 0,
        period TEXT DEFAULT 'monthly',
        startDate TEXT NOT NULL,
        endDate TEXT NOT NULL,
        currency TEXT DEFAULT 'USD',
        color TEXT DEFAULT '#6366f1',
        icon TEXT DEFAULT 'wallet',
        notifications INTEGER DEFAULT 1,
        warningThreshold REAL DEFAULT 80,
        isActive INTEGER DEFAULT 1,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `;

    const createCategoriesTable = `
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        color TEXT DEFAULT '#6366f1',
        icon TEXT DEFAULT 'folder',
        parentId TEXT,
        isActive INTEGER DEFAULT 1,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `;

    const createSettingsTable = `
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `;

    const createGoalsTable = `
      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        targetAmount REAL NOT NULL,
        currentAmount REAL DEFAULT 0,
        targetDate TEXT,
        category TEXT,
        currency TEXT DEFAULT 'USD',
        color TEXT DEFAULT '#6366f1',
        icon TEXT DEFAULT 'target',
        isActive INTEGER DEFAULT 1,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `;

    await this.db.execAsync(createTransactionsTable);
    await this.db.execAsync(createBudgetsTable);
    await this.db.execAsync(createCategoriesTable);
    await this.db.execAsync(createSettingsTable);
    await this.db.execAsync(createGoalsTable);

    // Create indexes for better performance
    await this.db.execAsync('CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);');
    await this.db.execAsync('CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);');
    await this.db.execAsync('CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);');
    await this.db.execAsync('CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category);');
    await this.db.execAsync('CREATE INDEX IF NOT EXISTS idx_budgets_period ON budgets(period);');

    // Insert default categories if they don't exist
    await this.insertDefaultCategories();
    await this.insertDefaultSettings();
  }

  async insertDefaultCategories() {
    const defaultCategories = [
      // Income categories
      { name: 'Salary', type: 'income', color: '#10b981', icon: 'briefcase' },
      { name: 'Freelance', type: 'income', color: '#059669', icon: 'laptop' },
      { name: 'Investment', type: 'income', color: '#047857', icon: 'trending-up' },
      { name: 'Other Income', type: 'income', color: '#065f46', icon: 'plus-circle' },
      
      // Expense categories
      { name: 'Food & Dining', type: 'expense', color: '#ef4444', icon: 'utensils' },
      { name: 'Transportation', type: 'expense', color: '#f97316', icon: 'car' },
      { name: 'Shopping', type: 'expense', color: '#eab308', icon: 'shopping-bag' },
      { name: 'Entertainment', type: 'expense', color: '#8b5cf6', icon: 'film' },
      { name: 'Bills & Utilities', type: 'expense', color: '#06b6d4', icon: 'file-text' },
      { name: 'Healthcare', type: 'expense', color: '#ec4899', icon: 'heart' },
      { name: 'Education', type: 'expense', color: '#3b82f6', icon: 'book' },
      { name: 'Travel', type: 'expense', color: '#14b8a6', icon: 'map-pin' },
      { name: 'Other Expenses', type: 'expense', color: '#6b7280', icon: 'more-horizontal' }
    ];

    for (const category of defaultCategories) {
      const id = 'cat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const now = new Date().toISOString();
      
      await this.db.runAsync(
        `INSERT OR IGNORE INTO categories (id, name, type, color, icon, isActive, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
        [id, category.name, category.type, category.color, category.icon, now, now]
      );
    }
  }

  async insertDefaultSettings() {
    const defaultSettings = [
      { key: 'currency', value: 'USD' },
      { key: 'theme', value: 'system' },
      { key: 'notifications', value: 'true' },
      { key: 'biometric', value: 'false' },
      { key: 'autoBackup', value: 'true' },
      { key: 'budgetWarnings', value: 'true' },
      { key: 'firstLaunch', value: 'true' }
    ];

    const now = new Date().toISOString();
    for (const setting of defaultSettings) {
      await this.db.runAsync(
        `INSERT OR IGNORE INTO settings (key, value, updatedAt) VALUES (?, ?, ?)`,
        [setting.key, setting.value, now]
      );
    }
  }

  // Transaction methods
  async addTransaction(transaction) {
    await this.initialize();
    const txn = transaction instanceof Transaction ? transaction : new Transaction(transaction);
    
    await this.db.runAsync(
      `INSERT INTO transactions (id, amount, type, category, subcategory, description, date, account, currency, tags, location, receipt, recurring, recurringPattern, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        txn.id, txn.amount, txn.type, txn.category, txn.subcategory, txn.description,
        txn.date.toISOString(), txn.account, txn.currency, JSON.stringify(txn.tags),
        txn.location, txn.receipt, txn.recurring ? 1 : 0, JSON.stringify(txn.recurringPattern),
        txn.createdAt.toISOString(), txn.updatedAt.toISOString()
      ]
    );

    // Update budget if applicable
    if (txn.type === 'expense' && txn.category) {
      await this.updateBudgetSpending(txn.category, txn.amount);
    }

    return txn;
  }

  async getTransactions(limit = 100, offset = 0, filters = {}) {
    await this.initialize();
    let query = 'SELECT * FROM transactions WHERE 1=1';
    const params = [];

    if (filters.type) {
      query += ' AND type = ?';
      params.push(filters.type);
    }

    if (filters.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters.startDate) {
      query += ' AND date >= ?';
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      query += ' AND date <= ?';
      params.push(filters.endDate);
    }

    query += ' ORDER BY date DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const result = await this.db.getAllAsync(query, params);
    return result.map(row => {
      const txn = { ...row };
      txn.tags = JSON.parse(txn.tags || '[]');
      txn.recurringPattern = JSON.parse(txn.recurringPattern || 'null');
      txn.recurring = Boolean(txn.recurring);
      return Transaction.fromJSON(txn);
    });
  }

  async updateTransaction(id, updates) {
    await this.initialize();
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(new Date().toISOString(), id);

    await this.db.runAsync(
      `UPDATE transactions SET ${setClause}, updatedAt = ? WHERE id = ?`,
      values
    );
  }

  async deleteTransaction(id) {
    await this.initialize();
    await this.db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
  }

  // Budget methods
  async addBudget(budget) {
    await this.initialize();
    const bdg = budget instanceof Budget ? budget : new Budget(budget);
    
    await this.db.runAsync(
      `INSERT INTO budgets (id, name, category, amount, spent, period, startDate, endDate, currency, color, icon, notifications, warningThreshold, isActive, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bdg.id, bdg.name, bdg.category, bdg.amount, bdg.spent, bdg.period,
        bdg.startDate.toISOString(), bdg.endDate.toISOString(), bdg.currency,
        bdg.color, bdg.icon, bdg.notifications ? 1 : 0, bdg.warningThreshold,
        bdg.isActive ? 1 : 0, bdg.createdAt.toISOString(), bdg.updatedAt.toISOString()
      ]
    );

    return bdg;
  }

  async getBudgets(activeOnly = true) {
    await this.initialize();
    let query = 'SELECT * FROM budgets';
    if (activeOnly) {
      query += ' WHERE isActive = 1';
    }
    query += ' ORDER BY createdAt DESC';

    const result = await this.db.getAllAsync(query);
    return result.map(row => {
      const bdg = { ...row };
      bdg.notifications = Boolean(bdg.notifications);
      bdg.isActive = Boolean(bdg.isActive);
      return Budget.fromJSON(bdg);
    });
  }

  async updateBudgetSpending(category, amount) {
    await this.initialize();
    await this.db.runAsync(
      `UPDATE budgets SET spent = spent + ?, updatedAt = ? WHERE category = ? AND isActive = 1`,
      [amount, new Date().toISOString(), category]
    );
  }

  // Settings methods
  async getSetting(key) {
    await this.initialize();
    const result = await this.db.getFirstAsync('SELECT value FROM settings WHERE key = ?', [key]);
    return result ? result.value : null;
  }

  async setSetting(key, value) {
    await this.initialize();
    const now = new Date().toISOString();
    await this.db.runAsync(
      `INSERT OR REPLACE INTO settings (key, value, updatedAt) VALUES (?, ?, ?)`,
      [key, value, now]
    );
  }

  // Analytics methods
  async getTransactionSummary(startDate, endDate) {
    await this.initialize();
    const result = await this.db.getAllAsync(
      `SELECT type, SUM(amount) as total FROM transactions 
       WHERE date >= ? AND date <= ? 
       GROUP BY type`,
      [startDate, endDate]
    );

    const summary = { income: 0, expense: 0, transfer: 0 };
    result.forEach(row => {
      summary[row.type] = row.total;
    });

    return summary;
  }

  async getCategoryBreakdown(type, startDate, endDate) {
    await this.initialize();
    return await this.db.getAllAsync(
      `SELECT category, SUM(amount) as total, COUNT(*) as count 
       FROM transactions 
       WHERE type = ? AND date >= ? AND date <= ? 
       GROUP BY category 
       ORDER BY total DESC`,
      [type, startDate, endDate]
    );
  }

  async getMonthlyTrends(months = 6) {
    await this.initialize();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    return await this.db.getAllAsync(
      `SELECT 
         strftime('%Y-%m', date) as month,
         type,
         SUM(amount) as total
       FROM transactions 
       WHERE date >= ? 
       GROUP BY month, type 
       ORDER BY month DESC`,
      [startDate.toISOString()]
    );
  }

  // Backup and restore methods
  async exportData() {
    await this.initialize();
    const transactions = await this.db.getAllAsync('SELECT * FROM transactions');
    const budgets = await this.db.getAllAsync('SELECT * FROM budgets');
    const categories = await this.db.getAllAsync('SELECT * FROM categories');
    const settings = await this.db.getAllAsync('SELECT * FROM settings');

    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      data: {
        transactions,
        budgets,
        categories,
        settings
      }
    };
  }

  async importData(backupData) {
    await this.initialize();
    
    // Start transaction
    await this.db.execAsync('BEGIN TRANSACTION');
    
    try {
      // Clear existing data (optional - could be made configurable)
      // await this.db.execAsync('DELETE FROM transactions');
      // await this.db.execAsync('DELETE FROM budgets');
      
      // Import transactions
      for (const txn of backupData.data.transactions) {
        await this.db.runAsync(
          `INSERT OR REPLACE INTO transactions (id, amount, type, category, subcategory, description, date, account, currency, tags, location, receipt, recurring, recurringPattern, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            txn.id, txn.amount, txn.type, txn.category, txn.subcategory, txn.description,
            txn.date, txn.account, txn.currency, txn.tags, txn.location, txn.receipt,
            txn.recurring, txn.recurringPattern, txn.createdAt, txn.updatedAt
          ]
        );
      }

      // Import budgets
      for (const bdg of backupData.data.budgets) {
        await this.db.runAsync(
          `INSERT OR REPLACE INTO budgets (id, name, category, amount, spent, period, startDate, endDate, currency, color, icon, notifications, warningThreshold, isActive, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            bdg.id, bdg.name, bdg.category, bdg.amount, bdg.spent, bdg.period,
            bdg.startDate, bdg.endDate, bdg.currency, bdg.color, bdg.icon,
            bdg.notifications, bdg.warningThreshold, bdg.isActive, bdg.createdAt, bdg.updatedAt
          ]
        );
      }

      await this.db.execAsync('COMMIT');
      return true;
    } catch (error) {
      await this.db.execAsync('ROLLBACK');
      throw error;
    }
  }
}

export default new DatabaseService();

