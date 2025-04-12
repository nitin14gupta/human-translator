import { Stack } from "expo-router";
import "@/global.css";
import React from "react";
export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(shared)" options={{ headerShown: false }} />
    </Stack>
  );
}

