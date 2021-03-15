import React, { useState, useContext, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import AuthContext from '../auth-context';
import ApiService from '../ApiService.js';
import { Button, Text, useTheme } from '@jrobins/bulma-native';

 
export default function ProfileView() {

  const theme = useTheme();

    const styles = StyleSheet.create({
        container: {
            flex: 1, 
            alignItems: 'center', 
            backgroundColor: theme.colors.white
        }, 
        innerContainer: {
            width: '80%', 
            height: '70%'
        }, 
        bottom: {
            position: 'absolute',
            bottom: 20
        }, 
        bottomMargin: {
          marginBottom: 15
        },
        center: {
          position: 'absolute',
          top: '50%' 
        }
    })

    const [profile, setProfile] = useState(null);
    const [showActivity, setShowActivity] = useState(false);

    const { signOut } = useContext(AuthContext);
    
    async function handleSignOut() {
        signOut()
    }

    const getProfile = async () => {
      setShowActivity(true);
        ApiService.get("profile/", function(data) {
          setShowActivity(false);
          therapistProfile = data;
          therapistProfile.member_since = new Date(therapistProfile.created_at).getFullYear()
          therapistProfile.email = therapistProfile.user.email;
          setProfile(therapistProfile)
        }, function(err) {
          setShowActivity(false);
        })
      }
    
      useEffect(() => {
        getProfile()
      }, []);

    function getInfo(profile) {
      return (
        <View style={{marginTop: 30}}>
          <Text size="2" alignment="center" style={styles.bottomMargin}>{profile.name}</Text>
          <Text size="3" alignment="center" style={styles.bottomMargin}>{profile.email}</Text>
          <Text size="4" alignment="center" style={styles.bottomMargin}>{profile.license_id}</Text>
          <Text size="5" alignment="center" style={styles.bottomMargin}>Member since: {profile.member_since}</Text>
        </View>
        
      )
    }
    
    return (
        <View style={styles.container}>
          { showActivity && 
            <View style={styles.center}>
              <ActivityIndicator size="large" />
            </View>
          }
          { profile && getInfo(profile) }
          <Button 
            color="info" 
            size="medium" 
            onPress={handleSignOut} 
            style={styles.bottom}>
              <Text size="medium" color="white" transform="uppercase">Logout</Text>
          </Button>
        </View>
        );
    }
    