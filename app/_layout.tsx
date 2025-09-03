import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';

export default function Layout() {
    const [user, SetUser] = useState<any>({});
    const getUser = async () => {
      try {
        const value = await AsyncStorage.getItem('user');
        if (value !== null) {
          SetUser(JSON.parse(value));
        }
      } catch (e) {
        console.error('Error fetching data:', e);
      }
    };

    useEffect(() => {
      getUser()
    }, []);

  return (
      <Stack screenOptions={{ 
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: 'transparent' }
      }}>
        <Stack.Screen name="auth" />
        {user.id ? <Stack.Screen name="(screens)/home" /> : <Stack.Screen name="login" />}
      </Stack>
  );
} 