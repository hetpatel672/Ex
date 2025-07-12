export class Budget {
  constructor({
    id = null,
    name = '',
    category = '',
    amount = 0,
    spent = 0,
    period = 'monthly', // 'weekly', 'monthly', 'yearly'
    startDate = new Date(),
    endDate = null,
    currency = 'USD',
    color = '#6366f1',
    icon = 'wallet',
    notifications = true,
    warningThreshold = 80, // percentage
    isActive = true,
    createdAt = new Date(),
    updatedAt = new Date()
  }) {
    this.id = id || this.generateId();
    this.name = name;
    this.category = category;
    this.amount = parseFloat(amount);
    this.spent = parseFloat(spent);
    this.period = period;
    this.startDate = new Date(startDate);
    this.endDate = endDate ? new Date(endDate) : this.calculateEndDate();
    this.currency = currency;
    this.color = color;
    this.icon = icon;
    this.notifications = notifications;
    this.warningThreshold = warningThreshold;
    this.isActive = isActive;
    this.createdAt = new Date(createdAt);
    this.updatedAt = new Date(updatedAt);
  }

  generateId() {
    return 'budget_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  calculateEndDate() {
    const end = new Date(this.startDate);
    switch (this.period) {
      case 'weekly':
        end.setDate(end.getDate() + 7);
        break;
      case 'monthly':
        end.setMonth(end.getMonth() + 1);
        break;
      case 'yearly':
        end.setFullYear(end.getFullYear() + 1);
        break;
      default:
        end.setMonth(end.getMonth() + 1);
    }
    return end;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      category: this.category,
      amount: this.amount,
      spent: this.spent,
      period: this.period,
      startDate: this.startDate.toISOString(),
      endDate: this.endDate.toISOString(),
      currency: this.currency,
      color: this.color,
      icon: this.icon,
      notifications: this.notifications,
      warningThreshold: this.warningThreshold,
      isActive: this.isActive,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }

  static fromJSON(json) {
    return new Budget(json);
  }

  update(updates) {
    Object.keys(updates).forEach(key => {
      if (key !== 'id' && key !== 'createdAt') {
        this[key] = updates[key];
      }
    });
    this.updatedAt = new Date();
  }

  getProgress() {
    return this.amount > 0 ? (this.spent / this.amount) * 100 : 0;
  }

  getRemaining() {
    return Math.max(0, this.amount - this.spent);
  }

  isOverBudget() {
    return this.spent > this.amount;
  }

  isNearLimit() {
    return this.getProgress() >= this.warningThreshold;
  }

  getDaysRemaining() {
    const now = new Date();
    const timeDiff = this.endDate.getTime() - now.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  addExpense(amount) {
    this.spent += parseFloat(amount);
    this.updatedAt = new Date();
  }

  removeExpense(amount) {
    this.spent = Math.max(0, this.spent - parseFloat(amount));
    this.updatedAt = new Date();
  }

  getFormattedAmount(currencySymbol = '$') {
    return `${currencySymbol}${this.amount.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  }

  getFormattedSpent(currencySymbol = '$') {
    return `${currencySymbol}${this.spent.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  }

  getFormattedRemaining(currencySymbol = '$') {
    return `${currencySymbol}${this.getRemaining().toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  }
}

export default Budget;

