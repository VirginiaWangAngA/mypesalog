cat << 'EOF'
// App.js — PesaLog v1.0
// Vee's personal M-Pesa SMS expense tracker

import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import LogScreen from './screens/LogScreen';
import DashboardScreen from './screens/DashboardScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#085041' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '500' },
          tabBarActiveTintColor: '#085041',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: { borderTopColor: '#eee' },
        }}
      >
        <Tab.Screen
          name="Log"
          component={LogScreen}
          options={{
            title: 'PesaLog',
            tabBarLabel: 'Log',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📋</Text>,
          }}
        />
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            title: 'Dashboard',
            tabBarLabel: 'Dashboard',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📊</Text>,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
EOF
echo "App.js content ready"
Output

// App.js — PesaLog v1.0
// Vee's personal M-Pesa SMS expense tracker

import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import LogScreen from './screens/LogScreen';
import DashboardScreen from './screens/DashboardScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#085041' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '500' },
          tabBarActiveTintColor: '#085041',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: { borderTopColor: '#eee' },
        }}
      >
        <Tab.Screen
          name="Log"
          component={LogScreen}
          options={{
            title: 'PesaLog',
            tabBarLabel: 'Log',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📋</Text>,
          }}
        />
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            title: 'Dashboard',
            tabBarLabel: 'Dashboard',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📊</Text>,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}