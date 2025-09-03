import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from "expo-network";
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native';
import { Entypo as EIcon, FontAwesome6 as FIcon6, MaterialIcons as IOcon } from "react-native-vector-icons";

export default function Screen() {
  const [dialog, SetDialog] = useState(false);
  const [plaque, SetPlaque] = useState<string>('');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [refresh, SetRefresh] = useState(false);
  const [isLoading, SetIsLoading] = useState(true);
  const [data, SetData] = useState<any>([]);
  const [user, SetUser] = useState<any>({});

  const router = useRouter()

  const checkConnection = async () => {
    const networkState = await Network.getNetworkStateAsync();

    return networkState.isConnected;
  };

  useEffect(() => {
    
    getUser()
    // Mettre à jour la date et l'heure toutes les secondes
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    // Nettoyer l'intervalle lorsque le composant est démonté
    return () => clearInterval(interval);
  }, []);

  const handlePrint = async () => {

    const isConnected = await checkConnection();

    if (!isConnected) {
      ToastAndroid.show("Vérifiez votre connexion Internet !", ToastAndroid.LONG);
      SetRefresh(false)
      return;
    }

    SetRefresh(true)
    if (plaque === '' && plaque.length < 3) ToastAndroid.show('Entrez Le numéro valide SVP !!!!', ToastAndroid.LONG)
    else {
      try {
        router.push({
          pathname: '/(screens)/print',
          params: {
            plaque,
            user: JSON.stringify(user),
            len: data.Tickets,
          },
        });
      } catch (e) {
        console.error('Error saving data:', e);
      }
    }
    SetRefresh(false)
  }

  const getUser = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      const data = await AsyncStorage.getItem('dashboard');
      if (user !== null) {
        SetUser(JSON.parse(user));
        if (data !== null) {
          SetData(JSON.parse(data));
          SetIsLoading(false);
        }
      }
    } catch (e) {
      console.error('Error reading data:', e);
    }
  };

  const loadDataForUser = async () => {
    SetIsLoading(true)
    SetRefresh(true)
    const isConnected = await checkConnection();
    
    if (!isConnected) {
      ToastAndroid.show("Aucune connexion Internet disponible.", ToastAndroid.LONG);
      SetRefresh(false)
      return;
    }
    
    try {
      const response = await fetch(`https://taxeparking.mastagate.com/api/user/data/${user.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      const data = await response.json();
      console.log(data.status)
      
      if (response.ok) {
        SetData(data.data)
        console.log(data.data)
        await AsyncStorage.setItem('dashboard', JSON.stringify(data.data))
        SetIsLoading(false)
      }
      
      else if (data.status == "error") {
        await AsyncStorage.setItem('dashboard', JSON.stringify({ Tickets: 0, Mont_Pos: 0 }))
        SetData({ Tickets: 0, Mont_Pos: 0 })
        SetIsLoading(false)
      }

    } catch (e) {
      console.error('Error saving data:', e);
    }

    SetRefresh(false)
  };

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

      const responses = await fetch(`https://taxeparking.mastagate.com/api/logout/account/${user.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (responses.ok) {
        await AsyncStorage.removeItem('user');
        await AsyncStorage.setItem('lastPerson', JSON.stringify(user));
        await AsyncStorage.removeItem('history');
        await AsyncStorage.removeItem('dashboard');
        ToastAndroid.show('Déconnecté avec succès !', ToastAndroid.LONG)
        router.replace('/login')
      }
      showDialog()
    } catch (error) {
      ToastAndroid.show('Erreur de déconnexion, '+ error, ToastAndroid.LONG)
    }
    SetRefresh(false)
  }

  return (
    isLoading && refresh ? (
    
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    
    ) : isLoading && !refresh ? (

      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <Pressable style={{ ...styles.subscribeButton, paddingHorizontal: 10 }} onPress={loadDataForUser} >
            <Text style={styles.subscribeButtonText}><IOcon name="refresh" clor={'white'} size={24} /></Text>
            <Text style={styles.subscribeButtonText}>Recharger les données</Text>
          </Pressable>
      </View>

    ) :(<View style={styles.container}>
      {/* Header section */}
      
    <View style={{ ...styles.header, marginTop: 35, }}>
      <Text style={{ color: "#333", fontSize: 14, fontFamily: 'MontserratBold' }}>Bienvenue {user.name} !</Text>

      <TouchableOpacity style={{ paddingVertical: 10, paddingHorizontal: 15, borderRadius: 10, backgroundColor: '#777', right: 10 }} onPress={showDialog}>
        <FIcon6 name="bars-staggered" color={'#fdfdfd'} size={16} />
      </TouchableOpacity>
    </View>

    {/* Subscription options */}
    <ScrollView style={{ ...styles.subscriptionScroll, }} keyboardShouldPersistTaps="handled">
      
      <View  style={{ ...styles.subscriptionCard, width: "100%", height: 150 }}>

        <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 }}>
          <View style={{ width: 53, height: 53, backgroundColor: "#999", flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 99, paddingTop: 5 }}>
            <Image source={require('../../assets/ville.png')} style={{ width: 45, height: 50 }} />
          </View>
          <Text style={styles.benefitText}>{currentDateTime.toLocaleDateString()}</Text>
        </View>

        <View style={{ borderTopWidth: 1, borderTopColor: '#666', paddingTop: 15, flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={styles.subscribeButtonText}>Montant Perçu: </Text>
          <Text style={{ ...styles.subscribeButtonText, color: "#ff9900" }}> { data?.Mont_Pos || 0 } Fc</Text>
        </View>
      </View>
      
      <View style={{ ...styles.subscriptionCard2, height: 350 }}>
        <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={styles.benefitText}> <EIcon name="location" color={'#ff9900'} size={16} /> Zone: Funa</Text>
          <Text style={{ ...styles.subscriptionTitle }}>Ticket: <Text style={{ ...styles.subscriptionTitle, color: "#ff9900" }}>500 Fc</Text></Text>
        </View>

        <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 30 }}>
          <Text style={styles.subscriptionTitle}>Total imprimé</Text>
            <Text style={{ ...styles.benefitText, fontSize: 74 }}>{data?.Tickets }<Text style={styles.benefitText || 0}>Tckt</Text></Text>
        </View>
      
        <View style={styles.benefits}>
          <TextInput value={plaque} onChangeText={SetPlaque} placeholderTextColor="#888" style={{ backgroundColor: '#444', borderRadius: 10, color: '#fdfdfd', paddingHorizontal: 25, paddingVertical: 15 }} placeholder={'CGO - N° de Plaque'} />
        </View>

        <TouchableOpacity style={styles.subscribeButton} onPress={handlePrint} disabled={refresh}>
          <Text style={styles.subscribeButtonText}>Valiver</Text>
          {refresh && <ActivityIndicator style={{ position: "absolute", alignSelf: 'center', top: 10 }} />}
        </TouchableOpacity>
      </View>

    </ScrollView>

    <View style={{ flex: 1, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: dialog ? 'block': 'none'}}>
      <TouchableOpacity onPress={showDialog} style={{ flex: 1, backgroundColor: '#44434378', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', flexDirection: 'row', alignItems: 'end'}}>
      </TouchableOpacity>

      <View style={{ backgroundColor: '#fdfdfd', position: 'absolute', bottom: 0, left: 0, width: '100%', height: 150, flexDirection: 'col', borderTopLeftRadius: 25, borderTopRightRadius: 25 }}>
        <TouchableOpacity onPress={()=>{
            router.replace('/(screens)/story')
            showDialog()
          }} style={{ flex: 1, width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: "#999" }}>
          <Text style={{ ...styles.subscribeButtonText, color: '#333' }}>Historique</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={logout} style={{ flex: 1, width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', }}>
          <Text style={{ ...styles.subscribeButtonText, color: '#333' }}>Déconnecter</Text>
          {refresh && <ActivityIndicator style={{ position: "absolute", alignSelf: 'center', top: 10 }} />}
        </TouchableOpacity>
      </View>
    </View>
  </View>)
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