import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import { MagicColors } from '@/constants/theme';

function TabIcon({ iconName, focused }: { iconName: string; focused: boolean }) {
  return (
    <View style={styles.tabIconContainer}>
      <Ionicons
        name={iconName as any}
        size={28}
        color={focused ? MagicColors.goldVibrant : MagicColors.textLight}
      />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: MagicColors.gold,
        tabBarInactiveTintColor: MagicColors.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Spellbook',
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="book" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="recycle"
        options={{
          title: 'Recycle',
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="leaf" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="energy"
        options={{
          title: 'Energy',
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="flash" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="donate"
        options={{
          title: 'Donate',
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="heart" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="person" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: MagicColors.darkSurface,
    borderTopColor: MagicColors.border,
    borderTopWidth: 1,
    height: 70,
    paddingTop: 8,
    paddingBottom: 8,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
