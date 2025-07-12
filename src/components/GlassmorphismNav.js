import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { shadows } from '../theme/colors';

const { width: screenWidth } = Dimensions.get('window');

const GlassmorphismNav = ({ activeTab, onTabChange }) => {
  const indicatorPosition = useRef(new Animated.Value(0)).current;

  const tabs = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'transactions', icon: 'card', label: 'Transactions' },
    { id: 'budgets', icon: 'pie-chart', label: 'Budgets' },
    { id: 'reports', icon: 'bar-chart', label: 'Reports' },
    { id: 'settings', icon: 'settings', label: 'Settings' },
  ];

  useEffect(() => {
    const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
    const tabWidth = (screenWidth - 80) / tabs.length; // 40px margin on each side
    const newPosition = activeIndex * tabWidth + tabWidth / 2 - 24; // 24 is half of indicator width

    Animated.spring(indicatorPosition, {
      toValue: newPosition,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  }, [activeTab]);

  const handleTabPress = (tabId) => {
    onTabChange(tabId);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.1)']}
        style={[styles.navContainer, shadows.large]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Active Tab Indicator */}
        <Animated.View
          style={[
            styles.activeIndicator,
            {
              left: indicatorPosition,
            },
          ]}
        >
          <LinearGradient
            colors={['#6366f1', '#8b5cf6']}
            style={styles.indicatorGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>

        {/* Navigation Items */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <TouchableOpacity
                key={tab.id}
                style={styles.tabItem}
                onPress={() => handleTabPress(tab.id)}
                activeOpacity={0.7}
              >
                <View style={styles.tabContent}>
                  <Icon
                    name={tab.icon}
                    size={20}
                    color={isActive ? 'white' : 'rgba(107, 114, 128, 0.8)'}
                  />
                  <Text
                    style={[
                      styles.tabLabel,
                      {
                        color: isActive ? 'white' : 'rgba(107, 114, 128, 0.8)',
                        fontWeight: isActive ? '600' : '500',
                      },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  navContainer: {
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeIndicator: {
    position: 'absolute',
    top: 8,
    width: 48,
    height: 48,
    borderRadius: 24,
    zIndex: 1,
  },
  indicatorGradient: {
    flex: 1,
    borderRadius: 24,
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    position: 'relative',
    zIndex: 2,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
});

export default GlassmorphismNav;

