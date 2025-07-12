import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { LineChart, BarChart, ContributionGraph } from 'react-native-chart-kit';

import { colors, gradients, shadows } from '../theme/colors';

const { width: screenWidth } = Dimensions.get('window');

const ReportsScreen = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('overview');

  const periods = [
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'quarter', label: 'Quarter' },
    { key: 'year', label: 'Year' },
  ];

  const reportTypes = [
    { key: 'overview', label: 'Overview', icon: 'pie-chart' },
    { key: 'trends', label: 'Trends', icon: 'trending-up' },
    { key: 'heatmap', label: 'Heatmap', icon: 'grid' },
    { key: 'categories', label: 'Categories', icon: 'list' },
  ];

  // Mock data for charts
  const incomeVsExpenseData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [3500, 3200, 3800, 3600, 3900, 3500],
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
        strokeWidth: 3,
      },
      {
        data: [2800, 3100, 2900, 3200, 2700, 3200],
        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
        strokeWidth: 3,
      },
    ],
    legend: ['Income', 'Expense'],
  };

  const trendData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        data: [850, 920, 780, 1100],
        color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  const categoryData = {
    labels: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment'],
    datasets: [
      {
        data: [850, 420, 680, 1250, 320],
        colors: [
          (opacity = 1) => colors.chartPrimary,
          (opacity = 1) => colors.chartSecondary,
          (opacity = 1) => colors.chartTertiary,
          (opacity = 1) => colors.chartQuaternary,
          (opacity = 1) => colors.chartQuinary,
        ],
      },
    ],
  };

  // Heatmap data (simplified for demo)
  const heatmapData = [
    { date: '2025-01-01', count: 1 },
    { date: '2025-01-02', count: 3 },
    { date: '2025-01-03', count: 0 },
    { date: '2025-01-04', count: 2 },
    { date: '2025-01-05', count: 4 },
    { date: '2025-01-06', count: 1 },
    { date: '2025-01-07', count: 2 },
  ];

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: 'transparent',
    backgroundGradientTo: 'transparent',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(30, 41, 59, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colors.primary,
    },
  };

  const exportReport = (format) => {
    Alert.alert(
      'Export Report',
      `Report will be exported as ${format.toUpperCase()}`,
      [{ text: 'OK' }]
    );
  };

  const StatCard = ({ title, value, change, icon, color }) => (
    <View style={[styles.statCard, shadows.medium]}>
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <Icon name={icon} size={20} color={color} />
        </View>
        <View style={styles.statChange}>
          <Icon
            name={change >= 0 ? 'trending-up' : 'trending-down'}
            size={16}
            color={change >= 0 ? colors.success : colors.error}
          />
          <Text style={[styles.changeText, { color: change >= 0 ? colors.success : colors.error }]}>
            {Math.abs(change)}%
          </Text>
        </View>
      </View>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );

  const PeriodSelector = () => (
    <View style={styles.periodSelector}>
      {periods.map(period => (
        <TouchableOpacity
          key={period.key}
          style={[
            styles.periodButton,
            selectedPeriod === period.key && styles.periodButtonActive
          ]}
          onPress={() => setSelectedPeriod(period.key)}
        >
          <Text style={[
            styles.periodButtonText,
            selectedPeriod === period.key && styles.periodButtonTextActive
          ]}>
            {period.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const ReportTypeSelector = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reportTypeSelector}>
      {reportTypes.map(type => (
        <TouchableOpacity
          key={type.key}
          style={[
            styles.reportTypeButton,
            selectedReport === type.key && styles.reportTypeButtonActive
          ]}
          onPress={() => setSelectedReport(type.key)}
        >
          <Icon
            name={type.icon}
            size={20}
            color={selectedReport === type.key ? 'white' : colors.textSecondary}
          />
          <Text style={[
            styles.reportTypeText,
            selectedReport === type.key && styles.reportTypeTextActive
          ]}>
            {type.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderReportContent = () => {
    switch (selectedReport) {
      case 'overview':
        return (
          <View>
            {/* Stats Cards */}
            <View style={styles.statsGrid}>
              <StatCard
                title="Total Income"
                value="$21,500"
                change={12.5}
                icon="trending-up"
                color={colors.success}
              />
              <StatCard
                title="Total Expense"
                value="$18,200"
                change={-5.2}
                icon="trending-down"
                color={colors.error}
              />
              <StatCard
                title="Net Savings"
                value="$3,300"
                change={8.7}
                icon="wallet"
                color={colors.primary}
              />
              <StatCard
                title="Transactions"
                value="142"
                change={15.3}
                icon="list"
                color={colors.secondary}
              />
            </View>

            {/* Income vs Expense Chart */}
            <View style={styles.chartSection}>
              <Text style={styles.chartTitle}>Income vs Expense</Text>
              <View style={[styles.chartContainer, shadows.medium]}>
                <LineChart
                  data={incomeVsExpenseData}
                  width={screenWidth - 60}
                  height={220}
                  chartConfig={chartConfig}
                  style={styles.chart}
                  bezier
                />
              </View>
            </View>
          </View>
        );

      case 'trends':
        return (
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Spending Trends</Text>
            <View style={[styles.chartContainer, shadows.medium]}>
              <LineChart
                data={trendData}
                width={screenWidth - 60}
                height={220}
                chartConfig={chartConfig}
                style={styles.chart}
                bezier
              />
            </View>
          </View>
        );

      case 'categories':
        return (
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Category Breakdown</Text>
            <View style={[styles.chartContainer, shadows.medium]}>
              <BarChart
                data={categoryData}
                width={screenWidth - 60}
                height={220}
                chartConfig={chartConfig}
                style={styles.chart}
                showValuesOnTopOfBars
              />
            </View>
          </View>
        );

      case 'heatmap':
        return (
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Activity Heatmap</Text>
            <View style={[styles.chartContainer, shadows.medium]}>
              <ContributionGraph
                values={heatmapData}
                endDate={new Date('2025-01-07')}
                numDays={105}
                width={screenWidth - 60}
                height={220}
                chartConfig={chartConfig}
                style={styles.chart}
              />
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <LinearGradient colors={gradients.background} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Reports</Text>
          <View style={styles.exportButtons}>
            <TouchableOpacity
              style={[styles.exportButton, shadows.small]}
              onPress={() => exportReport('pdf')}
            >
              <Icon name="document-text" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.exportButton, shadows.small]}
              onPress={() => exportReport('csv')}
            >
              <Icon name="grid" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Period Selector */}
        <PeriodSelector />

        {/* Report Type Selector */}
        <ReportTypeSelector />

        {/* Report Content */}
        {renderReportContent()}

        {/* AI Insights */}
        <View style={[styles.insightsCard, shadows.medium]}>
          <Text style={styles.insightsTitle}>AI Insights</Text>
          <View style={styles.insight}>
            <Icon name="bulb" size={20} color={colors.warning} />
            <Text style={styles.insightText}>
              Your spending has increased by 15% this month compared to last month. Consider reviewing your Food and Entertainment categories.
            </Text>
          </View>
          <View style={styles.insight}>
            <Icon name="trending-up" size={20} color={colors.success} />
            <Text style={styles.insightText}>
              Great job! Your savings rate has improved by 8.7% this period.
            </Text>
          </View>
          <View style={styles.insight}>
            <Icon name="time" size={20} color={colors.info} />
            <Text style={styles.insightText}>
              You tend to spend more on weekends. Consider setting weekend-specific budgets.
            </Text>
          </View>
        </View>

        {/* Bottom padding */}
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
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  exportButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  exportButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
  },
  periodButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  periodButtonTextActive: {
    color: 'white',
  },
  reportTypeSelector: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  reportTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: 'white',
    marginRight: 10,
    gap: 8,
  },
  reportTypeButtonActive: {
    backgroundColor: colors.primary,
  },
  reportTypeText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  reportTypeTextActive: {
    color: 'white',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 15,
    width: (screenWidth - 50) / 2,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  chartSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 10,
  },
  chart: {
    borderRadius: 16,
  },
  insightsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  insight: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    gap: 10,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 100,
  },
});

export default ReportsScreen;

