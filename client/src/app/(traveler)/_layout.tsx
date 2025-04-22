import { Stack } from "expo-router";

export default function Layout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="[id]" />
            <Stack.Screen name="requests" />
            <Stack.Screen name="(translator)" />
            <Stack.Screen name="payment" />
        </Stack>
    );
}