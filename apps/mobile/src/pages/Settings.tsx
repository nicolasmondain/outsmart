import React, { useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
  IonNote,
  IonItemDivider,
  IonItemGroup,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonAvatar,
  IonChip,
  IonBadge,
} from '@ionic/react';
import {
  personOutline,
  notificationsOutline,
  moonOutline,
  languageOutline,
  lockClosedOutline,
  informationCircleOutline,
  helpCircleOutline,
  bugOutline,
  logOutOutline,
  folderOutline,
  downloadOutline,
  shareOutline,
  trashOutline,
  chevronForwardOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type: 'toggle' | 'navigation' | 'button' | 'info';
  value?: boolean;
  badge?: string;
  color?: string;
  action?: () => void;
}

const Settings: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [autoSync, setAutoSync] = useState(true);

  const userSettings: SettingItem[] = [
    {
      id: 'profile',
      title: 'Profile',
      subtitle: 'Manage your account information',
      icon: personOutline,
      type: 'navigation',
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: notifications ? 'Enabled' : 'Disabled',
      icon: notificationsOutline,
      type: 'toggle',
      value: notifications,
      action: () => setNotifications(!notifications),
    },
    {
      id: 'darkmode',
      title: 'Dark Mode',
      subtitle: 'Use dark theme',
      icon: moonOutline,
      type: 'toggle',
      value: darkMode,
      action: () => setDarkMode(!darkMode),
    },
    {
      id: 'language',
      title: 'Language',
      subtitle: 'English (US)',
      icon: languageOutline,
      type: 'navigation',
    },
  ];

  const dataSettings: SettingItem[] = [
    {
      id: 'offline',
      title: 'Offline Mode',
      subtitle: 'Save data for offline access',
      icon: downloadOutline,
      type: 'toggle',
      value: offlineMode,
      action: () => setOfflineMode(!offlineMode),
    },
    {
      id: 'autosync',
      title: 'Auto Sync',
      subtitle: 'Automatically sync data',
      icon: checkmarkCircleOutline,
      type: 'toggle',
      value: autoSync,
      action: () => setAutoSync(!autoSync),
    },
    {
      id: 'storage',
      title: 'Storage',
      subtitle: '2.3 GB used of 5 GB',
      icon: folderOutline,
      type: 'navigation',
      badge: '46%',
    },
    {
      id: 'clear-cache',
      title: 'Clear Cache',
      subtitle: 'Free up space',
      icon: trashOutline,
      type: 'button',
      color: 'warning',
    },
  ];

  const supportSettings: SettingItem[] = [
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: helpCircleOutline,
      type: 'navigation',
    },
    {
      id: 'feedback',
      title: 'Send Feedback',
      subtitle: 'Help us improve the app',
      icon: bugOutline,
      type: 'navigation',
    },
    {
      id: 'share',
      title: 'Share App',
      subtitle: 'Tell your friends about Outsmart',
      icon: shareOutline,
      type: 'button',
    },
    {
      id: 'about',
      title: 'About',
      subtitle: 'Version 1.2.0 (Build 42)',
      icon: informationCircleOutline,
      type: 'navigation',
    },
  ];

  const securitySettings: SettingItem[] = [
    {
      id: 'privacy',
      title: 'Privacy & Security',
      subtitle: 'Manage your privacy settings',
      icon: lockClosedOutline,
      type: 'navigation',
      badge: 'New',
    },
    {
      id: 'logout',
      title: 'Sign Out',
      subtitle: 'Sign out of your account',
      icon: logOutOutline,
      type: 'button',
      color: 'danger',
    },
  ];

  const renderSettingItem = (item: SettingItem) => {
    const handleClick = () => {
      if (item.action) {
        item.action();
      }
    };

    return (
      <IonItem
        key={item.id}
        button={item.type !== 'info'}
        onClick={handleClick}
        className="mb-1"
      >
        <IonIcon
          icon={item.icon}
          slot="start"
          className={`text-lg ${
            item.color === 'danger'
              ? 'text-red-500'
              : item.color === 'warning'
                ? 'text-orange-500'
                : 'text-gray-500'
          }`}
        />
        <IonLabel>
          <h3
            className={`font-medium ${
              item.color === 'danger' ? 'text-red-600' : 'text-gray-900'
            }`}
          >
            {item.title}
          </h3>
          {item.subtitle && (
            <p className="text-sm text-gray-500 mt-1">{item.subtitle}</p>
          )}
        </IonLabel>

        {item.badge && (
          <IonNote slot="end">
            {item.badge === 'New' ? (
              <IonBadge color="primary" className="text-xs">
                {item.badge}
              </IonBadge>
            ) : (
              <span className="text-gray-400 text-sm">{item.badge}</span>
            )}
          </IonNote>
        )}

        {item.type === 'toggle' && (
          <IonToggle
            slot="end"
            checked={item.value}
            onIonChange={handleClick}
            color="primary"
          />
        )}

        {item.type === 'navigation' && (
          <IonIcon
            icon={chevronForwardOutline}
            slot="end"
            className="text-gray-400"
          />
        )}
      </IonItem>
    );
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="bg-white border-b border-gray-200">
          <IonButtons slot="start">
            <IonMenuButton className="text-gray-600" />
          </IonButtons>
          <IonTitle className="text-gray-900 font-semibold">Settings</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="bg-gray-50">
        {/* Profile Card */}
        <div className="p-4">
          <IonCard className="shadow-soft border border-gray-200 rounded-xl overflow-hidden">
            <IonCardContent className="p-6">
              <div className="flex items-center space-x-4">
                <IonAvatar className="w-16 h-16">
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">JD</span>
                  </div>
                </IonAvatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    John Doe
                  </h3>
                  <p className="text-gray-500 text-sm">john.doe@example.com</p>
                  <div className="flex items-center mt-2 space-x-2">
                    <IonChip className="bg-green-100 text-green-800 text-xs">
                      Pro Member
                    </IonChip>
                    <IonChip className="bg-blue-100 text-blue-800 text-xs">
                      Verified
                    </IonChip>
                  </div>
                </div>
              </div>
            </IonCardContent>
          </IonCard>
        </div>

        {/* Settings Groups */}
        <div className="px-4 pb-6">
          {/* Account Settings */}
          <IonItemGroup>
            <IonItemDivider className="bg-transparent px-0 py-2">
              <IonLabel className="text-gray-500 font-medium text-sm uppercase tracking-wider">
                Account
              </IonLabel>
            </IonItemDivider>
            <IonCard className="shadow-soft border border-gray-200 rounded-xl overflow-hidden mb-6">
              <IonList className="bg-transparent">
                {userSettings.map(renderSettingItem)}
              </IonList>
            </IonCard>
          </IonItemGroup>

          {/* Data & Storage */}
          <IonItemGroup>
            <IonItemDivider className="bg-transparent px-0 py-2">
              <IonLabel className="text-gray-500 font-medium text-sm uppercase tracking-wider">
                Data & Storage
              </IonLabel>
            </IonItemDivider>
            <IonCard className="shadow-soft border border-gray-200 rounded-xl overflow-hidden mb-6">
              <IonList className="bg-transparent">
                {dataSettings.map(renderSettingItem)}
              </IonList>
            </IonCard>
          </IonItemGroup>

          {/* Support */}
          <IonItemGroup>
            <IonItemDivider className="bg-transparent px-0 py-2">
              <IonLabel className="text-gray-500 font-medium text-sm uppercase tracking-wider">
                Support
              </IonLabel>
            </IonItemDivider>
            <IonCard className="shadow-soft border border-gray-200 rounded-xl overflow-hidden mb-6">
              <IonList className="bg-transparent">
                {supportSettings.map(renderSettingItem)}
              </IonList>
            </IonCard>
          </IonItemGroup>

          {/* Security */}
          <IonItemGroup>
            <IonItemDivider className="bg-transparent px-0 py-2">
              <IonLabel className="text-gray-500 font-medium text-sm uppercase tracking-wider">
                Security
              </IonLabel>
            </IonItemDivider>
            <IonCard className="shadow-soft border border-gray-200 rounded-xl overflow-hidden mb-6">
              <IonList className="bg-transparent">
                {securitySettings.map(renderSettingItem)}
              </IonList>
            </IonCard>
          </IonItemGroup>
        </div>

        {/* Footer */}
        <div className="px-4 pb-8">
          <div className="text-center text-gray-400 text-sm">
            <p>Made with ❤️ by the Outsmart Team</p>
            <p className="mt-1">© 2024 Outsmart. All rights reserved.</p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Settings;
