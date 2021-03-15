import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet, Alert, ScrollView } from 'react-native';
import ApiService from '../ApiService.js'; 
import { Button, Text, useTheme } from '@jrobins/bulma-native';


export default function ProfileView({ route }) {

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

    const [clientProfileSessions, setSessions] = useState([]);
    const [showActivity, setShowActivity] = useState(false);


    const getClientSessions = async () => {
      const { patientId } = route.params;

      setShowActivity(true);
        ApiService.get(`patient/${patientId}/profile/`, function(data) {
          setShowActivity(false);

          const months = ["Jan", "Feb", "Mar","Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

          const mappedSessions = data.map(session => {
              const date = new Date(session.created_at)

              const formatted_date =  months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear()
              return {
                  "formatted_date": formatted_date, 
                  "id": session.id
              }
          })
          setSessions(mappedSessions)
        }, function(err) {
          setShowActivity(false);
          console.log(err)
        })
      }
    
      useEffect(() => {
        getClientSessions()
      }, []);

      async function resendPDF(sessionId) {
        setShowActivity(true);
         ApiService.get(`sessions/${sessionId}/resend/`, function(data) {
          setShowActivity(false);
          if (data["msg"] == "success") { 
            Alert.alert("Email resent!");
          } else {
            console.log(err);
          }
         }, function(err) {
          setShowActivity(false);
          console.log(err);
         })
        }

      const SessionItem = (session, index) => {
        return (
          <View style={styles.innerContainer} key={index}>
            <Text size="large">{session.formatted_date}</Text>
            <Button color="info" size="medium" onPress={() => resendPDF(session.id)}>
              <Text size="medium" color="white" transform="uppercase">Resend</Text>
            </Button>
          </View>
        )
    }

    const EmptyView = () => {
      return (
        <View style={styles.center}>
          <Text size="3">No sessions found</Text>
        </View>
      )
    }
    
    return (
      <ScrollView style={{backgroundColor: theme.colors.white, height: '100%'}}>
        <View style={styles.container}>
          { showActivity && 
            <View style={styles.center}>
              <ActivityIndicator size="large" />
            </View> 
          }
          {clientProfileSessions.length === 0 && <EmptyView />}
          <View style={styles.outerContainer}>
            {clientProfileSessions.length > 0 && clientProfileSessions.map((session, index) => {
              return SessionItem(session, index)
            })}
          </View>
        </View>
      </ScrollView>
    );
  }
    