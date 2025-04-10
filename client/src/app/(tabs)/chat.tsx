import { useTranslation } from "react-i18next";
import { Text, View, StyleSheet } from "react-native";

export default function ChatScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("tabs.chat")}</Text>
      <Text style={styles.text}>Chat screen content will be implemented here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
  },
}); 