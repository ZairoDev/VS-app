import { MaterialIcons } from "@expo/vector-icons";

import { FontAwesome } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { Fontisto } from "@expo/vector-icons";

type FeaturedPropertyTypes = {
  id: number;
  name: string;
  icon: (color:string)=>JSX.Element;
};

export const Countries = [
  {
    id: "1",
    name: "Greece",
    imageUrl:
      "https://images.pexels.com/photos/14811125/pexels-photo-14811125.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    href: "",
  },
  {
    id: "2",
    name: "Italy",
    imageUrl:
      "https://images.pexels.com/photos/1701595/pexels-photo-1701595.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    href: "",
  },
  {
    id: "3",
    name: "Romania",
    imageUrl:
      "https://images.pexels.com/photos/10774499/pexels-photo-10774499.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    href: "",
  },
  {
    id: "4",
    name: "Spain",
    imageUrl:
      "https://images.pexels.com/photos/17179230/pexels-photo-17179230/free-photo-of-view-of-the-sagrada-familia-barcelona-spain.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    href: "",
  },
  {
    id: "5",
    name: "Croatia",
    imageUrl:
      "https://images.pexels.com/photos/3566139/pexels-photo-3566139.jpeg?auto=compress&cs=tinysrgb&w=600",
    href: "",
  },
  {
    id: "6",
    name: "Slovenia",
    imageUrl:
      "https://images.pexels.com/photos/3214969/pexels-photo-3214969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    href: "",
  },
  {
    id: "7",
    name: "Slovakia",
    imageUrl:
      "https://images.pexels.com/photos/280173/pexels-photo-280173.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    href: "",
  },
];

export const propertyTypes: FeaturedPropertyTypes[] = [
  {
    id: 1,
    name: "Apartment",
    icon:(color:string)=> <MaterialIcons name="apartment" size={24} color={color} />,
  },
  {
    id: 2,
    name: "Villa",
    icon:(color:string)=> <MaterialIcons name="villa" size={24} color={color} />,
  },
  {
    id: 3,
    name: "Holiday Homes",
    icon:(color:string)=> <Fontisto name="holiday-village" size={24} color={color} />,
  },
  {
    id: 4,
    name: "Hotel",
    icon:(color:string)=> <FontAwesome5 name="hotel" size={20} color={color} />,
  },
  {
    id: 5,
    name: "Detached House",
    icon:(color:string)=> <MaterialIcons name="house" size={24} color={color} />,
  },
  {
    id: 6,
    name: "Studio",
    icon:(color:string)=> <FontAwesome5 name="camera-retro" size={19} color={color} />,
  },
  {
    id: 7,
    name: "Farmhouse",
    icon:(color:string)=> <MaterialIcons name="forest" size={24} color={color} />,
  },
  {
    id: 8,
    name: "Cottage",
    icon:(color:string)=> <MaterialIcons name="cottage" size={24} color={color} />,
  },
];

//Apartment,Villa,HolidayHomes ,Hotel,Detached House ,Studio,Cottage,Farmhouse
