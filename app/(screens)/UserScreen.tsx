import * as Network from "expo-network";
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from 'react-native';
import { Entypo as EIcon } from "react-native-vector-icons";

const checkConnection = async () => {
  const networkState = await Network.getNetworkStateAsync();
  console.log('executé !')
  return networkState.isConnected;
};

export default function LiveScreen() {
  const [refresh, SetRefresh] = useState(true);
  const [users, setUsers] = useState([]);
  const [connected, setConnected] = useState(false);

  const fetchUsers = async () => {
    const isConnected = await checkConnection();
    
    if (!isConnected) {
      ToastAndroid.show("Aucune connexion Internet disponible.", 5000);
      SetRefresh(false)
      return;
    }
    
    setConnected(true)
    try {
      const response = await fetch("https://taxeparking.mastagate.com/api/users");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des données");
      }
      const data = await response.json();
      
      setUsers(data.data); // Mettre à jour l'état avec les données reçues
      // ToastAndroid.show('Synchronisation terminé !', 7000)
    } catch (error) {
      console.error("Erreur : ", error.message);
    } finally {
      SetRefresh(false); // Arrêter le chargement
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []); 

  return (
    <View style={styles.container}>
      {/* Entête fixe */}
      <View style={styles.header}>
        <TouchableOpacity style={{ padding: 7 }} onPress={() => router.replace('/(screens)/ControlScreen')}>
          {/* <SolarBellBingBold width={25} height={25} color={'#888888'} /> */}
          <EIcon name={'chevron-left'} color={'#fdfdfd'} width={25} height={25} size={24} />
        </TouchableOpacity>
        <Text style={{ color: '#fdfdfd', fontSize: 13, fontFamily: 'MontserratBold' }}>Liste des Utilisateurs</Text>
      </View>

      {/* Section des événements si non connecté */}
      {users.length === 0 && <FlatList refreshing={refresh} onRefresh={fetchUsers} style={styles.eventScroll} contentContainerStyle={styles.eventContainer}
        data={['']}
        renderItem={({ item, index }) => (
          <TouchableOpacity key={index} style={styles.eventCard}>
            <View style={{ ...styles.eventInfo, width: '100%' }}>
              <Text style={{ ...styles.eventDescription, textAlign: 'center' }}><Text style={{ color: 'orange' }}>Aucun utilisateur trouvé !</Text></Text>
            </View>
          </TouchableOpacity>
        )}
      />}

      {/* Section des événements en direct si connecté */}
      {users.length > 0 && <FlatList refreshing={refresh} onRefresh={fetchUsers} style={styles.eventScroll} contentContainerStyle={styles.eventContainer} 
        data={users}
        renderItem={({item, index}) => (
          <TouchableOpacity key={index} style={styles.eventCard}>
            <Image source={require('../../assets/hom.jpg')} style={styles.eventImage} />
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>{item.name}</Text>
              <Text style={styles.eventDescription}>Accès: <Text style={{ color: 'orange' }}>{item.accès}</Text></Text>
              <Text style={styles.eventDescription}>Compte percepteur</Text>
            </View>
          </TouchableOpacity>
        )}
      />}
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
  eventScroll: {
    marginTop: 0,
    padding: 20,
  },
  eventContainer: {
    paddingBottom: 20,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#222',
    borderRadius: 10,
    marginBottom: 5,
    paddingRight: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  eventImage: {
    width: '25%',
    height: "100%",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  eventInfo: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    width: '80%',
    backgroundColor: '#222',
  },
  eventTitle: {
    fontSize: 13,
    color: '#fff',
    fontFamily: 'MontserratBold',
  },
  eventDescription: {
    fontSize: 12,
    color: '#ccc',
    fontFamily: 'Montserrat',
  },
});
