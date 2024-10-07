import { Tabs, Stack } from 'expo-router';
import React from 'react';
import {View, Text} from 'react-native';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
      <Stack
        screenOptions={{
          headerShown: false,
        }}>

      </Stack>
);
}
