import { View,Text, TextInput ,StyleSheet,Platform} from "react-native";
export default function Explore(){
    return (
        <View style={styles.container}>
            
            <TextInput  style={styles.input} placeholder="Start Search" placeholderTextColor={"gray"} />
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:"",
      alignItems: "center",
      width: "100%",
      height: "100%",
    },
    input: {
      textAlign: "left",
      width: "75%",
      height: 50,
      backgroundColor: "#fff",
      borderRadius: 20, // Rounded corners
      margin: 16,
      paddingLeft: 20,
      fontSize: 20,
      shadowColor:"#000",
      elevation:20,
      shadowOffset:{width:5,height:40}
     
      
    },
  });