import { Stack } from "expo-router";

export default function SharedLayout() {
  return (
    <Stack>
      <Stack.Screen name="roleSelection" options={{ headerShown: false }} />
      <Stack.Screen name="languageSelection" options={{ headerShown: false }} />
      <Stack.Screen name="Authentication" options={{ headerShown: false }} />
      <Stack.Screen name="terms" options={{ headerShown: false }} />
      <Stack.Screen name="privacyPolicy" options={{ headerShown: false }} />
      <Stack.Screen name="Verification" options={{ headerShown: false }} />
    </Stack>
  );
}
