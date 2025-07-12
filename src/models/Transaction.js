export class Transaction {
  constructor({
    id = null,
    amount = 0,
    type = 'expense', // 'income', 'expense', 'transfer'
    category = '',
    subcategory = '',
    description = '',
    date = new Date(),
    account = 'main',
    currency = 'USD',
    tags = [],
    location = null,
    receipt = null,
    recurring = false,
    recurringPattern = null,
    createdAt = new Date(),
    updatedAt = new Date()
  }) {
    this.id = id || this.generateId();
    this.amount = parseFloat(amount);
    this.type = type;
    this.category = category;
    this.subcategory = subcategory;
    this.description = description;
    this.date = new Date(date);
    this.account = account;
    this.currency = currency;
    this.tags = Array.isArray(tags) ? tags : [];
    this.location = location;
    this.receipt = receipt;
    this.recurring = recurring;
    this.recurringPattern = recurringPattern;
    this.createdAt = new Date(createdAt);
    this.updatedAt = new Date(updatedAt);
  }

  generateId() {
    return 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  toJSON() {
    return {
      id: this.id,
      amount: this.amount,
      type: this.type,
      category: this.category,
      subcategory: this.subcategory,
      description: this.description,
      date: this.date.toISOString(),
      account: this.account,
      currency: this.currency,
      tags: this.tags,
      location: this.location,
      receipt: this.receipt,
      recurring: this.recurring,
      recurringPattern: this.recurringPattern,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }

  static fromJSON(json) {
    return new Transaction(json);
  }

  update(updates) {
    Object.keys(updates).forEach(key => {
      if (key !== 'id' && key !== 'createdAt') {
        this[key] = updates[key];
      }
    });
    this.updatedAt = new Date();
  }

  getFormattedAmount(currencySymbol = '$') {
    return `${currencySymbol}${this.amount.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  }

  isIncome() {
    return this.type === 'income';
  }

  isExpense() {
    return this.type === 'expense';
  }

  isTransfer() {
    return this.type === 'transfer';
  }
}

export default Transaction;

