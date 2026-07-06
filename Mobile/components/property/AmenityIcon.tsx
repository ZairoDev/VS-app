import React from "react"
import {
  Entypo,
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons"
import { getAmenityIcon, type AmenityIconDescriptor } from "@/utils/property-display"

type AmenityIconProps = {
  amenity: string
  size?: number
  color: string
  icon?: AmenityIconDescriptor
}

export function AmenityIcon({ amenity, size = 18, color, icon }: AmenityIconProps) {
  const { family, name } = icon ?? getAmenityIcon(amenity)

  switch (family) {
    case "entypo":
      return <Entypo name={name as React.ComponentProps<typeof Entypo>["name"]} size={size} color={color} />
    case "material":
      return (
        <MaterialIcons name={name as React.ComponentProps<typeof MaterialIcons>["name"]} size={size} color={color} />
      )
    case "material-community":
      return (
        <MaterialCommunityIcons
          name={name as React.ComponentProps<typeof MaterialCommunityIcons>["name"]}
          size={size}
          color={color}
        />
      )
    case "feather":
      return <Feather name={name as React.ComponentProps<typeof Feather>["name"]} size={size} color={color} />
    case "font-awesome-5":
      return (
        <FontAwesome5 name={name as React.ComponentProps<typeof FontAwesome5>["name"]} size={size} color={color} />
      )
    default:
      return <Ionicons name={name as React.ComponentProps<typeof Ionicons>["name"]} size={size} color={color} />
  }
}
