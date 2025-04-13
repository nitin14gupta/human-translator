import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="login" 
        options={{ 
          headerShown: false,
          title: 'Login'
        }} 
      />
      <Stack.Screen 
        name="register" 
        options={{ 
          headerShown: false,
          title: 'Register'
        }} 
      />
      <Stack.Screen 
        name="forgotPassword" 
        options={{ 
          headerShown: false,
          title: 'Forgot Password'
        }} 
      />
    </Stack>
  );
} 