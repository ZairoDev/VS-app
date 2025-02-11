import React, { useState } from "react";
import { View, Text, StyleSheet, PanResponder, Animated } from "react-native";
import Svg, { Line, Circle } from "react-native-svg";

const Slider = ({ min = 0, max = 100, step = 1 }) => {
  const [sliderValue, setSliderValue] = useState(min);
  const trackWidth = 300;
  const thumbRadius = 15;
  const pan = new Animated.Value(0); // Use Animated.Value instead of Animated.ValueXY

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      let newX = Math.min(Math.max(0, gestureState.dx), trackWidth);
      let newValue = Math.round((newX / trackWidth) * (max - min) / step) * step + min;
      setSliderValue(newValue);
      pan.setValue(newX);
    },
  });

  // Convert Animated value to a number for SVG components
  const getAnimatedValue = (animatedValue: Animated.Value) => {
    return animatedValue.interpolate({
      inputRange: [0, trackWidth],
      outputRange: [0, trackWidth],
      extrapolate: "clamp",
    }) as unknown as number; // Cast as number
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Value: {sliderValue}</Text>

      <View style={styles.sliderContainer}>
        <Svg height="40" width={trackWidth.toString()}>
          {/* Track Line */}
          <Line x1="0" y1="20" x2={trackWidth.toString()} y2="20" stroke="#ccc" strokeWidth="5" />
          
          {/* Active Track (uses interpolated value as number) */}
          <Line
            x1="0"
            y1="20"
            x2={getAnimatedValue(pan).toString()} 
            y2="20"
            stroke="#FF69B4"
            strokeWidth="5"
          />

          {/* Thumb (Animated View) */}
          <Animated.View
            style={[
              styles.thumb,
              { transform: [{ translateX: pan }] },
            ]}
            {...panResponder.panHandlers}
          >
            <Circle cx={thumbRadius} cy="20" r={thumbRadius} fill="#FF4500" />
          </Animated.View>
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  sliderContainer: {
    width: 300,
    height: 40,
    justifyContent: "center",
  },
  thumb: {
    position: "absolute",
    top: 5,
    width: 30,
    height: 30,
  },
});

export default Slider;
