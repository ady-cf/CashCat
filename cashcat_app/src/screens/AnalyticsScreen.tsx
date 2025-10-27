import React from 'react';
import { View, Text, Platform, StatusBar } from 'react-native';

export default function AnalyticsScreen() {
  const topGap = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 44;
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: topGap }}>
      <Text>Analytics Screen</Text>
    </View>
  );
}
