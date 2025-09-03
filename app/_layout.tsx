import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter, SplashScreen } from 'expo-router';
import { useEffect, useState } from 'react';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [isAppReady, setIsAppReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function initializeApp() {
  useFrameworkReady();
      try {
        // Check user authentication state
        const user = await AsyncStorage.getItem('user');
        const validate = await AsyncStorage.getItem('validate');

        let targetRoute = '/auth'; // Default route

        if (validate !== null) {
          // User has validated access code
          if (user !== null) {
            const parsedUser = JSON.parse(user);
            
            if (parsedUser.accès === "ouvert") {
              if (parsedUser.role === "percepteur") {
                targetRoute = '/(screens)/home';
              } else if (parsedUser.role === "superviseur") {
                targetRoute = '/(screens)/control';
              } else {
                targetRoute = '/login';
              }
            } else {
              targetRoute = '/login';
            }
          } else {
            targetRoute = '/login';
          }
        }

        // Navigate to the determined route
        router.replace(targetRoute);
        
        // Mark app as ready
        setIsAppReady(true);
        
        // Hide splash screen
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error('Error during app initialization:', error);
        // Fallback to auth screen
        router.replace('/auth');
        setIsAppReady(true);
        await SplashScreen.hideAsync();
      }
    }

    initializeApp();
  }, []);

  // Don't render anything until app is ready
  if (!isAppReady) {
    return null;
  }

  return (
    <Stack screenOptions={{ 
      headerShown: false,
      animation: 'fade',
      contentStyle: { backgroundColor: 'transparent' }
    }}>
      <Stack.Screen name="auth" />
      <Stack.Screen name="login" />
      <Stack.Screen name="(screens)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}