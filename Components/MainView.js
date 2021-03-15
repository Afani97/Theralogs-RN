import React, { useState, useEffect, useRef } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import AudioRecord from 'react-native-audio-record';
import { Picker } from '@react-native-picker/picker';
import RNFS from 'react-native-fs';
import ApiService from '../ApiService';
import { Button, Text, useTheme } from '@jrobins/bulma-native';


export default function MainView() {

  const theme = useTheme();

    const styles = StyleSheet.create({
        container: {
            flex: 1, 
            alignItems: 'center', 
            flexDirection: 'column',
            backgroundColor: theme.colors.white
        }, 
        innerContainer: {
          width: '90%',
          height: '70%', 
          display: 'flex', 
          justifyContent: 'space-evenly',
        }, 
        bottom: {
            position: 'absolute',
            bottom: 10
        }
    })

  const [isRecording, setIsRecording] = useState(false);
  const [doneRecording, setIsDoneRecording] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [showActivity, setShowActivity] = useState(false);
  const [timer, setTimer] = useState(0)
  const increment = useRef(null)

  const getPatients = async () => {
    ApiService.get("main/", function(data) {
      const patients = data["patients"].map(patient => {
        return {label: `${patient.name} - ${patient.email}`, value: patient.id}
      });
      setPatients([{label: 'Choose a patient', value: ""}, ...patients]);
    }, function(err){
    })
  }

  useEffect(() => {
    getPatients()
  }, []);
  
  function handleButtonPress(e) {
    checkMicrophonePermissionStatus()
  }

  function startAudioRecording() {
    const options = {
      sampleRate: 16000, 
      channels: 1,       
      bitsPerSample: 16,  
      audioSource: 6,   
      wavFile: 'test.wav'
    };
    
    AudioRecord.init(options);
    AudioRecord.start();
    setIsRecording(true);
    startTimer();
  }

  async function stopAudioRecording() {
    audioFile = await AudioRecord.stop();
    setIsRecording(false);
    setIsDoneRecording(true);
    clearInterval(increment.current)
  }

  function startTimer() {
    increment.current = setInterval(() => {
      setTimer((timer) => timer + 1)
    }, 1000)
  }
  
  const formatTime = () => {
    const getSeconds = `0${(timer % 60)}`.slice(-2)
    const minutes = `${Math.floor(timer / 60)}`
    const getMinutes = `0${minutes % 60}`.slice(-2)
    const getHours = `0${Math.floor(timer / 3600)}`.slice(-2)

    return `${getHours} : ${getMinutes} : ${getSeconds}`
  }

  async function uploadRecording() {
    const access_token = await ApiService.getCurrentUser()
    if (selectedPatient === null) {
      Alert.alert("You need to select a patient before uploading");
      return;
    }

    setShowActivity(true);
    clearInterval(increment.current)
    setTimer(0)
    
    var files = [
      {
        name: 'file',
        filename: 'test.wav',
        filepath: RNFS.DocumentDirectoryPath + '/test.wav',
        filetype: 'audio/wav'
      },
    ]
    RNFS.uploadFiles({
      toUrl: `http://127.0.0.1:8000/rn/file-upload/`,
      files: files,
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${access_token}`,
      },
      fields: {
        'patient-id': selectedPatient,
      },
    }).promise.then((response) => {
        if (response.statusCode == 200) {
          setShowActivity(false)
          restartRecording()
          Alert.alert("Successfully, uploaded file!")
        } else {
          setShowActivity(false);
          Alert.alert("Error uploading file!")
        }
      })
      .catch(() => {
        setShowActivity(false)
      })
    
  }
  
  function checkMicrophonePermissionStatus() {
    check(PERMISSIONS.IOS.MICROPHONE)
    .then((result) => {
      switch (result) {
        case RESULTS.UNAVAILABLE:
          Alert.alert("Microphone is unavailable, we can't transcribe audio unless there is a microphone.")
          break;
        case RESULTS.DENIED:
          requestMicrophonePermissions()
          break;
        case RESULTS.LIMITED:
          break;
        case RESULTS.GRANTED:
          startAudioRecording()
          break;
        case RESULTS.BLOCKED:
          requestMicrophonePermissions()
          break;
        }
    })
  }
  
  function requestMicrophonePermissions() {
    request(PERMISSIONS.IOS.MICROPHONE);
  }

  async function restartRecording() {
    setSelectedPatient(null);
    setIsRecording(false);
    setIsDoneRecording(false);
    clearInterval(increment.current)
    setTimer(0)
    const filePath = RNFS.DocumentDirectoryPath + "/test.wav";
    if (await RNFS.exists(filePath)){
      RNFS.unlink(filePath)
    }
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <Picker
          selectedValue={selectedPatient}
          onValueChange={(itemValue, itemIndex) => {
            if (itemIndex === 0) {
              setSelectedPatient(null)
            } else {
              setSelectedPatient(itemValue)
            }
          }}>
          {patients.map((patient, index) => {
            return <Picker.Item key={index} label={patient.label} value={patient.value} />
          })}
        </Picker>

        <Text alignment="center" size="3">{formatTime()}</Text>

        { (!isRecording && !doneRecording) && 
          <Button color="info" size="medium" onPress={handleButtonPress}>
            <Text size="medium" color="white" transform="uppercase">Start recording</Text>
          </Button>
        }
        
        { isRecording && 
          <Button color="danger" size="medium" onPress={stopAudioRecording}>
            <Text size="medium" color="white" transform="uppercase">Stop recording</Text>
          </Button>
        }

        { doneRecording && 
          <Button color="success" size="medium" onPress={uploadRecording} loading={showActivity}>
            <Text size="large" color="white" transform="uppercase">Upload</Text>
          </Button>
        }
      </View>

      <Button style={styles.bottom} color="info" size="small" onPress={restartRecording}>
        <Text size="small" color="white" transform="uppercase">Restart recording</Text>
      </Button>
        
    </View>
    );
  }