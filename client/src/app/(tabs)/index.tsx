import { useTranslation } from "react-i18next";
import { Text } from "react-native";
export default function TabOneScreen() {
  const { t } = useTranslation();

  return <Text>{t("home.title")}</Text>;
}
