import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from "expo-network";
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native';
import { FontAwesome6 as FIcon6 } from "react-native-vector-icons";

export default function Screen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [seeIt, setSeeIt] = useState(true);
  const [refresh, SetRefresh] = useState(false);
  const router = useRouter()

  const checkConnection = async () => {
    const networkState = await Network.getNetworkStateAsync();

    return networkState.isConnected;
  };

  const handleLogin = async () => {
    // Exemple : Gérer la connexion
  
    SetRefresh(true)
    if (email && password) {

      const isConnected = await checkConnection();

      if (!isConnected) {
        ToastAndroid.show("Aucune connexion Internet disponible.", ToastAndroid.LONG);
        SetRefresh(false)
        return;
      }

      try {
        const response = await fetch("https://taxeparking.mastagate.com/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.toLocaleLowerCase(),
            password: password,
          }),
        });

        const data = await response.json();
        console.log(data)
        if (data.message == "Invalid credentials") ToastAndroid.show('Identifiant Introuvable !', ToastAndroid.LONG)
        else if (data.status == "danger") {
          ToastAndroid.show('Utilisateur déjà connecté dans un autre terminal, Attention !', ToastAndroid.LONG)
          setEmail('')
          setPassword('')
        }
        else if (data.status == "success") {
          if (data.user.accès === "ouvert" && data.user.role === "percepteur") {
            await AsyncStorage.setItem('user', JSON.stringify(data.user));
            
            const responses2 = await fetch(`https://taxeparking.mastagate.com/api/user/data/${data.user.id}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            });

            const retour = await responses2.json();

            // console.log(retour.data)

            if (responses2.ok) {
              await AsyncStorage.setItem('dashboard', JSON.stringify(retour.data))
            }
            
            else if (retour.status == "error") await AsyncStorage.setItem('dashboard', JSON.stringify({ Tickets: 0, Mont_Pos: 0 }))
            router.replace('/(screens)/home'); // Naviguer vers Home après connexion
              
          }
          else if (data.user.accès === "ouvert" && data.user.role === "superviseur") {
            await AsyncStorage.setItem('user', JSON.stringify(data.user));
            const lastPerson = await AsyncStorage.getItem('lastPerson');

            if (lastPerson !== null) {
              let person = JSON.parse(lastPerson);
              console.log(person)
              const responses2 = await fetch(`https://taxeparking.mastagate.com/api/user/data/${person.id}`, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              });
  
              const retour = await responses2.json();
              if (responses2.ok) {
                await AsyncStorage.setItem('lastData', JSON.stringify(retour.data))
              }
            }

            router.replace('/(screens)/control');
          }
          else ToastAndroid.show('Désolé votre Accès est fermé, Contacter l\'Administrateur ', ToastAndroid.LONG)
          setEmail('')
          setPassword('')
        }

      } catch (e) {
        console.error('Error saving data:', e);
        ToastAndroid.show('Vérifiez votre connexion !', ToastAndroid.LONG);
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
        const value = await AsyncStorage.getItem('user');
        if (value !== null) {
          console.log(JSON.parse(value).accèsr)
          if (JSON.parse(value).role === "percepteur" && JSON.parse(value).accès === "ouvert") router.replace('/(screens)/home');
          else if (JSON.parse(value).role === "superviseur" && JSON.parse(value).accès === "ouvert") router.replace('/(screens)/control');
        }
      } catch (e) {
        console.error('Error reading data:', e);
      }
    };

    getUser();
  }, [])

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: "center", paddingHorizontal: 30, }}>

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ width: '100%', flexGrow: 1, alignItems: 'center', justifyContent: "center", }} style={{ width: '100%', padding: 0, margin: 0 }}>
        <View style={{ width: "100%", alignItems: 'center', justifyContent: "center", }}>
          <View style={{ width: 90, height: 90, backgroundColor: "#ced9de", borderRadius: 100, marginBottom: 20 , flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
            <Image source={require('../assets/ville.png')} style={{ width: '60%', height: '70%' }} />
          </View>

          <Text style={{ fontFamily: 'MontserratBold', fontSize: 16, textAlign: "center" }}>Taxe Parking</Text>
          <Text style={{ fontFamily: 'Montserrat', marginBottom: 15, textAlign: "center" }}>Connectez-vous maintenant !</Text>
            
          <TextInput value={email} onChangeText={setEmail} style={{ ...styles.subscriptionDescription, borderWidth: 1, borderColor: "#555", backgroundColor: '#e9e9e9', width: "100%", borderRadius: 25 }} placeholder={'Votre Identifiant'} />

          <View style={{ width: "100%", flexDirection: 'row', alignItems: 'center' }}>
          <TextInput value={password} onChangeText={setPassword} secureTextEntry={seeIt} style={{ ...styles.subscriptionDescription, borderWidth: 1, borderColor: "#555", backgroundColor: '#e9e9e9', width: "100%", borderRadius: 25 }} placeholder={'Votre Password'} />
            <TouchableOpacity style={{ padding: 5, position: 'relative', right: 45 }} onPress={()=> setSeeIt(!seeIt)}>
              {seeIt && <FIcon6 name="eye-slash" size={18} />}
              {!seeIt && <FIcon6 name="eye" size={18} />}
            </TouchableOpacity>
          </View>

          <View style={styles.benefits}>
            <Text style={styles.benefitText}></Text>
          </View>

          <TouchableOpacity style={{ ...styles.subscribeButton, width: "100%", borderRadius: 25 }} onPress={handleLogin} disabled={refresh || password === "" || email === "" }>
            <Text style={{ ...styles.subscribeButtonText }}>Se connecter</Text>
            {refresh && <ActivityIndicator style={{ position: "absolute", alignSelf: 'center', top: 10 }} />}
          </TouchableOpacity>
        </View>
      </ScrollView>  
      
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
    paddingHorizontal: 20,
    fontFamily: 'Montserrat',
    marginVertical: 5,
    paddingVertical: 15
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
