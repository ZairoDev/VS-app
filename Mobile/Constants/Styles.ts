import { StyleSheet } from "react-native";

export const globalStyles = StyleSheet.create({
  Container: {
    maxWidth: "95%",
    marginHorizontal: 15,
    display: "flex",
    gap: 10,
    marginTop: 10,
  },
  Heading: {
    fontWeight: 600,
    fontSize: 28,
  },
  SubHeading: {
    fontWeight: 500,
    fontSize: 24,
  },
  Text: {
    fontSize: 16,
    textAlign: "justify",
  },
  TextSemibold: {
    fontSize: 16,
    fontWeight: 500,
  },
  TextBold: {
    fontSize: 16,
    fontWeight: 600,
  },
});
