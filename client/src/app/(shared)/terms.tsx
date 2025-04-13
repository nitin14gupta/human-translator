import { useTranslation } from "react-i18next";
import { Text, View, ScrollView, SafeAreaView } from "react-native";

export default function Terms() {
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 p-6">
        <Text className="text-2xl font-heading font-bold text-neutral-gray-800 mb-4">
          {t("terms.title")}
        </Text>
        <Text className="text-base text-neutral-gray-700 mb-6">
          {t("terms.description")}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
