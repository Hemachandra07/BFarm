import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens
import { SplashScreen } from '../screens/SplashScreen';
import { LanguageScreen } from '../screens/LanguageScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { CropSelectionScreen } from '../screens/CropSelectionScreen';
import { CameraScreen } from '../screens/CameraScreen';
import { PreviewScreen } from '../screens/PreviewScreen';
import { DiagnosisLoadingScreen } from '../screens/DiagnosisLoadingScreen';
import { DiagnosisResultScreen } from '../screens/DiagnosisResultScreen';
import { TreatmentScreen } from '../screens/TreatmentScreen';
import { MarketScreen } from '../screens/MarketScreen';
import { BuyersScreen } from '../screens/BuyersScreen';
import { FPOScreen } from '../screens/FPOScreen';
import { StorageScreen } from '../screens/StorageScreen';
import { LogisticsScreen } from '../screens/LogisticsScreen';
import { BookingConfirmationScreen } from '../screens/BookingConfirmationScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

// RBAC Marketplace Screens
import { ProduceListingScreen } from '../screens/ProduceListingScreen';
import { FarmerOrdersScreen } from '../screens/FarmerOrdersScreen';
import { BrowseProduceScreen } from '../screens/BrowseProduceScreen';
import { BuyerOrdersScreen } from '../screens/BuyerOrdersScreen';
import { StorageProviderScreen } from '../screens/StorageProviderScreen';
import { LogisticsProviderScreen } from '../screens/LogisticsProviderScreen';
import { AdminScreen } from '../screens/AdminScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Dynamic Role-Based Bottom Navigation Tabs
const MainTabNavigator = () => {
  const { t } = useTranslation();
  const [role, setRole] = useState('FARMER');

  useEffect(() => {
    const checkRole = async () => {
      try {
        const savedRole = await AsyncStorage.getItem('@bfarm_role');
        if (savedRole) {
          setRole(savedRole);
        } else {
          const raw = await AsyncStorage.getItem('@bfarm_user_info');
          if (raw) {
            const u = JSON.parse(raw);
            if (u.role) setRole(u.role);
          }
        }
      } catch (e) {
        // Fallback to FARMER
      }
    };
    checkRole();
  }, []);

  const tabScreenOptions = {
    headerShown: false,
    tabBarActiveTintColor: '#16a34a',
    tabBarInactiveTintColor: '#64748b',
    tabBarStyle: {
      height: 64,
      paddingBottom: 8,
      paddingTop: 8,
      backgroundColor: '#ffffff',
      borderTopWidth: 1,
      borderTopColor: '#e2e8f0',
    },
    tabBarLabelStyle: {
      fontSize: 11,
      fontWeight: '700',
    },
  };

  // Admin Operations Tabs
  if (role === 'ADMIN') {
    return (
      <Tab.Navigator screenOptions={tabScreenOptions}>
        <Tab.Screen
          name="AdminTab"
          component={AdminScreen}
          options={{
            tabBarLabel: 'Admin Control',
            tabBarIcon: () => <Text style={{ fontSize: 20 }}>🛡️</Text>,
          }}
        />
        <Tab.Screen
          name="MarketTab"
          component={MarketScreen}
          options={{
            tabBarLabel: t('market') || 'Mandi Rates',
            tabBarIcon: () => <Text style={{ fontSize: 20 }}>💰</Text>,
          }}
        />
        <Tab.Screen
          name="ProfileTab"
          component={ProfileScreen}
          options={{
            tabBarLabel: t('profile') || 'Profile',
            tabBarIcon: () => <Text style={{ fontSize: 20 }}>👤</Text>,
          }}
        />
      </Tab.Navigator>
    );
  }

  // Buyer & FPO Tabs
  if (role === 'BUYER' || role === 'FPO') {
    return (
      <Tab.Navigator screenOptions={tabScreenOptions}>
        <Tab.Screen
          name="BrowseTab"
          component={BrowseProduceScreen}
          options={{
            tabBarLabel: 'Marketplace',
            tabBarIcon: () => <Text style={{ fontSize: 20 }}>🛒</Text>,
          }}
        />
        <Tab.Screen
          name="OrdersTab"
          component={BuyerOrdersScreen}
          options={{
            tabBarLabel: 'My Orders',
            tabBarIcon: () => <Text style={{ fontSize: 20 }}>📦</Text>,
          }}
        />
        <Tab.Screen
          name="MarketTab"
          component={MarketScreen}
          options={{
            tabBarLabel: t('market') || 'Mandi Rates',
            tabBarIcon: () => <Text style={{ fontSize: 20 }}>💰</Text>,
          }}
        />
        <Tab.Screen
          name="ProfileTab"
          component={ProfileScreen}
          options={{
            tabBarLabel: t('profile') || 'Profile',
            tabBarIcon: () => <Text style={{ fontSize: 20 }}>👤</Text>,
          }}
        />
      </Tab.Navigator>
    );
  }

  // Cold Storage Provider Tabs
  if (role === 'STORAGE_PROVIDER') {
    return (
      <Tab.Navigator screenOptions={tabScreenOptions}>
        <Tab.Screen
          name="StorageMgmtTab"
          component={StorageProviderScreen}
          options={{
            tabBarLabel: 'Cold Storage',
            tabBarIcon: () => <Text style={{ fontSize: 20 }}>❄️</Text>,
          }}
        />
        <Tab.Screen
          name="MarketTab"
          component={MarketScreen}
          options={{
            tabBarLabel: t('market') || 'Mandi Rates',
            tabBarIcon: () => <Text style={{ fontSize: 20 }}>💰</Text>,
          }}
        />
        <Tab.Screen
          name="ProfileTab"
          component={ProfileScreen}
          options={{
            tabBarLabel: t('profile') || 'Profile',
            tabBarIcon: () => <Text style={{ fontSize: 20 }}>👤</Text>,
          }}
        />
      </Tab.Navigator>
    );
  }

  // Logistics Provider Tabs
  if (role === 'LOGISTICS_PROVIDER') {
    return (
      <Tab.Navigator screenOptions={tabScreenOptions}>
        <Tab.Screen
          name="LogisticsMgmtTab"
          component={LogisticsProviderScreen}
          options={{
            tabBarLabel: 'Transport Hub',
            tabBarIcon: () => <Text style={{ fontSize: 20 }}>🚚</Text>,
          }}
        />
        <Tab.Screen
          name="MarketTab"
          component={MarketScreen}
          options={{
            tabBarLabel: t('market') || 'Mandi Rates',
            tabBarIcon: () => <Text style={{ fontSize: 20 }}>💰</Text>,
          }}
        />
        <Tab.Screen
          name="ProfileTab"
          component={ProfileScreen}
          options={{
            tabBarLabel: t('profile') || 'Profile',
            tabBarIcon: () => <Text style={{ fontSize: 20 }}>👤</Text>,
          }}
        />
      </Tab.Navigator>
    );
  }

  // Farmer Tabs (Default)
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: t('home') || 'Home',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={HistoryScreen}
        options={{
          tabBarLabel: t('history') || 'History',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>📋</Text>,
        }}
      />
      <Tab.Screen
        name="SellProduceTab"
        component={ProduceListingScreen}
        options={{
          tabBarLabel: 'Sell Produce',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>📢</Text>,
        }}
      />
      <Tab.Screen
        name="OffersTab"
        component={FarmerOrdersScreen}
        options={{
          tabBarLabel: 'Offers',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🤝</Text>,
        }}
      />
      <Tab.Screen
        name="MarketTab"
        component={MarketScreen}
        options={{
          tabBarLabel: t('market') || 'Market',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>💰</Text>,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: t('profile') || 'Profile',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Onboarding & Authentication */}
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />

      {/* Main Dynamic Tabs */}
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />

      {/* Crop Diagnosis Journey */}
      <Stack.Screen
        name="CropSelection"
        component={CropSelectionScreen}
        options={{ headerShown: true, title: 'Select Crop' }}
      />
      <Stack.Screen
        name="Camera"
        component={CameraScreen}
        options={{ headerShown: true, title: 'Leaf Camera' }}
      />
      <Stack.Screen
        name="Preview"
        component={PreviewScreen}
        options={{ headerShown: true, title: 'Review Photo' }}
      />
      <Stack.Screen
        name="DiagnosisLoading"
        component={DiagnosisLoadingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DiagnosisResult"
        component={DiagnosisResultScreen}
        options={{ headerShown: true, title: 'Diagnosis Result' }}
      />
      <Stack.Screen
        name="Treatment"
        component={TreatmentScreen}
        options={{ headerShown: true, title: 'Treatment Guidance' }}
      />

      {/* Marketplace & Fulfillment */}
      <Stack.Screen
        name="Market"
        component={MarketScreen}
        options={{ headerShown: true, title: 'Market Prices' }}
      />
      <Stack.Screen
        name="Buyers"
        component={BuyersScreen}
        options={{ headerShown: true, title: 'Verified Buyers' }}
      />
      <Stack.Screen
        name="FPO"
        component={FPOScreen}
        options={{ headerShown: true, title: 'Nearby FPOs' }}
      />
      <Stack.Screen
        name="Storage"
        component={StorageScreen}
        options={{ headerShown: true, title: 'Cold Storage' }}
      />
      <Stack.Screen
        name="Logistics"
        component={LogisticsScreen}
        options={{ headerShown: true, title: 'Transport Booking' }}
      />
      <Stack.Screen
        name="BookingConfirmation"
        component={BookingConfirmationScreen}
        options={{ headerShown: false }}
      />

      {/* Dedicated RBAC Marketplace Screens */}
      <Stack.Screen
        name="ProduceListing"
        component={ProduceListingScreen}
        options={{ headerShown: true, title: 'List Produce for Sale' }}
      />
      <Stack.Screen
        name="FarmerOrders"
        component={FarmerOrdersScreen}
        options={{ headerShown: true, title: 'Received Purchase Offers' }}
      />
      <Stack.Screen
        name="BrowseProduce"
        component={BrowseProduceScreen}
        options={{ headerShown: true, title: 'Browse Farmer Produce' }}
      />
      <Stack.Screen
        name="BuyerOrders"
        component={BuyerOrdersScreen}
        options={{ headerShown: true, title: 'Buyer Orders & Logistics' }}
      />
      <Stack.Screen
        name="StorageProvider"
        component={StorageProviderScreen}
        options={{ headerShown: true, title: 'Cold Storage Facility' }}
      />
      <Stack.Screen
        name="LogisticsProvider"
        component={LogisticsProviderScreen}
        options={{ headerShown: true, title: 'Logistics Fleet & Jobs' }}
      />
    </Stack.Navigator>
  );
};
