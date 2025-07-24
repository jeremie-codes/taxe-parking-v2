import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, ActivityIndicator, ToastAndroid } from 'react-native';
import { Entypo as EIcon, FontAwesome6 as FIcon6 } from "react-native-vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from "expo-network";
import { router, Link } from 'expo-router';

export default function Screen() {
  const [refresh, SetRefresh] = useState(false);
  const [transport, setTransport] = useState(null)
  const [cash, setCash] = useState(null)
  const [rate, setRate] = useState(null)
  const [note, setNote] = useState(null)
  const [percepteur, SetPercepteur] = useState({});
  const [data, SetData] = useState({});

  const checkConnection = async () => {
    const networkState = await Network.getNetworkStateAsync();

    return networkState.isConnected;
  };

  useEffect(() => {
    getData()
  }, []);

  const getData = async () => {
    try {
      const lastPerson = await AsyncStorage.getItem('lastPerson');
      const lastData = await AsyncStorage.getItem('lastData');
      
      if (lastPerson !== null) {
        SetPercepteur(JSON.parse(lastPerson));
        if (lastData !== null) {
          SetData(JSON.parse(lastData));
        }
      }
    } catch (e) {
      console.error('Error reading data:', e);
    }
  };

  const hanldeCloture = async () => {

    const formData = {
      user_id: percepteur.id,
      Ratés: parseInt(rate),
      Mont_Cash: parseInt(cash),
      Transport: parseInt(transport),
      Obs: note
    }

    if (cash && rate && note && transport) {

      const isConnected = await checkConnection();

      if (!isConnected) {
        ToastAndroid.show("Aucune connexion Internet disponible.", ToastAndroid.LONG);
        SetRefresh(false)
        return;
      }

      SetRefresh(true);
  
      try {
        // Envoi des données au serveur
        const response = await fetch("https://taxeparking.mastagate.com/api/cloturer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
  
        const data = await response.json();
        console.log(data)
  
        if (response.ok) {
          console.log("Enregistrement sur le serveur réussi:", data);
  
          await AsyncStorage.setItem("close", 'true');
  
          ToastAndroid.show("Agent clôturé avec succès !", ToastAndroid.LONG);
          router.replace('/(screens)/ControlScreen')
  
        } else {
          console.error("Échec de l'enregistrement sur le serveur:", data);
          ToastAndroid.show("Échec de l'enregistrement sur le serveur.", ToastAndroid.LONG);
        }
      } catch (error) {
        console.error("Erreur lors de l'envoi des données au serveur:", error);
        ToastAndroid.show("Erreur de connexion au serveur.", ToastAndroid.LONG);
      } finally {
        SetRefresh(false);
      }

    } else {
      ToastAndroid.show("Tous les champs sont requises !", ToastAndroid.LONG);
    }

  }

  return (
    <View style={styles.container}>
      {/* Entête fixe */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(screens)/ControlScreen')} >
          {/* <SolarBellBingBold width={25} height={25} color={'#888888'} /> */}
          <EIcon name={'chevron-left'} color={'#fdfdfd'} width={25} height={25} size={24} />
        </TouchableOpacity>
        <Text style={{ color: '#fdfdfd', fontSize: 13, fontFamily: 'MontserratBold' }}>Clôture</Text>
      </View>

      {/* Subscription options */}
      <ScrollView style={{ ...styles.subscriptionScroll, }} keyboardShouldPersistTaps="handled">
        
        <View style={{ ...styles.subscriptionCard, width: "100%", height: 100, marginTop: 10 }}>

          <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 5 }}>
            <Text style={{ ...styles.subscribeButtonText, fontFamily: 'MontserratBold' }}> {percepteur?.name} </Text>
          </View>

          <View style={{ borderTopWidth: 1, borderTopColor: '#666', paddingTop: 15, flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.subscribeButtonText}>Montant Perçu: </Text>
            <Text style={{ ...styles.subscribeButtonText, color: "#ff9900" }}> {data?.Mont_Pos} Fc</Text>
          </View>
        </View>
        
        <View style={{ ...styles.subscriptionCard2, height: 350 }}>
          <View style={styles.benefits}>
            <TextInput placeholderTextColor="#888" keyboardType="numeric" onChangeText={setCash} value={cash} style={{ backgroundColor: '#e1e1e1', borderRadius: 10, color: '#333', paddingHorizontal: 25, fontFamily: 'Montserrat', fontSize: 12, height: 40 }} placeholder={'Montant reçu cache'} />
          </View>
          <View style={styles.benefits}>
            <TextInput placeholderTextColor="#888" keyboardType="numeric" onChangeText={setTransport} value={transport} style={{ backgroundColor: '#e1e1e1', borderRadius: 10, color: '#333', paddingHorizontal: 25, fontFamily: 'Montserrat', fontSize: 12, height: 40 }} placeholder={'Transport de l\'agent'} />
          </View>
          <View style={styles.benefits}>
            <TextInput placeholderTextColor="#888" keyboardType="numeric" onChangeText={setRate} value={rate} style={{ backgroundColor: '#e1e1e1', borderRadius: 10, color: '#333', paddingHorizontal: 25, fontFamily: 'Montserrat', fontSize: 12, height: 40 }} placeholder={'Nombre de ticket râtés '} />
          </View>
          <View style={styles.benefits}>
            <TextInput placeholderTextColor="#888" onChangeText={setNote} value={note} style={{ backgroundColor: '#e1e1e1', borderRadius: 10, color: '#333', paddingHorizontal: 25, fontFamily: 'Montserrat', fontSize: 12, height: 60 }} placeholder={'Observation...'} />
          </View>

          <TouchableOpacity style={styles.subscribeButton} disabled={refresh} onPress={hanldeCloture}>
            <Text style={styles.subscribeButtonText}>Clôturer</Text>
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
    backgroundColor: '#999',
  },
  header: {
    marginTop: 35,
    padding: 20,
    backgroundColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  subscriptionScroll: {
    paddingHorizontal: 20,
  },
  subscriptionCard: {
    backgroundColor: '#222',
    borderRadius: 10,
    marginBottom: 15,
    padding: 20,
  },
  subscriptionCard2: {
    backgroundColor: '#fdfdfd',
    borderRadius: 10,
    marginBottom: 15,
    padding: 25,
  },
  subscriptionTitle: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Montserrat',
  },
  subscriptionPrice: {
    fontSize: 14,
    color: '#ff9900',
    fontFamily: 'Montserrat',
  },
  subscriptionDescription: {
    fontSize: 12,
    color: '#ccc',
    fontFamily: 'Montserrat',
  },
  benefits: {
    marginVertical: 10,
  },
  benefitText: {
    fontSize: 12,
    color: '#ccc',
    fontFamily: 'Montserrat',
  },
  subscribeButton: {
    backgroundColor: '#ff9900',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Montserrat',
  },
});
