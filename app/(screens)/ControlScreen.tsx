import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from "expo-network";
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from 'react-native';
import { Entypo as EIcon, FontAwesome6 as FIcon6 } from "react-native-vector-icons";

export default function Screen() {
  const [refresh, SetRefresh] = useState(false);
  const [dialog, SetDialog] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [closed, setClosed] = useState(false);
  const [percepteur, SetPercepteur] = useState({});
  const [data, SetData] = useState({});
  const [user, SetUser] = useState({});

  useEffect(() => {
    getUser()
  }, []);

  const checkConnection = async () => {
    const networkState = await Network.getNetworkStateAsync();

    return networkState.isConnected;
  };

  const getUser = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      const lastPerson = await AsyncStorage.getItem('lastPerson');
      const lastData = await AsyncStorage.getItem('lastData');
      const close = await AsyncStorage.getItem('close');

      console.log(lastPerson);
      if (user !== null) {
        SetUser(JSON.parse(user));
        if (lastPerson !== null) {
          let person = JSON.parse(lastPerson);
          SetPercepteur(person);

          if (lastData !== null) {
            let datas = JSON.parse(lastData);
            SetData(datas);
          }
        }
      }

      if (close !== null) {
        setClosed(true);
      }
    } catch (e) {
      console.error('Error reading data:', e);
    }
  };

  useEffect(() => {

    // console.log(percepteur, 0)
    // Mettre à jour la date et l'heure toutes les secondes
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    // Nettoyer l'intervalle lorsque le composant est démonté
    return () => clearInterval(interval);
  }, []);

  const showDialog = () => {
    SetDialog(!dialog)
  }

  const logout = async () => {
    SetRefresh(true)
    try {

      const isConnected = await checkConnection();

      if (!isConnected) {
        ToastAndroid.show("Vérifiez votre connexion Internet !", ToastAndroid.LONG);
        return;
      }

      await AsyncStorage.removeItem('user'); 
      router.replace('/(screens)/LoginScreen')
      showDialog()
    } catch (error) {
      ToastAndroid.show('Erruer de déconnexion !' + error, ToastAndroid.LONG)
    }
    SetRefresh(false)
  }

  return (
    <View style={styles.container}>
      
      {/* Header section */}
      <View style={{ ...styles.header, marginTop: 35, }}>
        <Text style={{ color: "#222", fontSize: 14, fontFamily: 'MontserratBold' }}>Bienvenue {user.name} !</Text>

        <TouchableOpacity style={{ paddingVertical: 10, paddingHorizontal: 15, borderRadius: 10, backgroundColor: '#777', right: 10 }} onPress={showDialog}>
          <FIcon6 name="bars-staggered" color={'#fdfdfd'} size={16} />
        </TouchableOpacity>
      </View>

      {/* Subscription options */}
      <ScrollView style={{ ...styles.subscriptionScroll, }} keyboardShouldPersistTaps="handled">

        <View style={{ ...styles.subscriptionCard, width: "100%", height: 150 }}>

          <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 }}>
            <View style={{ width: 53, height: 53, backgroundColor: "#999", flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 99, paddingTop: 5 }}>
              <Image source={require('../../assets/ville.png')} style={{ width: 45, height: 50 }} />
            </View>
            <Text style={styles.benefitText}>{currentDateTime.toLocaleDateString()}</Text>
          </View>

          <View style={{ borderTopWidth: 1, borderTopColor: '#666', paddingTop: 15, flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={styles.subscribeButtonText}> Espace </Text>
            <Text style={{ ...styles.subscribeButtonText, color: "#ff9900" }}> Superviseur</Text>
          </View>
        </View>

        <TouchableOpacity style={{ ...styles.subscriptionCard, width: "100%", height: 120 }} onPress={() => closed || percepteur.name == null ? { }: router.replace('/(screens)/FormScreen')} >

          <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 }}>
            <Text style={{ ...styles.subscribeButtonText, fontFamily: 'MontserratBold' }}> {percepteur?.name} </Text>
            <Text style={styles.benefitText}>{closed ? 'Déjà clôturé !' : 'Clôturer'} {!closed && <EIcon name='chevron-right' />}</Text>
          </View>

          <View style={{ borderTopWidth: 1, borderTopColor: '#666', paddingTop: 15, flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.subscribeButtonText}>Montant Perçu: </Text>
            <Text style={{ ...styles.subscribeButtonText, color: "#ff9900" }}> {data?.Mont_Pos} Fc</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>


      <View style={{ flex: 1, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: dialog ? 'block' : 'none' }}>
        <TouchableOpacity onPress={showDialog} style={{ flex: 1, backgroundColor: '#44434378', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', flexDirection: 'row', alignItems: 'end' }}>
        </TouchableOpacity>

        <View style={{ backgroundColor: '#fdfdfd', position: 'absolute', bottom: 0, left: 0, width: '100%', height: 150, flexDirection: 'col', borderTopLeftRadius: 25, borderTopRightRadius: 25 }}>
          <TouchableOpacity onPress={() => {
            router.replace('/(screens)/UserScreen')
            showDialog()
          }} style={{ flex: 1, width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: "#999" }}>
            <Text style={{ ...styles.subscribeButtonText, color: '#333' }}>Utilisateurs & accès</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={logout} style={{ flex: 1, width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', }}>
            <Text style={{ ...styles.subscribeButtonText, color: '#333' }}>Déconnecter</Text>
            {refresh && <ActivityIndicator style={{ position: "absolute", alignSelf: 'center', top: 10 }} />}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#999',
  },
  header: {
    padding: 20,
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
    backgroundColor: '#222',
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
