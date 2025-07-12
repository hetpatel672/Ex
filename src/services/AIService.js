import CryptoJS from 'crypto-js';

class AIService {
  constructor() {
    this.categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education'];
    this.commonMerchants = {
      'Food': ['McDonald\'s', 'Starbucks', 'Subway', 'Pizza Hut', 'KFC', 'Grocery Store'],
      'Transport': ['Gas Station', 'Uber', 'Taxi', 'Bus Ticket', 'Train Ticket', 'Parking'],
      'Shopping': ['Amazon', 'Target', 'Walmart', 'Best Buy', 'Clothing Store', 'Electronics'],
      'Bills': ['Electric Bill', 'Water Bill', 'Internet', 'Phone Bill', 'Rent', 'Insurance'],
      'Entertainment': ['Netflix', 'Cinema', 'Concert', 'Gaming', 'Sports Event', 'Streaming'],
      'Health': ['Pharmacy', 'Doctor Visit', 'Dentist', 'Hospital', 'Gym Membership', 'Supplements'],
      'Education': ['Books', 'Course Fee', 'School Supplies', 'Online Course', 'Workshop', 'Certification']
    };
  }

  // Smart category suggestion based on transaction title
  suggestCategory(title) {
    const titleLower = title.toLowerCase();
    
    for (const [category, merchants] of Object.entries(this.commonMerchants)) {
      for (const merchant of merchants) {
        if (titleLower.includes(merchant.toLowerCase())) {
          return category;
        }
      }
    }

    // Keyword-based suggestions
    const keywords = {
      'Food': ['restaurant', 'cafe', 'food', 'lunch', 'dinner', 'breakfast', 'grocery', 'market'],
      'Transport': ['gas', 'fuel', 'uber', 'taxi', 'bus', 'train', 'parking', 'toll'],
      'Shopping': ['store', 'shop', 'mall', 'amazon', 'online', 'purchase', 'buy'],
      'Bills': ['bill', 'utility', 'electric', 'water', 'internet', 'phone', 'rent', 'insurance'],
      'Entertainment': ['movie', 'cinema', 'game', 'concert', 'show', 'streaming', 'netflix'],
      'Health': ['pharmacy', 'doctor', 'hospital', 'medical', 'health', 'gym', 'fitness'],
      'Education': ['book', 'course', 'school', 'education', 'learning', 'training']
    };

    for (const [category, words] of Object.entries(keywords)) {
      for (const word of words) {
        if (titleLower.includes(word)) {
          return category;
        }
      }
    }

    return 'Shopping'; // Default category
  }

  // Auto-fill suggestions based on partial input
  getAutoFillSuggestions(partialTitle, category = null) {
    const suggestions = [];
    const titleLower = partialTitle.toLowerCase();

    if (category && this.commonMerchants[category]) {
      // Category-specific suggestions
      const merchants = this.commonMerchants[category];
      for (const merchant of merchants) {
        if (merchant.toLowerCase().includes(titleLower)) {
          suggestions.push(merchant);
        }
      }
    } else {
      // General suggestions from all categories
      for (const merchants of Object.values(this.commonMerchants)) {
        for (const merchant of merchants) {
          if (merchant.toLowerCase().includes(titleLower)) {
            suggestions.push(merchant);
          }
        }
      }
    }

    return suggestions.slice(0, 5); // Return top 5 suggestions
  }

  // Detect recurring transactions
  detectRecurringTransactions(transactions) {
    const recurringPatterns = [];
    const groupedByTitle = {};

    // Group transactions by similar titles
    transactions.forEach(transaction => {
      const normalizedTitle = this.normalizeTitle(transaction.title);
      if (!groupedByTitle[normalizedTitle]) {
        groupedByTitle[normalizedTitle] = [];
      }
      groupedByTitle[normalizedTitle].push(transaction);
    });

    // Analyze patterns
    for (const [title, transactionGroup] of Object.entries(groupedByTitle)) {
      if (transactionGroup.length >= 3) {
        const intervals = this.calculateIntervals(transactionGroup);
        const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
        
        if (avgInterval >= 25 && avgInterval <= 35) { // Monthly pattern
          recurringPatterns.push({
            title,
            frequency: 'monthly',
            avgAmount: transactionGroup.reduce((sum, t) => sum + Math.abs(t.amount), 0) / transactionGroup.length,
            confidence: this.calculateConfidence(intervals)
          });
        } else if (avgInterval >= 6 && avgInterval <= 8) { // Weekly pattern
          recurringPatterns.push({
            title,
            frequency: 'weekly',
            avgAmount: transactionGroup.reduce((sum, t) => sum + Math.abs(t.amount), 0) / transactionGroup.length,
            confidence: this.calculateConfidence(intervals)
          });
        }
      }
    }

    return recurringPatterns;
  }

  // Generate budget recommendations
  generateBudgetRecommendations(transactions, currentBudgets) {
    const recommendations = [];
    const categorySpending = this.analyzeCategorySpending(transactions);

    for (const [category, spending] of Object.entries(categorySpending)) {
      const currentBudget = currentBudgets.find(b => b.category === category);
      const avgMonthlySpending = spending.total / Math.max(1, spending.months);

      if (!currentBudget) {
        // Suggest new budget
        recommendations.push({
          type: 'new_budget',
          category,
          suggestedAmount: Math.ceil(avgMonthlySpending * 1.1), // 10% buffer
          reason: `Based on your average monthly spending of $${avgMonthlySpending.toFixed(2)}`
        });
      } else {
        const utilizationRate = spending.total / currentBudget.budgetAmount;
        
        if (utilizationRate > 1.2) {
          // Suggest budget increase
          recommendations.push({
            type: 'increase_budget',
            category,
            currentAmount: currentBudget.budgetAmount,
            suggestedAmount: Math.ceil(avgMonthlySpending * 1.15),
            reason: `You're consistently exceeding this budget by ${((utilizationRate - 1) * 100).toFixed(1)}%`
          });
        } else if (utilizationRate < 0.7) {
          // Suggest budget decrease
          recommendations.push({
            type: 'decrease_budget',
            category,
            currentAmount: currentBudget.budgetAmount,
            suggestedAmount: Math.ceil(avgMonthlySpending * 1.05),
            reason: `You're only using ${(utilizationRate * 100).toFixed(1)}% of this budget`
          });
        }
      }
    }

    return recommendations;
  }

  // Generate spending insights
  generateSpendingInsights(transactions) {
    const insights = [];
    const categorySpending = this.analyzeCategorySpending(transactions);
    const timePatterns = this.analyzeTimePatterns(transactions);
    const trends = this.analyzeTrends(transactions);

    // Category insights
    const topCategory = Object.entries(categorySpending)
      .sort(([,a], [,b]) => b.total - a.total)[0];
    
    if (topCategory) {
      insights.push({
        type: 'top_category',
        title: 'Highest Spending Category',
        description: `You spend the most on ${topCategory[0]} with $${topCategory[1].total.toFixed(2)} this period.`,
        icon: 'pie-chart',
        color: '#6366F1'
      });
    }

    // Time pattern insights
    if (timePatterns.weekendSpending > timePatterns.weekdaySpending * 1.3) {
      insights.push({
        type: 'weekend_spending',
        title: 'Weekend Spending Alert',
        description: `You spend ${((timePatterns.weekendSpending / timePatterns.weekdaySpending - 1) * 100).toFixed(1)}% more on weekends.`,
        icon: 'calendar',
        color: '#F59E0B'
      });
    }

    // Trend insights
    if (trends.monthlyGrowth > 0.15) {
      insights.push({
        type: 'spending_increase',
        title: 'Spending Increase',
        description: `Your spending has increased by ${(trends.monthlyGrowth * 100).toFixed(1)}% this month.`,
        icon: 'trending-up',
        color: '#EF4444'
      });
    } else if (trends.monthlyGrowth < -0.15) {
      insights.push({
        type: 'spending_decrease',
        title: 'Great Progress!',
        description: `You've reduced spending by ${Math.abs(trends.monthlyGrowth * 100).toFixed(1)}% this month.`,
        icon: 'trending-down',
        color: '#10B981'
      });
    }

    return insights;
  }

  // Helper methods
  normalizeTitle(title) {
    return title.toLowerCase()
      .replace(/\d+/g, '') // Remove numbers
      .replace(/[^\w\s]/g, '') // Remove special characters
      .trim();
  }

  calculateIntervals(transactions) {
    const sortedTransactions = transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
    const intervals = [];
    
    for (let i = 1; i < sortedTransactions.length; i++) {
      const prevDate = new Date(sortedTransactions[i - 1].date);
      const currentDate = new Date(sortedTransactions[i].date);
      const daysDiff = (currentDate - prevDate) / (1000 * 60 * 60 * 24);
      intervals.push(daysDiff);
    }
    
    return intervals;
  }

  calculateConfidence(intervals) {
    if (intervals.length === 0) return 0;
    
    const avg = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avg, 2), 0) / intervals.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Lower standard deviation = higher confidence
    return Math.max(0, Math.min(1, 1 - (standardDeviation / avg)));
  }

  analyzeCategorySpending(transactions) {
    const categoryData = {};
    const now = new Date();
    const monthsBack = 6;
    
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      const monthsDiff = (now - transactionDate) / (1000 * 60 * 60 * 24 * 30);
      
      if (monthsDiff <= monthsBack && transaction.amount < 0) {
        const category = transaction.category;
        if (!categoryData[category]) {
          categoryData[category] = { total: 0, months: monthsBack };
        }
        categoryData[category].total += Math.abs(transaction.amount);
      }
    });
    
    return categoryData;
  }

  analyzeTimePatterns(transactions) {
    let weekendSpending = 0;
    let weekdaySpending = 0;
    
    transactions.forEach(transaction => {
      if (transaction.amount < 0) {
        const date = new Date(transaction.date);
        const dayOfWeek = date.getDay();
        
        if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
          weekendSpending += Math.abs(transaction.amount);
        } else {
          weekdaySpending += Math.abs(transaction.amount);
        }
      }
    });
    
    return { weekendSpending, weekdaySpending };
  }

  analyzeTrends(transactions) {
    const now = new Date();
    const thisMonth = now.getMonth();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    
    let thisMonthSpending = 0;
    let lastMonthSpending = 0;
    
    transactions.forEach(transaction => {
      if (transaction.amount < 0) {
        const date = new Date(transaction.date);
        const month = date.getMonth();
        
        if (month === thisMonth) {
          thisMonthSpending += Math.abs(transaction.amount);
        } else if (month === lastMonth) {
          lastMonthSpending += Math.abs(transaction.amount);
        }
      }
    });
    
    const monthlyGrowth = lastMonthSpending > 0 ? 
      (thisMonthSpending - lastMonthSpending) / lastMonthSpending : 0;
    
    return { monthlyGrowth, thisMonthSpending, lastMonthSpending };
  }

  // OCR simulation for receipt processing
  processReceiptOCR(imageData) {
    // Simulate OCR processing
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock OCR result
        const mockResults = [
          {
            title: 'Grocery Store',
            amount: 45.67,
            category: 'Food',
            date: new Date().toISOString().split('T')[0],
            confidence: 0.85
          },
          {
            title: 'Gas Station',
            amount: 32.50,
            category: 'Transport',
            date: new Date().toISOString().split('T')[0],
            confidence: 0.92
          },
          {
            title: 'Coffee Shop',
            amount: 8.75,
            category: 'Food',
            date: new Date().toISOString().split('T')[0],
            confidence: 0.78
          }
        ];
        
        const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
        resolve(randomResult);
      }, 1500);
    });
  }
}

export default new AIService();

