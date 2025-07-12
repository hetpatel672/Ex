import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

import BalanceCard from '../components/BalanceCard';
import QuickAddButton from '../components/QuickAddButton';
import RecentTransactions from '../components/RecentTransactions';
import DatabaseService from '../services/DatabaseService';
import CurrencyService from '../services/CurrencyService';
import { colors, gradients, shadows } from '../theme/colors';

const { width: screenWidth } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [savingsRate, setSavingsRate] = useState(0);
  const [weeklyData, setWeeklyData] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [trendData, setTrendData] = useState(null);

  useEffect(() => {
    loadDashboardData();
    CurrencyService.initialize();
  }, []);

  const loadDashboardData = async () => {
    try {
      await DatabaseService.initialize();
      
      // Get current month data
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const summary = await DatabaseService.getTransactionSummary(
        startOfMonth.toISOString(),
        endOfMonth.toISOString()
      );

      const monthlyIncome = summary.income || 0;
      const monthlyExpense = summary.expense || 0;
      const currentBalance = monthlyIncome - monthlyExpense;
      const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpense) / monthlyIncome) * 100 : 0;

      setBalance(currentBalance);
      setIncome(monthlyIncome);
      setExpense(monthlyExpense);
      setSavingsRate(Math.max(0, savingsRate));

      // Load weekly spending data
      await loadWeeklyData();
      
      // Load category breakdown
      await loadCategoryData();
      
      // Load trend data
      await loadTrendData();
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const loadWeeklyData = async () => {
    try {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      // Get daily expenses for the last 7 days
      const transactions = await DatabaseService.getTransactions(100, 0, {
        type: 'expense',
        startDate: weekAgo.toISOString(),
        endDate: now.toISOString()
      });

      const dailyExpenses = {};
      const labels = [];
      
      // Initialize last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayKey = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dateKey = date.toDateString();
        dailyExpenses[dateKey] = 0;
        labels.push(dayKey);
      }

      // Sum expenses by day
      transactions.forEach(transaction => {
        const transactionDate = new Date(transaction.date);
        const dateKey = transactionDate.toDateString();
        if (dailyExpenses.hasOwnProperty(dateKey)) {
          dailyExpenses[dateKey] += transaction.amount;
        }
      });

      const data = Object.values(dailyExpenses);

      setWeeklyData({
        labels,
        datasets: [{
          data: data.length > 0 ? data : [0, 0, 0, 0, 0, 0, 0],
          color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
          strokeWidth: 3,
        }],
      });
    } catch (error) {
      console.error('Error loading weekly data:', error);
    }
  };

  const loadCategoryData = async () => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const categoryBreakdown = await DatabaseService.getCategoryBreakdown(
        'expense',
        startOfMonth.toISOString(),
        now.toISOString()
      );

      const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
      const pieData = categoryBreakdown.slice(0, 5).map((item, index) => ({
        name: item.category || 'Other',
        population: item.total,
        color: colors[index % colors.length],
        legendFontColor: '#374151',
        legendFontSize: 12,
      }));

      setCategoryData(pieData);
    } catch (error) {
      console.error('Error loading category data:', error);
    }
  };

  const loadTrendData = async () => {
    try {
      const trends = await DatabaseService.getMonthlyTrends(6);
      
      const monthlyData = {};
      trends.forEach(trend => {
        if (!monthlyData[trend.month]) {
          monthlyData[trend.month] = { income: 0, expense: 0 };
        }
        monthlyData[trend.month][trend.type] = trend.total;
      });

      const sortedMonths = Object.keys(monthlyData).sort();
      const labels = sortedMonths.map(month => {
        const [year, monthNum] = month.split('-');
        return new Date(year, monthNum - 1).toLocaleDateString('en-US', { month: 'short' });
      });

      const balanceData = sortedMonths.map(month => {
        const data = monthlyData[month];
        return data.income - data.expense;
      });

      if (labels.length > 0) {
        setTrendData({
          labels,
          datasets: [{
            data: balanceData,
            color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
            strokeWidth: 3,
          }],
        });
      }
    } catch (error) {
      console.error('Error loading trend data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleQuickAdd = (type) => {
    // Navigate to add transaction screen with pre-selected type
    navigation.navigate('Transactions', { 
      screen: 'AddTransaction', 
      params: { type } 
    });
  };

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: 'transparent',
    backgroundGradientTo: 'transparent',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#6366f1',
    },
  };

  return (
    <LinearGradient 
      colors={['#f0f9ff', '#e0e7ff', '#ede9fe']} 
      style={styles.container}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>BudgetWise</Text>
            <Text style={styles.subtitle}>Your financial overview</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <LinearGradient
              colors={['#6366f1', '#8b5cf6']}
              style={styles.profileGradient}
            >
              <Text style={styles.profileText}>B</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Balance Cards */}
        <View style={styles.balanceSection}>
          <View style={styles.balanceRow}>
            <View style={styles.balanceCardHalf}>
              <BalanceCard
                title="Balance"
                amount={balance}
                icon="wallet"
                gradient={['#10b981', '#059669']}
                isAnimated
                currency={CurrencyService.getSymbol()}
              />
            </View>
            <View style={styles.balanceCardHalf}>
              <BalanceCard
                title="Savings Rate"
                amount={savingsRate}
                icon="trending-up"
                gradient={['#6366f1', '#4f46e5']}
                isPercentage
                isAnimated
              />
            </View>
          </View>

          <View style={styles.balanceRow}>
            <View style={styles.balanceCardHalf}>
              <BalanceCard
                title="Income"
                amount={income}
                icon="add-circle"
                gradient={['#059669', '#047857']}
                isAnimated
                currency={CurrencyService.getSymbol()}
              />
            </View>
            <View style={styles.balanceCardHalf}>
              <BalanceCard
                title="Expense"
                amount={expense}
                icon="remove-circle"
                gradient={['#ef4444', '#dc2626']}
                isAnimated
                currency={CurrencyService.getSymbol()}
              />
            </View>
          </View>
        </View>

        {/* Quick Add Buttons */}
        <View style={styles.quickAddSection}>
          <View style={styles.quickAddRow}>
            <QuickAddButton 
              type="income" 
              onPress={() => handleQuickAdd('income')} 
            />
            <QuickAddButton 
              type="expense" 
              onPress={() => handleQuickAdd('expense')} 
            />
            <QuickAddButton 
              type="transfer" 
              onPress={() => handleQuickAdd('transfer')} 
            />
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
              <Text style={styles.viewAllButton}>View All</Text>
            </TouchableOpacity>
          </View>
          <RecentTransactions 
            limit={5} 
            onTransactionPress={(transaction) => {
              // Navigate to transaction details
              console.log('Transaction pressed:', transaction);
            }}
          />
        </View>

        {/* Charts Section */}
        {weeklyData && (
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>Weekly Spending</Text>
            <View style={[styles.chartContainer, shadows.medium]}>
              <BarChart
                data={weeklyData}
                width={screenWidth - 60}
                height={200}
                chartConfig={chartConfig}
                style={styles.chart}
                showValuesOnTopOfBars
              />
            </View>
          </View>
        )}

        {categoryData.length > 0 && (
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>Expense Categories</Text>
            <View style={[styles.chartContainer, shadows.medium]}>
              <PieChart
                data={categoryData}
                width={screenWidth - 60}
                height={200}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                style={styles.chart}
              />
            </View>
          </View>
        )}

        {trendData && (
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>Balance Trend</Text>
            <View style={[styles.chartContainer, shadows.medium]}>
              <LineChart
                data={trendData}
                width={screenWidth - 60}
                height={200}
                chartConfig={chartConfig}
                style={styles.chart}
                bezier
              />
            </View>
          </View>
        )}

        {/* Bottom padding for navigation */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profileGradient: {
    flex: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  balanceSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  balanceRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  balanceCardHalf: {
    flex: 1,
    marginHorizontal: 6,
  },
  quickAddSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  quickAddRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  viewAllButton: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
  chartSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  chart: {
    borderRadius: 16,
  },
  bottomPadding: {
    height: 100,
  },
});

export default HomeScreen;

