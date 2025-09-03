import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter, SplashScreen, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

function AuthGate() {
  useFrameworkReady();
  
  const [user, setUser] = useState(null);
  const [validate, setValidate] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  // Load authentication state from AsyncStorage
  useEffect(() => {
    async function loadAuthState() {
      try {
        const userValue = await AsyncStorage.getItem('user');
        const validateValue = await AsyncStorage.getItem('validate');
        
        setUser(userValue ? JSON.parse(userValue) : null);
        setValidate(validateValue);
      } catch (error) {
        console.error('Error loading auth state:', error);
      } finally {
        setIsAuthLoading(false);
        await SplashScreen.hideAsync();
      }
    }

    loadAuthState();
  }, []);

  // Handle navigation based on auth state
  useEffect(() => {
    if (isAuthLoading) return; // Don't navigate while loading

    const inAuthGroup = segments[0] === '(screens)';
    const inAuth = segments[0] === 'auth';
    const inLogin = segments[0] === 'login';

    // Determine target route based on auth state
    let targetRoute = '/auth'; // Default

    if (validate !== null) {
      // User has validated access code
      if (user !== null && user.accès === "ouvert") {
        if (user.role === "percepteur") {
          targetRoute = '/(screens)/home';
        } else if (user.role === "superviseur") {
          targetRoute = '/(screens)/control';
        } else {
          targetRoute = '/login';
        }
      } else {
        targetRoute = '/login';
      }
    }

    // Navigate if we're not already on the correct route
    const currentPath = '/' + segments.join('/');
    if (currentPath !== targetRoute) {
      router.replace(targetRoute);
    }
  }, [user, validate, isAuthLoading, segments]);

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

export default function Layout() {
  useFrameworkReady();
  return <AuthGate />;
}