import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet, ScrollView } from 'react-native';
import ApiService from '../ApiService.js';
import { Button, Text, useTheme } from '@jrobins/bulma-native';

 
export default function ClientView({ route, navigation }) {

  const theme = useTheme();

    const styles = StyleSheet.create({
        container: {
            flex: 1,  
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.colors.white
        }, 
        outerContainer: {
          width: '85%', 
          height: '100%'
        },
        innerContainer: {
          display: 'flex', 
          flexDirection: 'row', 
          justifyContent: 'space-between',
          alignItems: 'center',
          marginVertical: 20
        }, 
        bottomMargin: {
            marginBottom: 30
        }, 
        center: {
          position: 'absolute',
          top: 200
        }
    })

    const [patients, setPatients] = useState([]);
    const [showActivity, setShowActivity] = useState(false);

    React.useEffect(() => {
      if (route.params?.reload) {
        getPatients();
      }
    }, [route.params?.reload]);

    const getPatients = async () => {
      setShowActivity(true);
      ApiService.get("main/", function(data) {
        setShowActivity(false);
        const patients = data["patients"].map(patient => {
          return { 
              name: patient.name, 
              email: patient.email, 
              id: patient.id,
              key: patient.id
            }
        });
        setPatients(patients);
      }, function(err) {
        setShowActivity(false);
      })
    }
    
    useEffect(() => {
      getPatients()
    }, []);

    function viewPatient(patientId) {
        navigation.navigate('Client Sessions', {patientId: patientId});
    }

    const PatientItem = (patient, index) => {
        return (
          <View key={index} style={styles.innerContainer}>
              <View>
                  <Text size="3">{patient.name}</Text> 
                  <Text size="5">{patient.email}</Text>
              </View>
              <Button color="info" size="medium" onPress={() => viewPatient(patient.id)}>
                <Text size="medium" color="white" transform="uppercase">View</Text>
              </Button>
          </View>
        )
    }

    const EmptyView = () => {
      return (
        <View style={styles.center}>
          <Text size="3">No patients found</Text>
        </View>
      )
    }
    
    return (
      <ScrollView style={{backgroundColor: theme.colors.white}}>
        <View style={styles.container}>
          { showActivity && 
            <View style={styles.center}>
              <ActivityIndicator size="large" />
            </View>
          }
          {patients.length === 0 && <EmptyView />}
          <View style={styles.outerContainer}>
            {patients.length > 0 && patients.map((patient, index) => {
              return PatientItem(patient, index)
            })}
          </View>
        </View>
      </ScrollView>
      );
    }
    