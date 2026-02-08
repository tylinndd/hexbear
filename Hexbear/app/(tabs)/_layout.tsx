import { Tabs } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { MagicColors } from '@/constants/theme';

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabIconContainer}>
      <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>
        {icon}
      </Text>
      <Text
        style={[
          styles.tabLabel,
          focused ? styles.tabLabelActive : styles.tabLabelInactive,
        ]}
      >
        {label}
      </Text>
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
            <TabIcon icon="📖" label="Spellbook" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="recycle"
        options={{
          title: 'Recycle',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="♻️" label="Recycle" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="energy"
        options={{
          title: 'Energy',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="⚡" label="Energy" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="donate"
        options={{
          title: 'Donate',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🍞" label="Donate" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🧙" label="Profile" focused={focused} />
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
    height: 80,
    paddingTop: 8,
    paddingBottom: 16,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabIcon: {
    fontSize: 22,
    opacity: 0.6,
  },
  tabIconActive: {
    opacity: 1,
    fontSize: 24,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: MagicColors.gold,
  },
  tabLabelInactive: {
    color: MagicColors.textMuted,
  },
});
