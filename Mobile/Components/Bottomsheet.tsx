// Components/Bottomsheet.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View, Text, Button, StyleSheet, Image } from 'react-native';
import { Modalize } from 'react-native-modalize';


export interface BottomSheetRef {
    open: () => void;
    close: () => void;
  }
  
const BottomSheet = forwardRef((props, ref) => {
  const modalRef = useRef<Modalize>(null);

  // Expose open and close methods to parent component via ref
  useImperativeHandle(ref, () => ({
    open: () => modalRef.current?.open(),
    close: () => modalRef.current?.close(),
  }));

  return (
    <Modalize
      ref={modalRef}
      snapPoint={1000}
      modalHeight={800}
      
    >
      <View style={styles.mainContainer} >
        <Image style={styles.imageContainer} source={{uri:"https://images.pexels.com/photos/22610592/pexels-photo-22610592/free-photo-of-view-of-green-trees-reflecting-in-a-body-of-water.jpeg?auto=compress&cs=tinysrgb&w=600"}}/>
        <View style={styles.photoText}>
        <Ionicons name='albums-outline' size={22}/><Text >Show all Photos</Text>
        </View>
        <View style={styles.featuredText}>
        <Text style={{color:"gray",padding:2}}>1 beds</Text>
        <Text style={{fontSize:17,fontWeight:500,padding:2}}>VS ID - X3DQ0BS, Villa</Text>
        <Text style={{color:"gray",padding:2}}><Ionicons name="location-outline" size={15} color="gray" />30019 Municipal Unit of Palairos Greece</Text>

        <Text style={{fontSize:27,fontWeight:600,padding:2,marginTop:5}}>Stay Information</Text>
        <Text style={{color:"gray",padding:2,}} >Located right on the beach of Agios Georgios Pagon, House Eleni offers accommodation with free Wi-Fi. It has a terrace and barbecue. The holiday home includes 2 bedrooms and a bathroom with a hairdryer. The kitchen is equipped with an oven, fridge, hotplates, coffee maker and kettle. Guests can also relax in the garden. The nearest airport is Corfu International Airport, at a distance of 33 km. from the accommodation.</Text>
        </View>
      </View>
    </Modalize>
  );
});

const styles = StyleSheet.create({
    mainContainer:{
        flex: 1,
        marginTop:15,
        alignItems:"center",
        width: "100%",
        height: "100%",
    },
    imageContainer:{
        height:230,
        width:330,
        borderRadius:20
    },
    photoText:{
        margin:15,
        backgroundColor:"rgba(0,0,0,0.3)",
        flex:1,
        flexDirection:"row",
        justifyContent:"center",
        alignItems:"center",
        padding:8,
        borderRadius:20,
    },
    featuredText:{
        width: "100%",
        padding: 30,

    }
  
});

export default BottomSheet;
