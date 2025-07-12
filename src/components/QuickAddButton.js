import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { shadows } from '../theme/colors';

const QuickAddButton = ({ type, onPress }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const getButtonConfig = () => {
    switch (type) {
      case 'income':
        return {
          icon: 'add-circle',
          label: 'Income',
          gradient: ['#10b981', '#059669'],
        };
      case 'expense':
        return {
          icon: 'remove-circle',
          label: 'Expense',
          gradient: ['#ef4444', '#dc2626'],
        };
      case 'transfer':
        return {
          icon: 'swap-horizontal',
          label: 'Transfer',
          gradient: ['#6366f1', '#4f46e5'],
        };
      default:
        return {
          icon: 'add',
          label: 'Add',
          gradient: ['#6366f1', '#4f46e5'],
        };
    }
  };

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const config = getButtonConfig();

  return (
    <Animated.View style={[{ transform: [{ scale: scaleValue }] }]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={styles.container}
      >
        <LinearGradient
          colors={config.gradient}
          style={[styles.button, shadows.medium]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Icon name={config.icon} size={24} color="white" />
        </LinearGradient>
        <Text style={styles.label}>{config.label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
});

export default QuickAddButton;

