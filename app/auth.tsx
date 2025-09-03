import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from "expo-network";
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native';
import { FontAwesome6 as FIcon6 } from "react-native-vector-icons";

export default function Screen() {
  const [password, setPassword] = useState('');
  const [seeIt, setSeeIt] = useState(true);
  const [refresh, SetRefresh] = useState(false);
  const router = useRouter()
  
  const checkConnection = async () => {
    const networkState = await Network.getNetworkStateAsync();
    
    return networkState.isConnected;
  };

  const handleLogin = async () => {
    SetRefresh(true)
    if (password) {
      
      const isConnected = await checkConnection();
      // console.log(isConnected);
      if (!isConnected) {
        ToastAndroid.show("Aucune connexion Internet disponible.", ToastAndroid.LONG);
        SetRefresh(false)
        return;
      }

      try {
        const response = await fetch("https://taxeparking.mastagate.com/api/validation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "validate@taxe"
          }),
        });

        const data = await response.json();
        
        if (response.ok) {
          console.log('Connexion réussie');
          if (data.user.name === password) {
            router.replace('/login');
            await AsyncStorage.setItem('validate', 'validate');
          } // Naviguer vers Home après connexion
          else ToastAndroid.show('Attention code d\'accès invalide !', ToastAndroid.LONG)
        }
        else ToastAndroid.show('Echec de validation !', ToastAndroid.LONG)

      } catch (e) {
        console.error('Error saving data:', e);
        ToastAndroid.show('Problème de connexion !', ToastAndroid.LONG);
      } finally {
        SetRefresh(false)
      }
    } else {
      ToastAndroid.show('Veuillez remplir les champs', ToastAndroid.LONG);
    }
    SetRefresh(false)
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const value = await AsyncStorage.getItem('validate');
        if (value !== null) {
          router.replace('/login');
        }
      } catch (e) {
        console.error('Error reading data:', e);
      }
    };

    getUser();
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: "center", paddingHorizontal: 30 }}>

      <View style={{ width: "100%", alignItems: 'center', justifyContent: "center", }}>

        <View style={{ width: 90, height: 90, backgroundColor: "#ced9de", borderRadius: 100, marginBottom: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Image source={require('../assets/ville.png')} style={{ width: '60%', height: '70%' }} />
        </View>

        <Text style={{ fontFamily: 'MontserratBold', fontSize: 16, textAlign: "center" }}>Taxe Parking</Text>
        <Text style={{ fontFamily: 'Montserrat', marginBottom: 15, textAlign: "center" }}>Entrez le code d'accès !</Text>

        <TextInput value={password} onChangeText={setPassword} secureTextEntry={seeIt} style={{ ...styles.subscriptionDescription, borderWidth: 1, borderColor: "#555", backgroundColor: '#e9e9e9', width: "100%", borderRadius: 25 }} placeholder={'Code de validation'} />

        <View style={{ width: "100%" }}>
          <TouchableOpacity style={{ padding: 5, position: 'absolute', top: -40, right: 10 }} onPress={()=> setSeeIt(!seeIt)}>
            {seeIt && <FIcon6 name="eye-slash" size={18} />}
            {!seeIt && <FIcon6 name="eye" size={18} />}
          </TouchableOpacity>
        </View>

        <View>
          <Text style={styles.benefitText}></Text>
        </View>

        <TouchableOpacity style={{ ...styles.subscribeButton, width: "100%", borderRadius: 25 }} disabled={refresh} onPress={handleLogin}>
          <Text style={{ ...styles.subscribeButtonText }}>Valider</Text>
          {refresh && <ActivityIndicator style={{ position: "absolute", alignSelf: 'center', top: 10 }} />}
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 0,
  },
  header: {
    paddingBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subscriptionScroll: {
    marginTop: 10,
  },
  subscriptionCard: {
    backgroundColor: '#444',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
  },
  subscriptionTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Montserrat',
  },
  subscriptionPrice: {
    fontSize: 16,
    color: '#ff9900',
    fontFamily: 'Montserrat',
    marginVertical: 5,
  },
  subscriptionDescription: {
    fontSize: 12,
    color: '#555',
    paddingHorizontal: 30,
    paddingVertical: 15,
    fontFamily: 'Montserrat',
  },
  benefitText: {
    fontSize: 14,
    color: '#555',
    fontFamily: 'Montserrat',
  },
  subscribeButton: {
    backgroundColor: '#ff9900',
    paddingVertical: 13,
    borderRadius: 5,
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Montserrat',
  },
});
