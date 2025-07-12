import { SUPPORTED_CURRENCIES, Currency } from '../models/Currency';
import DatabaseService from './DatabaseService';

class CurrencyService {
  constructor() {
    this.currencies = new Map();
    this.defaultCurrency = null;
    this.currentCurrency = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    // Load supported currencies
    SUPPORTED_CURRENCIES.forEach(currency => {
      this.currencies.set(currency.code, currency);
      if (currency.isDefault) {
        this.defaultCurrency = currency;
      }
    });

    // Load user's preferred currency from settings
    const savedCurrencyCode = await DatabaseService.getSetting('currency');
    if (savedCurrencyCode && this.currencies.has(savedCurrencyCode)) {
      this.currentCurrency = this.currencies.get(savedCurrencyCode);
    } else {
      this.currentCurrency = this.defaultCurrency;
    }

    // Load custom exchange rates
    await this.loadCustomExchangeRates();

    this.isInitialized = true;
  }

  async loadCustomExchangeRates() {
    try {
      const customRatesJson = await DatabaseService.getSetting('customExchangeRates');
      if (customRatesJson) {
        const customRates = JSON.parse(customRatesJson);
        Object.keys(customRates).forEach(code => {
          if (this.currencies.has(code)) {
            this.currencies.get(code).exchangeRate = customRates[code];
          }
        });
      }
    } catch (error) {
      console.error('Error loading custom exchange rates:', error);
    }
  }

  async saveCustomExchangeRates() {
    try {
      const customRates = {};
      this.currencies.forEach((currency, code) => {
        customRates[code] = currency.exchangeRate;
      });
      await DatabaseService.setSetting('customExchangeRates', JSON.stringify(customRates));
    } catch (error) {
      console.error('Error saving custom exchange rates:', error);
    }
  }

  getSupportedCurrencies() {
    return Array.from(this.currencies.values());
  }

  getCurrency(code) {
    return this.currencies.get(code);
  }

  getCurrentCurrency() {
    return this.currentCurrency;
  }

  getDefaultCurrency() {
    return this.defaultCurrency;
  }

  async setCurrentCurrency(currencyCode) {
    if (!this.currencies.has(currencyCode)) {
      throw new Error(`Unsupported currency: ${currencyCode}`);
    }

    this.currentCurrency = this.currencies.get(currencyCode);
    await DatabaseService.setSetting('currency', currencyCode);
  }

  async updateExchangeRate(currencyCode, rate) {
    if (!this.currencies.has(currencyCode)) {
      throw new Error(`Unsupported currency: ${currencyCode}`);
    }

    this.currencies.get(currencyCode).exchangeRate = parseFloat(rate);
    await this.saveCustomExchangeRates();
  }

  formatAmount(amount, currencyCode = null) {
    const currency = currencyCode ? this.getCurrency(currencyCode) : this.currentCurrency;
    if (!currency) {
      return `$${parseFloat(amount).toFixed(2)}`;
    }
    return currency.formatAmount(amount);
  }

  convertAmount(amount, fromCurrency, toCurrency) {
    const from = typeof fromCurrency === 'string' ? this.getCurrency(fromCurrency) : fromCurrency;
    const to = typeof toCurrency === 'string' ? this.getCurrency(toCurrency) : toCurrency;

    if (!from || !to) {
      throw new Error('Invalid currency for conversion');
    }

    // Convert to default currency first, then to target currency
    const defaultAmount = from.convertToDefault(amount);
    return to.convertFromDefault(defaultAmount);
  }

  convertToCurrentCurrency(amount, fromCurrencyCode) {
    return this.convertAmount(amount, fromCurrencyCode, this.currentCurrency.code);
  }

  convertFromCurrentCurrency(amount, toCurrencyCode) {
    return this.convertAmount(amount, this.currentCurrency.code, toCurrencyCode);
  }

  // Get exchange rate relative to current currency
  getExchangeRate(currencyCode) {
    const currency = this.getCurrency(currencyCode);
    if (!currency) return 1;

    return currency.exchangeRate / this.currentCurrency.exchangeRate;
  }

  // Format amount with proper currency symbol and positioning
  formatWithSymbol(amount, currencyCode = null) {
    const currency = currencyCode ? this.getCurrency(currencyCode) : this.currentCurrency;
    if (!currency) {
      return `$${parseFloat(amount).toFixed(2)}`;
    }

    const formattedAmount = parseFloat(amount).toLocaleString('en-US', {
      minimumFractionDigits: currency.decimalPlaces,
      maximumFractionDigits: currency.decimalPlaces
    });

    return currency.position === 'before' 
      ? `${currency.symbol}${formattedAmount}`
      : `${formattedAmount} ${currency.symbol}`;
  }

  // Get currency symbol
  getSymbol(currencyCode = null) {
    const currency = currencyCode ? this.getCurrency(currencyCode) : this.currentCurrency;
    return currency ? currency.symbol : '$';
  }

  // Get currency name
  getName(currencyCode = null) {
    const currency = currencyCode ? this.getCurrency(currencyCode) : this.currentCurrency;
    return currency ? currency.name : 'US Dollar';
  }

  // Parse amount from formatted string
  parseAmount(formattedAmount, currencyCode = null) {
    const currency = currencyCode ? this.getCurrency(currencyCode) : this.currentCurrency;
    if (!currency) {
      return parseFloat(formattedAmount.replace(/[^0-9.-]/g, ''));
    }

    // Remove currency symbol and formatting
    let cleanAmount = formattedAmount.replace(currency.symbol, '').trim();
    cleanAmount = cleanAmount.replace(/,/g, '');
    return parseFloat(cleanAmount) || 0;
  }

  // Get localized number format
  getNumberFormat(currencyCode = null) {
    const currency = currencyCode ? this.getCurrency(currencyCode) : this.currentCurrency;
    return {
      minimumFractionDigits: currency ? currency.decimalPlaces : 2,
      maximumFractionDigits: currency ? currency.decimalPlaces : 2
    };
  }

  // Add a new custom currency
  async addCustomCurrency(currencyData) {
    const currency = new Currency(currencyData);
    this.currencies.set(currency.code, currency);
    await this.saveCustomExchangeRates();
    return currency;
  }

  // Remove a custom currency
  async removeCustomCurrency(currencyCode) {
    if (this.currencies.has(currencyCode)) {
      const currency = this.currencies.get(currencyCode);
      if (!currency.isDefault) {
        this.currencies.delete(currencyCode);
        await this.saveCustomExchangeRates();
        return true;
      }
    }
    return false;
  }

  // Get currency statistics
  async getCurrencyStats() {
    const transactions = await DatabaseService.getTransactions(1000);
    const stats = {};

    transactions.forEach(transaction => {
      if (!stats[transaction.currency]) {
        stats[transaction.currency] = {
          count: 0,
          totalAmount: 0,
          currency: this.getCurrency(transaction.currency)
        };
      }
      stats[transaction.currency].count++;
      stats[transaction.currency].totalAmount += transaction.amount;
    });

    return stats;
  }
}

export default new CurrencyService();

