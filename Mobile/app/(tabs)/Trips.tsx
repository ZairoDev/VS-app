import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
export default function Trips() {
  const [expanded, setExpanded] = useState(false);
  const height = useSharedValue(60);
  const opacity = useSharedValue(0);
  const animatedStyles = useAnimatedStyle(() => {
    return {
      height: height.value,
      overflow: "hidden", // Ensure content doesn't overflow during animation
    };
  });

  const filterOpacity = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const toggleExpand = () => {
    if (expanded) {
      height.value = withTiming(60, { duration: 300, easing: Easing.ease });
      opacity.value = withTiming(0, { duration: 200 });
    } else {
      height.value = withTiming(200, { duration: 300, easing: Easing.ease });
      opacity.value = withTiming(1, { duration: 200 });
    }
    setExpanded(!expanded);
  };
  return (
    <View style={styles.container}>
      <View>
        <Animated.View style={[styles.accordion, animatedStyles]}>
          <TouchableOpacity onPress={toggleExpand} style={styles.header}>
            <Ionicons name="options" size={24} color={"black"} />
          </TouchableOpacity>

          <Animated.View style={[styles.filtersContainer, filterOpacity]}>
            <Text style={styles.filterText}>Filter 1</Text>
            <Text style={styles.filterText}>Filter 2</Text>
            <Text style={styles.filterText}>Filter 3</Text>
          </Animated.View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "red",
  },
  accordion: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 3,
    borderColor: "blue",
  },
  header: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "red",
  },
  filtersContainer: {
    padding: 10,
    borderWidth: 4,
    borderColor: "pink",
  },
  filterText: {
    fontSize: 16,
    marginVertical: 5,
  },
});
