import React from 'react';
import { View, Text, Platform, StatusBar } from 'react-native';

export default function SettingsScreen() {
  const topGap = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 44;
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: topGap }}>
      <Text>Settings Screen</Text>
    </View>
  );
}
