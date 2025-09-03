import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Entypo as EIcon } from "react-native-vector-icons";

export default function Screen() {
  const router = useRouter()
  const [History, setHistory] = useState([]);
  const [refresh, SetRefresh] = useState(false);
  
  const gethistory = async () => {
    try {
      const history = await AsyncStorage.getItem('history') || JSON.stringify([]);
      const dashboard = await AsyncStorage.getItem('dashboard');

      const data = JSON.parse(history);

      if (dashboard !== null) {
        const dashboardData = JSON.parse(dashboard);

        if (dashboardData.Tickets > data.length) {
          const db = dashboardData.Tickets - data.length;
          // console.log(dashboardData, data.length)
          for (let i = 0; i < db; i++) {
            data.push({ plaque: 'web' })
          }
        }
      }

      setHistory(data)
    } catch (e) {
      console.error('Error reading data:', e);
    }
  };
  
  useEffect(() => {
    SetRefresh(true)
    gethistory()
    SetRefresh(false)
  }, [])

  return (
    <View style={styles.container}>
      {/* Entête fixe */}
      <View style={styles.header}>
        <TouchableOpacity style={{ padding: 7 }} onPress={() => router.push('/(screens)/home')} >
          <EIcon name={'chevron-left'} color={'#fdfdfd'} width={25} height={25} size={24} />
        </TouchableOpacity>
        <Text style={{ color: '#fdfdfd', fontSize: 13, fontFamily: 'MontserratBold' }}>Historique</Text>
      </View>

      {/* Section des événements en direct */}
      {History.length > 0 && <FlatList style={styles.eventScroll} contentContainerStyle={styles.eventContainer}
        refreshing={refresh}
        onRefresh={gethistory}
        data={History}
        renderItem={({ item, index }) => (
          <TouchableOpacity key={index} style={styles.eventCard} onPress={() => {
            if (item?.plaque != "web") router.push({pathname: '/(screens)/storyprint', params: { plaque: item.plaque, date: item.date, name: item.user || 'Inconnu'  } });
          }} >
            <Image source={require('../../assets/moto-2.jpg')} style={styles.eventImage} />
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>{item?.plaque == "web" ? 'Informations Sécurisé' : item?.plaque}</Text>
              <Text style={styles.eventDescription}>{item?.date ? 'Date & H: ' + item.date: 'Imprimé dans un autre terminal'}</Text>
            </View>
          </TouchableOpacity>
        )}
      />}

      {/* Section des événements en direct */}
      {History.length === 0 && <FlatList style={styles.eventScroll} contentContainerStyle={styles.eventContainer}
        refreshing={refresh}
        onRefresh={gethistory}
        data={['']}
        renderItem={({ item, index }) => (
          <View key={index} style={{  }} >
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ textAlign: 'center', fontFamily: 'Montserrat' }}> Pas d'historique pour cette date. </Text>
            </View>
          </View>
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
    paddingBottom: 30,
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
    padding: 15,
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
