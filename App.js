import React, { useState, useEffect } from 'react';
import { StatusBar, StyleSheet, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import BudgetsScreen from './src/screens/BudgetsScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Import components
import GlassmorphismNav from './src/components/GlassmorphismNav';

// Import services
import DatabaseService from './src/services/DatabaseService';
import CurrencyService from './src/services/CurrencyService';
import AuthService from './src/services/AuthService';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize services
      await DatabaseService.initialize();
      await CurrencyService.initialize();
      await AuthService.initialize();

      // Check authentication
      const authResult = await AuthService.authenticate();
      setIsAuthenticated(authResult.success);
      
      setIsLoading(false);
    } catch (error) {
      console.error('App initialization error:', error);
      setIsLoading(false);
    }
  };

  const renderActiveScreen = () => {
    const screenProps = {
      navigation: {
        navigate: (screen, params) => {
          if (screen === 'Transactions') {
            setActiveTab('transactions');
          } else if (screen === 'Budgets') {
            setActiveTab('budgets');
          } else if (screen === 'Reports') {
            setActiveTab('reports');
          } else if (screen === 'Settings') {
            setActiveTab('settings');
          } else {
            setActiveTab('home');
          }
        }
      }
    };

    switch (activeTab) {
      case 'home':
        return <HomeScreen {...screenProps} />;
      case 'transactions':
        return <TransactionsScreen {...screenProps} />;
      case 'budgets':
        return <BudgetsScreen {...screenProps} />;
      case 'reports':
        return <ReportsScreen {...screenProps} />;
      case 'settings':
        return <SettingsScreen {...screenProps} />;
      default:
        return <HomeScreen {...screenProps} />;
    }
  };

  if (isLoading) {
    return (
      <LinearGradient 
        colors={['#f0f9ff', '#e0e7ff', '#ede9fe']} 
        style={styles.loadingContainer}
      >
        <Text style={styles.loadingText}>BudgetWise</Text>
        <Text style={styles.loadingSubtext}>Loading your financial data...</Text>
      </LinearGradient>
    );
  }

  if (!isAuthenticated) {
    return (
      <LinearGradient 
        colors={['#f0f9ff', '#e0e7ff', '#ede9fe']} 
        style={styles.authContainer}
      >
        <Text style={styles.authText}>Authentication Required</Text>
        <Text style={styles.authSubtext}>Please authenticate to access BudgetWise</Text>
      </LinearGradient>
    );
  }

  return (
    <NavigationContainer>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f0f9ff" />
        
        {/* Main Content */}
        <View style={styles.content}>
          {renderActiveScreen()}
        </View>

        {/* Glassmorphism Bottom Navigation */}
        <GlassmorphismNav 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f9ff',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 16,
    color: '#6b7280',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  authSubtext: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});

