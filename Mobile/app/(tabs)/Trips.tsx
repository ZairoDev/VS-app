import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet, TouchableOpacity, Modal, Text } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region} from "react-native-maps";
import axios from "axios";
     
import { Ionicons } from "@expo/vector-icons";

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
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const [region, setRegion] = useState<Region>({
    latitude: 37.9838,
    longitude: 23.7275,
    latitudeDelta: 0.04,  
    longitudeDelta: 0.04,
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
    const minLng = longitude- longitudeDelta / 2;
    const maxLng = longitude+ longitudeDelta / 2;

    let zoomLevel = Math.log2(360 / latitudeDelta); 
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

  const handleMarkerPress = (property: Property) => {
    setSelectedProperty(property);
    console.log("select markers se aati hui info",selectedProperty)
    setModalVisible(true);
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
        provider={PROVIDER_GOOGLE}
        onRegionChangeComplete={(newRegion) => {
          setRegion(newRegion);
          filterMarkers(newRegion);
        }}
      >
        {filteredProperties.map((property) =>
          property.center ? (
            <Marker
              onPress={() => handleMarkerPress(property)}
              key={property._id}
              coordinate={{
                latitude: property.center.lat,
                longitude: property.center.lng,
              }}
            >
              <Ionicons name="location-sharp" size={30} color="red" />

            </Marker>
          ) : null
        )}
      </MapView>

      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            {selectedProperty && (
              <>
                <Text style={styles.modalTitle}>hellowww</Text>
                <Text style={styles.modalDescription}>
                  selectedProperty
                </Text>
              </>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
  },
});