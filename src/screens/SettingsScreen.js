import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

import { colors, gradients, shadows } from '../theme/colors';

const SettingsScreen = () => {
  const [settings, setSettings] = useState({
    biometricLogin: true,
    notifications: true,
    darkMode: false,
    autoBackup: true,
    currency: 'USD',
    language: 'English',
  });

  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'];
  const languages = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Chinese', 'Japanese'];

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleBackup = () => {
    Alert.alert(
      'Backup Data',
      'Your data will be securely backed up to your device storage.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Backup', onPress: () => performBackup() },
      ]
    );
  };

  const handleRestore = () => {
    Alert.alert(
      'Restore Data',
      'This will restore your data from the latest backup. Current data will be replaced.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Restore', onPress: () => performRestore(), style: 'destructive' },
      ]
    );
  };

  const handleExport = () => {
    Alert.alert(
      'Export Data',
      'Choose export format:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'CSV', onPress: () => exportData('csv') },
        { text: 'JSON', onPress: () => exportData('json') },
      ]
    );
  };

  const performBackup = () => {
    // Simulate backup process
    setTimeout(() => {
      Alert.alert('Success', 'Data backed up successfully!');
    }, 1000);
  };

  const performRestore = () => {
    // Simulate restore process
    setTimeout(() => {
      Alert.alert('Success', 'Data restored successfully!');
    }, 1000);
  };

  const exportData = (format) => {
    // Simulate export process
    setTimeout(() => {
      Alert.alert('Success', `Data exported as ${format.toUpperCase()} successfully!`);
    }, 1000);
  };

  const SettingItem = ({ icon, title, subtitle, onPress, rightComponent }) => (
    <TouchableOpacity style={[styles.settingItem, shadows.small]} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: colors.primary + '20' }]}>
          <Icon name={icon} size={20} color={colors.primary} />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightComponent}
      </View>
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  const SelectionModal = ({ visible, onClose, title, options, selectedValue, onSelect }) => (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, shadows.large]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.optionsList}>
            {options.map(option => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionItem,
                  selectedValue === option && styles.optionItemSelected
                ]}
                onPress={() => {
                  onSelect(option);
                  onClose();
                }}
              >
                <Text style={[
                  styles.optionText,
                  selectedValue === option && styles.optionTextSelected
                ]}>
                  {option}
                </Text>
                {selectedValue === option && (
                  <Icon name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <LinearGradient colors={gradients.background} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Profile Section */}
        <View style={[styles.profileCard, shadows.medium]}>
          <View style={styles.profileAvatar}>
            <Icon name="person" size={40} color="white" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>John Doe</Text>
            <Text style={styles.profileEmail}>john.doe@example.com</Text>
          </View>
          <TouchableOpacity style={styles.editProfileButton}>
            <Icon name="pencil" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Security Settings */}
        <SectionHeader title="Security" />
        <SettingItem
          icon="finger-print"
          title="Biometric Login"
          subtitle="Use fingerprint or face recognition"
          rightComponent={
            <Switch
              value={settings.biometricLogin}
              onValueChange={(value) => updateSetting('biometricLogin', value)}
              trackColor={{ false: colors.textSecondary + '30', true: colors.primary + '50' }}
              thumbColor={settings.biometricLogin ? colors.primary : colors.textSecondary}
            />
          }
        />

        {/* Preferences */}
        <SectionHeader title="Preferences" />
        <SettingItem
          icon="notifications"
          title="Notifications"
          subtitle="Enable push notifications"
          rightComponent={
            <Switch
              value={settings.notifications}
              onValueChange={(value) => updateSetting('notifications', value)}
              trackColor={{ false: colors.textSecondary + '30', true: colors.primary + '50' }}
              thumbColor={settings.notifications ? colors.primary : colors.textSecondary}
            />
          }
        />
        <SettingItem
          icon="moon"
          title="Dark Mode"
          subtitle="Switch to dark theme"
          rightComponent={
            <Switch
              value={settings.darkMode}
              onValueChange={(value) => updateSetting('darkMode', value)}
              trackColor={{ false: colors.textSecondary + '30', true: colors.primary + '50' }}
              thumbColor={settings.darkMode ? colors.primary : colors.textSecondary}
            />
          }
        />
        <SettingItem
          icon="cash"
          title="Currency"
          subtitle={settings.currency}
          onPress={() => setShowCurrencyModal(true)}
          rightComponent={
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          }
        />
        <SettingItem
          icon="language"
          title="Language"
          subtitle={settings.language}
          onPress={() => setShowLanguageModal(true)}
          rightComponent={
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          }
        />

        {/* Data Management */}
        <SectionHeader title="Data Management" />
        <SettingItem
          icon="cloud-upload"
          title="Auto Backup"
          subtitle="Automatically backup data"
          rightComponent={
            <Switch
              value={settings.autoBackup}
              onValueChange={(value) => updateSetting('autoBackup', value)}
              trackColor={{ false: colors.textSecondary + '30', true: colors.primary + '50' }}
              thumbColor={settings.autoBackup ? colors.primary : colors.textSecondary}
            />
          }
        />
        <SettingItem
          icon="save"
          title="Backup Data"
          subtitle="Create a backup of your data"
          onPress={handleBackup}
          rightComponent={
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          }
        />
        <SettingItem
          icon="refresh"
          title="Restore Data"
          subtitle="Restore from backup"
          onPress={handleRestore}
          rightComponent={
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          }
        />
        <SettingItem
          icon="download"
          title="Export Data"
          subtitle="Export your data"
          onPress={handleExport}
          rightComponent={
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          }
        />

        {/* About */}
        <SectionHeader title="About" />
        <SettingItem
          icon="information-circle"
          title="App Version"
          subtitle="1.0.0"
          rightComponent={null}
        />
        <SettingItem
          icon="document-text"
          title="Privacy Policy"
          onPress={() => Alert.alert('Privacy Policy', 'Privacy policy content would be shown here.')}
          rightComponent={
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          }
        />
        <SettingItem
          icon="shield-checkmark"
          title="Terms of Service"
          onPress={() => Alert.alert('Terms of Service', 'Terms of service content would be shown here.')}
          rightComponent={
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          }
        />

        {/* Danger Zone */}
        <SectionHeader title="Danger Zone" />
        <TouchableOpacity
          style={[styles.dangerButton, shadows.small]}
          onPress={() => {
            Alert.alert(
              'Clear All Data',
              'This will permanently delete all your data. This action cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => {} },
              ]
            );
          }}
        >
          <Icon name="trash" size={20} color={colors.error} />
          <Text style={styles.dangerButtonText}>Clear All Data</Text>
        </TouchableOpacity>

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Currency Selection Modal */}
      <SelectionModal
        visible={showCurrencyModal}
        onClose={() => setShowCurrencyModal(false)}
        title="Select Currency"
        options={currencies}
        selectedValue={settings.currency}
        onSelect={(currency) => updateSetting('currency', currency)}
      />

      {/* Language Selection Modal */}
      <SelectionModal
        visible={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        title="Select Language"
        options={languages}
        selectedValue={settings.language}
        onSelect={(language) => updateSetting('language', language)}
      />
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
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 30,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  editProfileButton: {
    padding: 8,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  settingRight: {
    marginLeft: 10,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error + '10',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 8,
    gap: 10,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
  bottomPadding: {
    height: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  optionItemSelected: {
    backgroundColor: colors.primary + '10',
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
});

export default SettingsScreen;

