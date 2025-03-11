import  { useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { Button, View, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

interface AppProps {}




const App: React.FC<AppProps> = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '360635271354-alregk7srqb6s410kr9de76f6n19bt5a.apps.googleusercontent.com', 
    androidClientId: '360635271354-alregk7srqb6s410kr9de76f6n19bt5a.apps.googleusercontent.com',
  
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (response?.type === 'success' && response.authentication) {
      const { authentication } = response;
      const accessToken = authentication.accessToken;
      sendTokenToBackend(accessToken);
    }
  }, [response]);

  const sendTokenToBackend = async (token: string) => {
    setIsLoading(true);
    try {
      const backendEndpoint = 'http://192.168.109.29:8000/auth/verify-google-token'; // Replace with your backend endpoint
      const response = await fetch(backendEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        const data: { userId: string } = await response.json();
        const userId = data.userId;
        await AsyncStorage.setItem('userId', userId);
        console.log('User ID:', userId);
        Alert.alert('Google Login Success', 'You are logged in');
        // Navigate to your app's main screen or perform other actions
      } else {
        Alert.alert('Login Failed', 'Failed to verify token. Please try again.');
        console.error('Failed to send token to backend:', response.status, response.statusText);
      }
    } catch (error) {
      Alert.alert('Network Error', 'Could not connect to the server.');
      console.error('Error sending token to backend:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    if (request) {
      promptAsync();
    } else {
      Alert.alert('Error', 'Google login not available.');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button
        disabled={!request || isLoading}
        title={isLoading ? 'Logging In...' : 'Login with Google'}
        onPress={handleLogin}
      />
      {isLoading && <ActivityIndicator style={{ marginTop: 10 }} />}
    </View>
  );
};

export default App;