import React, { useState } from 'react';
import { Alert, View, StyleSheet } from 'react-native';
import ApiService from '../ApiService.js';
import { Button, Input, Field, Text, useTheme } from '@jrobins/bulma-native';


export default function NewClientView({ navigation }) {

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

    const [patientName, setPatientName] = useState('');
    const [patientEmail, setPatientEmail] = useState('');
    const [showActivity, setShowActivity] = useState(false);

    async function createNewPatient() {
        if (patientName.length === 0 || patientEmail.length === 0) {
            Alert.alert("Please enter in a valid name and email");
            return;
        }

        setShowActivity(true);

        const fd = new FormData()
        fd.append('patient-name', patientName.toLowerCase())
        fd.append('patient-email', patientEmail)

        ApiService.post("patient/create/", fd, function(data) {
            setShowActivity(false);
            setPatientName('');
            setPatientEmail('');
            Alert.alert(
                "Hooray!!!", 
                `Successfully added ${patientName}`, 
                [{ 
                    text: "OK", 
                    onPress: () => {
                        navigation.navigate("My Clients", {reload: true})
                    }
                }],
                { 
                    cancelable: false
                }
            );
        }, function(err) {
            setShowActivity(false);
            Alert.alert("Error adding client");
        })
    }
    
    return (
        <View style={styles.container}>
            <View style={styles.innerContainer}>
                <View style={styles.bottomMargin}>
                    <Field label="Patient Name">
                        <Input 
                            iconLeft="user-alt"
                            placeholder="Tom" 
                            onChangeText={patientName => setPatientName(patientName)}
                        />
                    </Field>
                </View>
                <View style={styles.bottomMargin}>
                    <Field label="Patient Email" >
                        <Input 
                            iconLeft="envelope" 
                            placeholder="tom@gmail.com"
                            onChangeText={patientEmail => setPatientEmail(patientEmail)}
                        />
                    </Field>
                </View>
                <View>
                    <Button color="info" size="medium" onPress={createNewPatient} loading={showActivity} >
                        <Text size="medium" color="white" transform="uppercase">Create</Text>
                    </Button>
                </View>
            </View>
        </View>
        );
    }
    