import { View, Text } from 'react-native'
import "./global.css"
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Layout(){
    return(
        <SafeAreaView>  
            <Text className='text-2xl text-blue-700'>hello I'm VacationSaga</Text>
        </SafeAreaView>
    )
}