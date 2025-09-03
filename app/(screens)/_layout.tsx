import { Stack } from 'expo-router';

export default function Layout() {
  return (
      <Stack screenOptions={{ 
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: 'transparent' }
      }}>
        <Stack.Screen name="home" />
        <Stack.Screen name="control" />
        <Stack.Screen name="form" />
        <Stack.Screen name="print" />
        <Stack.Screen name="story" />
        <Stack.Screen name="storyprint" />
        <Stack.Screen name="user" />
      </Stack>
  );
}