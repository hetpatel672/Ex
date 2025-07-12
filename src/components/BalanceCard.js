import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { shadows } from '../theme/colors';

const BalanceCard = ({ 
  title, 
  amount, 
  icon, 
  gradient, 
  isPercentage = false, 
  isAnimated = false,
  onPress,
  currency = '$'
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isAnimated) {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: false,
      }).start();
    }
  }, [isAnimated]);

  const animatedAmount = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, amount],
  });

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const formatAmount = (value) => {
    if (isPercentage) {
      return `${value.toFixed(1)}%`;
    }
    return `${currency}${value.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const CardContent = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Icon name={icon} size={20} color="white" />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>
      
      <View style={styles.amountContainer}>
        {isAnimated ? (
          <Animated.Text style={styles.amount}>
            {animatedAmount.interpolate({
              inputRange: [0, amount],
              outputRange: ['0', formatAmount(amount)],
              extrapolate: 'clamp',
            })}
          </Animated.Text>
        ) : (
          <Text style={styles.amount}>{formatAmount(amount)}</Text>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleValue }] }]}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={gradient}
            style={[styles.card, shadows.medium]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <CardContent />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <LinearGradient
      colors={gradient}
      style={[styles.card, shadows.medium]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <CardContent />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    minHeight: 100,
    justifyContent: 'space-between',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  amountContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default BalanceCard;

