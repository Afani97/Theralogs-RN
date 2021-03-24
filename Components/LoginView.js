import React, { useState, useContext } from 'react';
import { Alert, View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthContext from '../auth-context';
import ApiService from '../ApiService.js';
import { Button, Input, Field, Text, useTheme } from '@jrobins/bulma-native';

export default function LoginView() {

    const theme = useTheme();

    const styles = StyleSheet.create({
        container: {
            flex: 1, 
            alignItems: 'center', 
            justifyContent: 'center', 
            backgroundColor: theme.colors.white
        }, 
        innerContainer: {
            width: '80%', 
            height: '70%'
        }, 
        bottomMargin: {
            marginBottom: 30
        }
    })
    
    const [email, onChangeEmail] = useState('');
    const [password, onChangePassword] = useState('');
    const [showActivity, setShowActivity] = useState(false);

    const { signIn } = useContext(AuthContext);
    
    async function handleButtonPress(e) {
        if (email.length === 0 || password.length === 0) {
            Alert.alert("Please enter in your credentials");
            return;
        }
        
        setShowActivity(true);
        const fd = new FormData()
        fd.append('username', email.toLowerCase())
        fd.append('password', password)
        ApiService.post("auth/token/", fd, async function(data) {
            setShowActivity(false);
            const access_token = data["access"]
            const refresh_token = data["refresh"]
            const stripe_verified = data["stripe_verified"]
            if (!stripe_verified) {
                Alert.alert("Error logging in.")
                return; 
            }
            try {
                await AsyncStorage.setItem('@access_token', access_token)
                await AsyncStorage.setItem("@refresh_token", refresh_token)
                await AsyncStorage.setItem('@date', JSON.stringify(new Date()));
                signIn()
            } catch (e) {
                console.log("ACCESS NOT SAVING")
                Alert.alert("Error logging in.");
            }
        }, function(err) {
            setShowActivity(false);
            Alert.alert("Error logging in.");
        })
    }
    
    return (
        <View style={styles.container}>
            <View style={styles.innerContainer}>
                <View style={styles.bottomMargin}>
                    <Field label="Email">
                        <Input 
                            iconLeft="envelope"
                            placeholder="johnny@appleseed.com" 
                            onChangeText={email => onChangeEmail(email)}
                        />
                    </Field>
                </View>
                <View style={styles.bottomMargin}>
                    <Field label="Password" >
                        <Input 
                            iconLeft="lock" 
                            placeholder="**********"
                            secureTextEntry={true}
                            onChangeText={password => onChangePassword(password)}
                        />
                    </Field>
                </View>
                <View>
                    <Button color="info" size="medium" onPress={handleButtonPress} loading={showActivity} >
                        <Text size="medium" color="white" transform="uppercase">Login</Text>
                    </Button>
                </View>
            </View>
        </View>
        );
    }
    