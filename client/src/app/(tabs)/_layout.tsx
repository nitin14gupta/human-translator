import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false,
        animation: "fade",
        tabBarStyle: {
          display: 'none', // This tab bar isn't visible anyway
        },
      }}
    >
      <Tabs.Screen 
        name="traveler" 
        options={{ 
          href: null,
        }} 
      />
      <Tabs.Screen 
        name="translator" 
        options={{ 
          href: null,
        }} 
      />
    </Tabs>
  );
}
