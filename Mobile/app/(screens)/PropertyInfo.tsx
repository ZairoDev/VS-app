import { Ionicons } from "@expo/vector-icons"
import { Text, View,Image,StatusBar,FlatList,StyleSheet } from "react-native"

import { SafeAreaView } from "react-native-safe-area-context"
  
export default function PropertyInfo(){
    return(
        <SafeAreaView edges={["left", "right", "bottom"]} style={{ flex: 1 ,}} >
          <StatusBar hidden={true}/>
          <View style={{position:"relative"}}>
          <Image source={{uri:"https://images.unsplash.com/photo-1544952019-734321a2a151?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Zmxvd2VyJTIwdmFsbGV5fGVufDB8fDB8fHww"}} style={{height:300,width:"100%"}}/>
          <View style={styles.allPhotosTextContainer}>
            <Ionicons name="albums-outline" color={"white"} size={24}/>
            <Text style={{color:"white"}}> All Photos</Text>
          </View>
          </View>
          

          <FlatList data={[1]}
            renderItem={()=>(
              <View>
                <View style={{}}>
                   <Ionicons name="home-outline" color={"black"} size={24}/>
                   <Text style={{color:"black"}}> All Photos</Text>
                </View>
              </View>
            )}
          />
        </SafeAreaView>
    )

}

const styles = StyleSheet.create({
  allPhotosTextContainer:{
    display:"flex",
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center",
    height:35,
    width:"30%",
    gap:4,
    position:"absolute",
    bottom:0,
    margin:10,
    backgroundColor:"black",
    borderColor:"white",
    borderWidth:1,
    borderRadius:20
  }
  
})