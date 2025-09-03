import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from 'react-native';
import { MaterialIcons as MIcon } from "react-native-vector-icons";
import printReceipt from '../components/Print';

export default function Screen() {
  const [refresh, SetRefresh] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const { plaque, date, name } = useLocalSearchParams();

  const router = useRouter()

  useEffect(() => {
    setCurrentDateTime(new Date());
  }, []);
  
  const base64Image = `data:image/jpeg;base64,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`;
  
  const _printRecieve = async () => {
    await printReceipt({
      plaque: plaque,
      date: currentDateTime.toLocaleDateString() + ' ' + currentDateTime.getHours() + ':' + currentDateTime.getMinutes(),
      taxateur: name,
      logo: encodeURIComponent(base64Image),
    })

    router.push('/(screens)/story');

  };

  
  // Exemple d'utilisation dans le flux principal
  const handlePrint = async () => {    
    SetRefresh(true);

    // Imprimer le reçu
    try {
     await _printRecieve();
    } catch (error) {
      console.error("Erreur d'impression:", error);
      ToastAndroid.show("Erreur d'impression.", ToastAndroid.LONG);
    }
    finally {
      SetRefresh(false);
    }

  };

  return (
    <View style={styles.container}>

      {/* Subscription options */}
      <ScrollView style={{ ...styles.subscriptionScroll, }}>
        
        <View style={{ ...styles.subscriptionCard2, height: 400 }}>
          <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'center', left: -15 }}>
            <Image source={require('../../assets/ville.png')} style={{ width: 40, height: 45, left: 35 }} />
            <View style={{  width: '70%', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ ...styles.subscriptionTitle, textAlign: 'center' }}>TAXE PARKING</Text>
              <Text style={{ ...styles.subscriptionTitle, textAlign: 'center', fontSize: 10 }}>STATIONNEMENT</Text>
              <Text style={{ ...styles.subscriptionTitle, textAlign: 'center', fontSize: 12 }}>VILLE DE KINSHASA</Text>
            </View>
          </View>

          <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center', marginVertical: 10, borderTopWidth: 1, borderBottomWidth: 1, paddingVertical: 20, borderStyle: "dashed" }}>

            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginBottom: 0}}>
              <Text style={{ ...styles.benefitText }}>Numéro : </Text>
              <Text style={styles.subscriptionTitle}> {plaque} </Text>
            </View>

            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginBottom: 0}}>
              <Text style={{ ...styles.benefitText }}>Date & H : </Text>
              <Text style={styles.subscriptionTitle}> {date} </Text>
            </View>

            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginBottom: 0}}>
              <Text style={{ ...styles.benefitText }}>Montant : </Text>
              <Text style={styles.subscriptionTitle}>500 <Text style={styles.benefitText}>Fc</Text></Text>
            </View>

            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginBottom: 0}}>
              <Text style={{ ...styles.benefitText }}>Taxateur : </Text>
              <Text style={styles.subscriptionTitle}> {name} </Text>
            </View>

            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginBottom: 0}}>
              <Text style={{ ...styles.benefitText }}>Parking : </Text>
              <Text style={styles.subscriptionTitle}>FUNA</Text>
            </View>

          </View>

          <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'center', marginBottom: 0}}>
            <MIcon name="qr-code-2" size={80} />
          </View>

          <TouchableOpacity style={styles.subscribeButton} disabled={refresh} onPress={handlePrint}>
            <Text style={styles.subscribeButtonText}>Imprimé le ticket</Text>
            {refresh && <ActivityIndicator style={{ position: "absolute", alignSelf: 'center', top: 10 }} />}
          </TouchableOpacity>

        </View>
          <TouchableOpacity style={{ alignSelf: 'center', marginTop: 20, }} onPress={() => router.push({pathname: '/(screens)/story'})}>
          <Text style={{ fontFamily: 'Montserrat', color: '#fff', fontSize: 14, borderBottomWidth: 1, borderBottomColor: '#fff' }}>Annuler le ticket</Text>
          </TouchableOpacity>

      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#999',
  },
  subscriptionScroll: {
    paddingHorizontal: 20,
  },
  subscriptionCard2: {
    backgroundColor: '#fdfdfd',
    borderRadius: 10,
    marginBottom: 15,
    padding: 20,
  },
  subscriptionTitle: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'MontserratBold',
  },
  subscriptionPrice: {
    fontSize: 14,
    color: '#ff9900',
    fontFamily: 'Montserrat',
  },
  subscriptionDescription: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'Montserrat',
  },
  benefits: {
    marginVertical: 10,
  },
  benefitText: {
    fontSize: 14,
    color: '#333',
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
    fontFamily: 'MontserratBold',
  },
});
