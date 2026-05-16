import React from 'react';
import { Tabs } from 'expo-router';
import { House, Gear } from 'phosphor-react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#9A3412',
        tabBarInactiveTintColor: '#1E293B',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#F8F4E9',
          borderTopColor: 'rgba(30, 41, 59, 0.1)',
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'The Hub',
          tabBarIcon: ({ color }) => <House size={24} color={color} weight="duotone" />,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Archive',
          tabBarIcon: ({ color }) => <Gear size={24} color={color} weight="duotone" />,
        }}
      />
    </Tabs>
  );
}
