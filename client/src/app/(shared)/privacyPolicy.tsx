import { useTranslation } from "react-i18next";
import { Text, View, ScrollView } from "react-native";
export default function PrivacyPolicy() {
  const { t } = useTranslation();

  return (
    <ScrollView>
      <Text>{t("privacyPolicy.title")}</Text>
      <Text>{t("privacyPolicy.description")}</Text>
    </ScrollView>
  );
}
