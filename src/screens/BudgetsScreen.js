import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

import DatabaseService from '../services/DatabaseService';
import CurrencyService from '../services/CurrencyService';
import { Budget } from '../models/Budget';
import { shadows } from '../theme/colors';

const BudgetsScreen = ({ navigation }) => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Add budget form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    amount: '',
    period: 'monthly',
    color: '#6366f1',
    icon: 'wallet',
  });

  const categories = [
    'Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 
    'Bills & Utilities', 'Healthcare', 'Education', 'Travel', 'Other'
  ];

  const periods = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
    '#ef4444', '#06b6d4', '#84cc16', '#f97316', '#6b7280'
  ];

  const icons = [
    'wallet', 'restaurant', 'car', 'bag', 'game-controller',
    'receipt', 'medical', 'school', 'airplane', 'home'
  ];

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    try {
      setLoading(true);
      const data = await DatabaseService.getBudgets();
      setBudgets(data);
    } catch (error) {
      console.error('Error loading budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBudgets();
    setRefreshing(false);
  };

  const handleAddBudget = async () => {
    try {
      if (!formData.name || !formData.amount || !formData.category) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      const budget = new Budget({
        name: formData.name,
        category: formData.category,
        amount: parseFloat(formData.amount),
        period: formData.period,
        color: formData.color,
        icon: formData.icon,
        currency: CurrencyService.getCurrentCurrency().code,
      });

      await DatabaseService.addBudget(budget);
      
      setShowAddModal(false);
      setFormData({
        name: '',
        category: '',
        amount: '',
        period: 'monthly',
        color: '#6366f1',
        icon: 'wallet',
      });
      
      await loadBudgets();
      Alert.alert('Success', 'Budget created successfully');
    } catch (error) {
      console.error('Error adding budget:', error);
      Alert.alert('Error', 'Failed to create budget');
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return '#ef4444';
    if (progress >= 80) return '#f59e0b';
    return '#10b981';
  };

  const renderBudget = ({ item }) => {
    const progress = item.getProgress();
    const progressColor = getProgressColor(progress);
    const remaining = item.getRemaining();
    const daysRemaining = item.getDaysRemaining();

    return (
      <TouchableOpacity style={[styles.budgetItem, shadows.medium]} activeOpacity={0.7}>
        <LinearGradient
          colors={['white', '#f9fafb']}
          style={styles.budgetCard}
        >
          {/* Header */}
          <View style={styles.budgetHeader}>
            <View style={styles.budgetInfo}>
              <View style={[styles.budgetIcon, { backgroundColor: item.color }]}>
                <Icon name={item.icon} size={20} color="white" />
              </View>
              <View style={styles.budgetDetails}>
                <Text style={styles.budgetName}>{item.name}</Text>
                <Text style={styles.budgetCategory}>{item.category}</Text>
              </View>
            </View>
            <View style={styles.budgetAmount}>
              <Text style={styles.budgetSpent}>
                {CurrencyService.formatAmount(item.spent, item.currency)}
              </Text>
              <Text style={styles.budgetTotal}>
                of {CurrencyService.formatAmount(item.amount, item.currency)}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${Math.min(progress, 100)}%`,
                    backgroundColor: progressColor 
                  }
                ]} 
              />
            </View>
            <Text style={[styles.progressText, { color: progressColor }]}>
              {progress.toFixed(1)}%
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.budgetFooter}>
            <View style={styles.budgetStat}>
              <Text style={styles.budgetStatLabel}>Remaining</Text>
              <Text style={[styles.budgetStatValue, { color: remaining >= 0 ? '#10b981' : '#ef4444' }]}>
                {CurrencyService.formatAmount(Math.abs(remaining), item.currency)}
              </Text>
            </View>
            <View style={styles.budgetStat}>
              <Text style={styles.budgetStatLabel}>Days Left</Text>
              <Text style={styles.budgetStatValue}>
                {daysRemaining > 0 ? daysRemaining : 0}
              </Text>
            </View>
            <View style={styles.budgetStat}>
              <Text style={styles.budgetStatLabel}>Period</Text>
              <Text style={styles.budgetStatValue}>
                {item.period.charAt(0).toUpperCase() + item.period.slice(1)}
              </Text>
            </View>
          </View>

          {/* Warning Badge */}
          {item.isOverBudget() && (
            <View style={styles.warningBadge}>
              <Icon name="warning" size={12} color="white" />
              <Text style={styles.warningText}>Over Budget</Text>
            </View>
          )}
          {item.isNearLimit() && !item.isOverBudget() && (
            <View style={[styles.warningBadge, { backgroundColor: '#f59e0b' }]}>
              <Icon name="alert-circle" size={12} color="white" />
              <Text style={styles.warningText}>Near Limit</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient 
      colors={['#f0f9ff', '#e0e7ff', '#ede9fe']} 
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Budgets</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <LinearGradient
            colors={['#6366f1', '#8b5cf6']}
            style={styles.addButtonGradient}
          >
            <Icon name="add" size={24} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Budgets</Text>
          <Text style={styles.summaryValue}>{budgets.length}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Over Budget</Text>
          <Text style={[styles.summaryValue, { color: '#ef4444' }]}>
            {budgets.filter(b => b.isOverBudget()).length}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Near Limit</Text>
          <Text style={[styles.summaryValue, { color: '#f59e0b' }]}>
            {budgets.filter(b => b.isNearLimit() && !b.isOverBudget()).length}
          </Text>
        </View>
      </View>

      {/* Budgets List */}
      <FlatList
        data={budgets}
        renderItem={renderBudget}
        keyExtractor={(item) => item.id}
        style={styles.budgetsList}
        contentContainerStyle={styles.budgetsContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Icon name="pie-chart-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyStateText}>No budgets created</Text>
            <Text style={styles.emptyStateSubtext}>
              Create your first budget to start tracking your spending
            </Text>
          </View>
        )}
      />

      {/* Add Budget Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalCancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Budget</Text>
            <TouchableOpacity onPress={handleAddBudget}>
              <Text style={styles.modalSaveButton}>Create</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Budget Name */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Budget Name</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., Monthly Food Budget"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
            </View>

            {/* Amount */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Budget Amount</Text>
              <TextInput
                style={styles.formInput}
                placeholder="0.00"
                value={formData.amount}
                onChangeText={(text) => setFormData({ ...formData, amount: text })}
                keyboardType="numeric"
              />
            </View>

            {/* Category */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categorySelector}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryButton,
                        formData.category === category && styles.activeCategoryButton
                      ]}
                      onPress={() => setFormData({ ...formData, category })}
                    >
                      <Text style={[
                        styles.categoryButtonText,
                        formData.category === category && styles.activeCategoryButtonText
                      ]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Period */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Period</Text>
              <View style={styles.periodSelector}>
                {periods.map((period) => (
                  <TouchableOpacity
                    key={period.value}
                    style={[
                      styles.periodButton,
                      formData.period === period.value && styles.activePeriodButton
                    ]}
                    onPress={() => setFormData({ ...formData, period: period.value })}
                  >
                    <Text style={[
                      styles.periodButtonText,
                      formData.period === period.value && styles.activePeriodButtonText
                    ]}>
                      {period.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Color */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Color</Text>
              <View style={styles.colorSelector}>
                {colors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorButton,
                      { backgroundColor: color },
                      formData.color === color && styles.activeColorButton
                    ]}
                    onPress={() => setFormData({ ...formData, color })}
                  >
                    {formData.color === color && (
                      <Icon name="checkmark" size={16} color="white" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Icon */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Icon</Text>
              <View style={styles.iconSelector}>
                {icons.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconButton,
                      formData.icon === icon && styles.activeIconButton
                    ]}
                    onPress={() => setFormData({ ...formData, icon })}
                  >
                    <Icon 
                      name={icon} 
                      size={20} 
                      color={formData.icon === icon ? 'white' : '#6b7280'} 
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Bottom padding for navigation */}
      <View style={styles.bottomPadding} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  addButtonGradient: {
    flex: 1,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    ...shadows.small,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  budgetsList: {
    flex: 1,
  },
  budgetsContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  budgetItem: {
    marginBottom: 16,
  },
  budgetCard: {
    borderRadius: 16,
    padding: 20,
    position: 'relative',
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  budgetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  budgetIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  budgetDetails: {
    flex: 1,
  },
  budgetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  budgetCategory: {
    fontSize: 12,
    color: '#6b7280',
  },
  budgetAmount: {
    alignItems: 'flex-end',
  },
  budgetSpent: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  budgetTotal: {
    fontSize: 12,
    color: '#6b7280',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
  },
  budgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetStat: {
    alignItems: 'center',
  },
  budgetStatLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 2,
  },
  budgetStatValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  warningBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  warningText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 100,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalCancelButton: {
    fontSize: 16,
    color: '#6b7280',
  },
  modalSaveButton: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categorySelector: {
    flexDirection: 'row',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeCategoryButton: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeCategoryButtonText: {
    color: 'white',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activePeriodButton: {
    backgroundColor: '#6366f1',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activePeriodButtonText: {
    color: 'white',
  },
  colorSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeColorButton: {
    borderColor: '#111827',
  },
  iconSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeIconButton: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
});

export default BudgetsScreen;

