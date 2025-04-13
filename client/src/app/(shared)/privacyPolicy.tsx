import { useTranslation } from "react-i18next";
import { Text, View, ScrollView, SafeAreaView } from "react-native";

export default function PrivacyPolicy() {
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 p-6">
        <Text className="text-2xl font-heading font-bold text-neutral-gray-800 mb-4">
          {t("privacyPolicy.title")}
        </Text>
        <Text className="text-base text-neutral-gray-700 mb-6">
          {t("privacyPolicy.description")}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
