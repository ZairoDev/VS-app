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
  MutedHeading: {
    fontWeight: 600,
    fontSize: 28,
    color: "#4D4C5C",
  },
  SubHeading: {
    fontWeight: 500,
    fontSize: 24,
  },
  MutedSubHeading: {
    fontWeight: 500,
    fontSize: 24,
    color: "#4D4C5C",
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
  MutedText: {
    fontSize: 16,
    textAlign: "justify",
    color: "#4D4C5C",
  },
});
 