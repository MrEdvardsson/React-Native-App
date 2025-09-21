import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Hem" }} />
      <Stack.Screen name="search" options={{ title: "Sök stad" }} />
    </Stack>
  );
}
