import React from 'react';
import { Tabs } from 'expo-router';
import { House, Gear } from 'phosphor-react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useI18n } from '@/context/I18nContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useI18n();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#9A3412',
        tabBarInactiveTintColor: '#1E293B',
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: '#FDFBF7',
          borderTopColor: 'rgba(30, 41, 59, 0.1)',
          borderTopWidth: 2,
          elevation: 0,
          height: 64,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'Figtree',
          fontSize: 10,
          letterSpacing: 1,
          textTransform: 'uppercase',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tab_hub'),
          tabBarIcon: ({ color }) => <House size={24} color={color} weight="duotone" />,
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: t('tab_settings'),
          tabBarIcon: ({ color }) => <Gear size={24} color={color} weight="duotone" />,
        }}
      />
    </Tabs>
  );
}

