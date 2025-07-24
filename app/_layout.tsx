import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
      <Stack screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: 'transparent' }
      }}>
        <Stack.Screen name="(screens)/AuthScreen" />
        <Stack.Screen name="(screens)/LoginScreen" />
        <Stack.Screen name="(screens)/HomeScreen" />
        <Stack.Screen name="(screens)/ControlScreen" />
        <Stack.Screen name="(screens)/FormScreen" />
        <Stack.Screen name="(screens)/PrintScreen" />
        <Stack.Screen name="(screens)/StoryScreen" />
        <Stack.Screen name="(screens)/StoryPrintScreen" />
        <Stack.Screen name="(screens)/UserScreen" />
      </Stack>
  );
}