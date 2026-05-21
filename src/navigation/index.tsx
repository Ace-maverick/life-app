import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { Colors } from '../theme';
import { useApp } from '../context/AppContext';

// ─── Screens ──────────────────────────────────────────────────────────────────
import SplashScreen from '../screens/SplashScreen';
import RoleSelectScreen from '../screens/RoleSelectScreen';
import PhoneAuthScreen from '../screens/auth/PhoneAuthScreen';
import OTPScreen from '../screens/auth/OTPScreen';

// Poster
import PosterHomeScreen from '../screens/poster/HomeScreen';
import CreateTaskScreen from '../screens/poster/CreateTaskScreen';
import SearchingScreen from '../screens/poster/SearchingScreen';
import PosterTaskDetailScreen from '../screens/poster/TaskDetailScreen';
import InvoiceScreen from '../screens/poster/InvoiceScreen';
import PaymentSuccessScreen from '../screens/poster/PaymentSuccessScreen';
import PosterTasksScreen from '../screens/poster/TasksScreen';
import WalletScreen from '../screens/shared/WalletScreen';

// Lifer
import LiferDiscoverScreen from '../screens/lifer/DiscoverScreen';
import LiferTaskPreviewScreen from '../screens/lifer/TaskPreviewScreen';
import ActiveJobScreen from '../screens/lifer/ActiveJobScreen';
import LiferEarningsScreen from '../screens/lifer/EarningsScreen';
import VerificationScreen from '../screens/lifer/VerificationScreen';

// Shared
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';

// Admin
import AdminDashboardScreen from '../screens/admin/DashboardScreen';
import AdminVerificationsScreen from '../screens/admin/VerificationsScreen';
import AdminDisputesScreen from '../screens/admin/DisputesScreen';
import AdminPricingScreen from '../screens/admin/PricingScreen';

// Call Center
import CallCenterDashScreen from '../screens/callcenter/DashboardScreen';

// ─── Navigator types ──────────────────────────────────────────────────────────

export type RootStackParams = {
  Splash: undefined;
  RoleSelect: undefined;
  PhoneAuth: { role: string };
  OTP: { phone: string; role: string };
  PosterApp: undefined;
  LiferApp: undefined;
  AdminApp: undefined;
  CallCenterApp: undefined;
};

const Stack = createNativeStackNavigator<RootStackParams>();
const Tab = createBottomTabNavigator();
const PosterStack = createNativeStackNavigator();
const LiferStack = createNativeStackNavigator();
const AdminStack = createNativeStackNavigator();

// ─── Tab icon helper ──────────────────────────────────────────────────────────

function TabIcon({ label, emoji, focused, color }: { label: string; emoji: string; focused: boolean; color: string }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: focused ? 22 : 20 }}>{emoji}</Text>
    </View>
  );
}

// ─── Poster App ───────────────────────────────────────────────────────────────

function PosterHomeStack() {
  return (
    <PosterStack.Navigator screenOptions={{ headerShown: false }}>
      <PosterStack.Screen name="PosterHome" component={PosterHomeScreen} />
      <PosterStack.Screen name="CreateTask" component={CreateTaskScreen} />
      <PosterStack.Screen name="Searching" component={SearchingScreen} />
      <PosterStack.Screen name="PosterTaskDetail" component={PosterTaskDetailScreen} />
      <PosterStack.Screen name="Invoice" component={InvoiceScreen} />
      <PosterStack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
    </PosterStack.Navigator>
  );
}

function PosterApp() {
  const { getUnreadCount } = useApp();
  const unread = getUnreadCount();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingBottom: 6,
          paddingTop: 6,
          height: 62,
        },
        tabBarActiveTintColor: Colors.posterPrimary,
        tabBarInactiveTintColor: Colors.gray400,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500', marginTop: 2 },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={PosterHomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🏠" label="Home" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="TasksTab"
        component={PosterTasksScreen}
        options={{
          tabBarLabel: 'My Tasks',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="📋" label="Tasks" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="WalletTab"
        component={WalletScreen}
        options={{
          tabBarLabel: 'Wallet',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="💳" label="Wallet" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="NotifsTab"
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'Alerts',
          tabBarBadge: unread > 0 ? unread : undefined,
          tabBarBadgeStyle: { backgroundColor: Colors.error },
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🔔" label="Alerts" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="👤" label="Profile" focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ─── Lifer App ────────────────────────────────────────────────────────────────

function LiferDiscoverStack() {
  return (
    <LiferStack.Navigator screenOptions={{ headerShown: false }}>
      <LiferStack.Screen name="LiferDiscover" component={LiferDiscoverScreen} />
      <LiferStack.Screen name="LiferTaskPreview" component={LiferTaskPreviewScreen} />
      <LiferStack.Screen name="ActiveJob" component={ActiveJobScreen} />
      <LiferStack.Screen name="Verification" component={VerificationScreen} />
    </LiferStack.Navigator>
  );
}

function LiferApp() {
  const { getUnreadCount } = useApp();
  const unread = getUnreadCount();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingBottom: 6,
          paddingTop: 6,
          height: 62,
        },
        tabBarActiveTintColor: Colors.liferPrimary,
        tabBarInactiveTintColor: Colors.gray400,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500', marginTop: 2 },
      }}
    >
      <Tab.Screen
        name="DiscoverTab"
        component={LiferDiscoverStack}
        options={{
          tabBarLabel: 'Discover',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🔍" label="Discover" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="EarningsTab"
        component={LiferEarningsScreen}
        options={{
          tabBarLabel: 'Earnings',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="💰" label="Earnings" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="LiferNotifsTab"
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'Alerts',
          tabBarBadge: unread > 0 ? unread : undefined,
          tabBarBadgeStyle: { backgroundColor: Colors.error },
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🔔" label="Alerts" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="LiferProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="👤" label="Profile" focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ─── Admin App ────────────────────────────────────────────────────────────────

function AdminApp() {
  return (
    <AdminStack.Navigator screenOptions={{ headerShown: false }}>
      <AdminStack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <AdminStack.Screen name="AdminVerifications" component={AdminVerificationsScreen} />
      <AdminStack.Screen name="AdminDisputes" component={AdminDisputesScreen} />
      <AdminStack.Screen name="AdminPricing" component={AdminPricingScreen} />
      <AdminStack.Screen name="AdminProfile" component={ProfileScreen} />
    </AdminStack.Navigator>
  );
}

// ─── Root Navigator ───────────────────────────────────────────────────────────

export default function AppNavigator() {
  const { currentUser, isLoading } = useApp();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {isLoading ? (
        <Stack.Screen name="Splash" component={SplashScreen} />
      ) : !currentUser ? (
        <>
          <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
          <Stack.Screen name="PhoneAuth" component={PhoneAuthScreen} />
          <Stack.Screen name="OTP" component={OTPScreen} />
        </>
      ) : currentUser.role === 'poster' ? (
        <Stack.Screen name="PosterApp" component={PosterApp} />
      ) : currentUser.role === 'lifer' ? (
        <Stack.Screen name="LiferApp" component={LiferApp} />
      ) : currentUser.role === 'admin' ? (
        <Stack.Screen name="AdminApp" component={AdminApp} />
      ) : (
        <Stack.Screen name="CallCenterApp" component={CallCenterDashScreen} />
      )}
    </Stack.Navigator>
  );
}
