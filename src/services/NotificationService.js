import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  constructor() {
    this.isInitialized = false;
    this.notificationTypes = {
      BUDGET_ALERT: 'budget_alert',
      SPENDING_REMINDER: 'spending_reminder',
      BILL_REMINDER: 'bill_reminder',
      SAVINGS_GOAL: 'savings_goal',
      AI_INSIGHT: 'ai_insight',
      BACKUP_REMINDER: 'backup_reminder',
      RECURRING_TRANSACTION: 'recurring_transaction'
    };
  }

  // Initialize notification permissions
  async initialize() {
    if (this.isInitialized) return true;

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted');
        return false;
      }

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#6366F1',
        });

        await Notifications.setNotificationChannelAsync('budget_alerts', {
          name: 'Budget Alerts',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#EF4444',
        });

        await Notifications.setNotificationChannelAsync('ai_insights', {
          name: 'AI Insights',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250],
          lightColor: '#10B981',
        });
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      return false;
    }
  }

  // Schedule a local notification
  async scheduleNotification(options) {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) return null;
    }

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: options.title,
          body: options.body,
          data: options.data || {},
          sound: options.sound !== false,
          priority: options.priority || Notifications.AndroidImportance.DEFAULT,
        },
        trigger: options.trigger || null,
      });

      return notificationId;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      return null;
    }
  }

  // Send immediate notification
  async sendNotification(title, body, data = {}, type = 'default') {
    return await this.scheduleNotification({
      title,
      body,
      data: { ...data, type },
      trigger: null, // Immediate
    });
  }

  // Budget alert notifications
  async sendBudgetAlert(category, spentAmount, budgetAmount, percentage) {
    const title = `Budget Alert: ${category}`;
    let body;
    let priority = Notifications.AndroidImportance.DEFAULT;

    if (percentage >= 100) {
      body = `You've exceeded your ${category} budget! Spent $${spentAmount.toFixed(2)} of $${budgetAmount.toFixed(2)}`;
      priority = Notifications.AndroidImportance.HIGH;
    } else if (percentage >= 80) {
      body = `You've used ${percentage.toFixed(1)}% of your ${category} budget ($${spentAmount.toFixed(2)} of $${budgetAmount.toFixed(2)})`;
      priority = Notifications.AndroidImportance.DEFAULT;
    } else {
      return; // Don't send notification for lower percentages
    }

    return await this.scheduleNotification({
      title,
      body,
      data: {
        type: this.notificationTypes.BUDGET_ALERT,
        category,
        spentAmount,
        budgetAmount,
        percentage
      },
      priority,
    });
  }

  // AI insight notifications
  async sendAIInsight(insight) {
    const title = insight.title || 'AI Insight';
    const body = insight.description;

    return await this.scheduleNotification({
      title,
      body,
      data: {
        type: this.notificationTypes.AI_INSIGHT,
        insight
      },
    });
  }

  // Spending reminder notifications
  async sendSpendingReminder(amount, period = 'today') {
    const title = 'Spending Reminder';
    const body = `You've spent $${amount.toFixed(2)} ${period}. Stay mindful of your budget!`;

    return await this.scheduleNotification({
      title,
      body,
      data: {
        type: this.notificationTypes.SPENDING_REMINDER,
        amount,
        period
      },
    });
  }

  // Bill reminder notifications
  async sendBillReminder(billName, amount, dueDate) {
    const title = 'Bill Reminder';
    const body = `${billName} ($${amount.toFixed(2)}) is due on ${dueDate}`;

    // Schedule for 3 days before due date
    const dueDateObj = new Date(dueDate);
    const reminderDate = new Date(dueDateObj.getTime() - (3 * 24 * 60 * 60 * 1000));

    return await this.scheduleNotification({
      title,
      body,
      data: {
        type: this.notificationTypes.BILL_REMINDER,
        billName,
        amount,
        dueDate
      },
      trigger: {
        date: reminderDate,
      },
    });
  }

  // Savings goal notifications
  async sendSavingsGoalUpdate(goalName, currentAmount, targetAmount, percentage) {
    const title = 'Savings Goal Update';
    let body;

    if (percentage >= 100) {
      body = `Congratulations! You've reached your ${goalName} goal of $${targetAmount.toFixed(2)}!`;
    } else if (percentage >= 75) {
      body = `You're ${percentage.toFixed(1)}% towards your ${goalName} goal! Only $${(targetAmount - currentAmount).toFixed(2)} to go!`;
    } else if (percentage >= 50) {
      body = `Halfway there! You've saved $${currentAmount.toFixed(2)} towards your ${goalName} goal.`;
    } else {
      return; // Don't send for lower percentages
    }

    return await this.scheduleNotification({
      title,
      body,
      data: {
        type: this.notificationTypes.SAVINGS_GOAL,
        goalName,
        currentAmount,
        targetAmount,
        percentage
      },
    });
  }

  // Backup reminder notifications
  async sendBackupReminder() {
    const title = 'Backup Reminder';
    const body = 'It\'s been a while since your last backup. Secure your financial data now!';

    return await this.scheduleNotification({
      title,
      body,
      data: {
        type: this.notificationTypes.BACKUP_REMINDER
      },
    });
  }

  // Recurring transaction notifications
  async sendRecurringTransactionReminder(transactionTitle, amount, frequency) {
    const title = 'Recurring Transaction';
    const body = `Don't forget to record your ${frequency} ${transactionTitle} ($${Math.abs(amount).toFixed(2)})`;

    return await this.scheduleNotification({
      title,
      body,
      data: {
        type: this.notificationTypes.RECURRING_TRANSACTION,
        transactionTitle,
        amount,
        frequency
      },
    });
  }

  // Schedule daily spending summary
  async scheduleDailySpendingSummary() {
    const title = 'Daily Spending Summary';
    const body = 'Check your spending summary for today';

    // Schedule for 8 PM every day
    return await this.scheduleNotification({
      title,
      body,
      data: {
        type: 'daily_summary'
      },
      trigger: {
        hour: 20,
        minute: 0,
        repeats: true,
      },
    });
  }

  // Schedule weekly budget review
  async scheduleWeeklyBudgetReview() {
    const title = 'Weekly Budget Review';
    const body = 'Time to review your weekly spending and budgets';

    // Schedule for Sunday at 6 PM
    return await this.scheduleNotification({
      title,
      body,
      data: {
        type: 'weekly_review'
      },
      trigger: {
        weekday: 1, // Sunday
        hour: 18,
        minute: 0,
        repeats: true,
      },
    });
  }

  // Schedule monthly backup reminder
  async scheduleMonthlyBackupReminder() {
    const title = 'Monthly Backup';
    const body = 'Time for your monthly data backup to keep your information safe';

    // Schedule for the 1st of every month at 10 AM
    return await this.scheduleNotification({
      title,
      body,
      data: {
        type: this.notificationTypes.BACKUP_REMINDER
      },
      trigger: {
        day: 1,
        hour: 10,
        minute: 0,
        repeats: true,
      },
    });
  }

  // Cancel a specific notification
  async cancelNotification(notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      return true;
    } catch (error) {
      console.error('Failed to cancel notification:', error);
      return false;
    }
  }

  // Cancel all notifications
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      return true;
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
      return false;
    }
  }

  // Get all scheduled notifications
  async getScheduledNotifications() {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to get scheduled notifications:', error);
      return [];
    }
  }

  // Handle notification response (when user taps notification)
  addNotificationResponseListener(callback) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  // Handle notification received while app is in foreground
  addNotificationReceivedListener(callback) {
    return Notifications.addNotificationReceivedListener(callback);
  }

  // Smart notification scheduling based on user behavior
  async scheduleSmartNotifications(userPreferences, spendingPatterns) {
    const notifications = [];

    // Budget alerts based on spending velocity
    if (userPreferences.budgetAlerts) {
      for (const pattern of spendingPatterns.categories) {
        if (pattern.velocityRisk > 0.8) {
          const notificationId = await this.sendBudgetAlert(
            pattern.category,
            pattern.currentSpent,
            pattern.budget,
            (pattern.currentSpent / pattern.budget) * 100
          );
          if (notificationId) notifications.push(notificationId);
        }
      }
    }

    // Spending reminders for high-spending days
    if (userPreferences.spendingReminders && spendingPatterns.dailyAverage > 0) {
      const today = new Date();
      const todaySpending = spendingPatterns.todaySpending || 0;
      
      if (todaySpending > spendingPatterns.dailyAverage * 1.5) {
        const notificationId = await this.sendSpendingReminder(todaySpending, 'today');
        if (notificationId) notifications.push(notificationId);
      }
    }

    return notifications;
  }

  // Group notifications to avoid spam
  async groupNotifications(notifications, maxPerHour = 3) {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    // Get recent notifications
    const recentNotifications = await this.getScheduledNotifications();
    const recentCount = recentNotifications.filter(notification => {
      const scheduledTime = new Date(notification.trigger?.date || now);
      return scheduledTime > oneHourAgo;
    }).length;

    // If we're approaching the limit, group remaining notifications
    if (recentCount >= maxPerHour - 1 && notifications.length > 1) {
      const groupedTitle = 'Financial Updates';
      const groupedBody = `You have ${notifications.length} financial updates. Tap to view details.`;
      
      return await this.scheduleNotification({
        title: groupedTitle,
        body: groupedBody,
        data: {
          type: 'grouped',
          notifications: notifications.map(n => n.data)
        },
      });
    }

    return notifications;
  }
}

export default new NotificationService();

