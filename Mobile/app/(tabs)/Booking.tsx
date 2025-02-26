import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import MapView, { Marker, Region, Callout } from "react-native-maps";
import SuperCluster from "react-native-maps-super-cluster";
import axios from "axios";

interface Property {
  _id: string;
  title: string;
  center: {
    lat: number;
    lng: number;
  };
}

const mapStyle = [
  {
      "featureType": "administrative",
      "elementType": "labels.text.fill",
      "stylers": [
          {
              "color": "#444444"
          }
      ]
  },
  {
      "featureType": "administrative.country",
      "elementType": "geometry.stroke",
      "stylers": [
          {
              "visibility": "on"
          },
          {
              "color": "#817a7a"
          }
      ]
  },
  {
      "featureType": "administrative.land_parcel",
      "elementType": "geometry.stroke",
      "stylers": [
          {
              "visibility": "on"
          },
          {
              "color": "#685757"
          }
      ]
  },
  {
      "featureType": "landscape",
      "elementType": "all",
      "stylers": [
          {
              "color": "#f2f2f2"
          }
      ]
  },
  {
      "featureType": "poi",
      "elementType": "all",
      "stylers": [
          {
              "visibility": "off"
          }
      ]
  },
  {
      "featureType": "road",
      "elementType": "all",
      "stylers": [
          {
              "saturation": -100
          },
          {
              "lightness": 45
          }
      ]
  },
  {
      "featureType": "road.highway",
      "elementType": "all",
      "stylers": [
          {
              "visibility": "simplified"
          }
      ]
  },
  {
      "featureType": "road.arterial",
      "elementType": "labels.icon",
      "stylers": [
          {
              "visibility": "off"
          }
      ]
  },
  {
      "featureType": "transit",
      "elementType": "all",
      "stylers": [
          {
              "visibility": "off"
          }
      ]
  },
  {
      "featureType": "water",
      "elementType": "all",
      "stylers": [
          {
              "visibility": "on"
          },
          {
              "color": "#e8ecf0"
          }
      ]
  },
  {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [
          {
              "visibility": "on"
          },
          {
              "weight": "2.02"
          },
          {
              "lightness": "-3"
          },
          {
              "saturation": "9"
          },
          {
              "gamma": "0.90"
          }
      ]
  },
  {
      "featureType": "water",
      "elementType": "geometry.fill",
      "stylers": [
          {
              "weight": "2.11"
          }
      ]
  },
  {
      "featureType": "water",
      "elementType": "geometry.stroke",
      "stylers": [
          {
              "visibility": "on"
          },
          {
              "hue": "#ff5900"
          }
      ]
  }
]

const MapScreen = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<Region>({
    latitude: 37.9838,
    longitude: 23.7275,
    latitudeDelta: 0.07, // Default zoom level
    longitudeDelta: 0.07,
  });

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await axios.get(
          `${process.env.EXPO_PUBLIC_BASE_URL}/properties/getProperties`
        );
        setProperties(response.data.data);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const filterMarkers = (newRegion: Region) => {
    const { latitude, longitude, latitudeDelta, longitudeDelta } = newRegion;
    const minLat = latitude - latitudeDelta / 2;
    const maxLat = latitude + latitudeDelta / 2;
    const minLng = longitude - longitudeDelta / 2;
    const maxLng = longitude + longitudeDelta / 2;

    let zoomLevel = Math.log2(360 / latitudeDelta); // Approximate zoom level
    let densityFactor = zoomLevel < 5 ? 10 : zoomLevel < 8 ? 5 : zoomLevel < 10 ? 2 : 1;

    const visibleProperties = properties
      .filter((property) => {
        if (!property.center) return false;
        return (
          property.center.lat >= minLat &&
          property.center.lat <= maxLat &&
          property.center.lng >= minLng &&
          property.center.lng <= maxLng
        );
      })
      .filter((_, index) => index % densityFactor === 0);

    setFilteredProperties(visibleProperties);
  };

  return (
    <View style={{ flex: 1 }}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="blue" />
        </View>
      )}

      <MapView
        style={{ flex: 1 }}
        initialRegion={region}
        customMapStyle={mapStyle}
        onRegionChangeComplete={(newRegion) => {
          setRegion(newRegion);
          filterMarkers(newRegion);
        }}
      >
        {filteredProperties.map((property) =>
          property.center ? (
            <Marker
              key={property._id}
              coordinate={{
                latitude: property.center.lat,
                longitude: property.center.lng,
              }}
            >
            </Marker>
          ) : null
        )}
      </MapView>
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  calloutContainer: {
    padding: 8,
    backgroundColor: "white",
    borderRadius: 6,
    elevation: 3,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
