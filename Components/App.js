import 'react-native-gesture-handler'
import React, { useState, useEffect } from 'react';
import { Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AuthContext from '../auth-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ApiSerice from '../ApiService';
import { ApplicationProvider, theme } from '@jrobins/bulma-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import LoginView from './LoginView';
import MainView from './MainView';
import ClientView from './ClientView';
import NewClientView from './NewClientView';
import ProfileView from './ProfileView';
import ClientProfileView from './ClientProfileView';


export default function App() {

  const [validSession, setValidSession] = useState(false);
  const [isSignout, setIsSignout] = useState(false);

  const authContext = React.useMemo(
    () => ({
      signIn: () => {
        setValidSession(true);
      },
      signOut: () => logoutSession(),
    }),
    []
  );

  const getSession = async () => {
    const last_login_date = await AsyncStorage.getItem("@date")
    if (last_login_date !== null) {
      const current_date = new Date();
      const time_diff = current_date.getTime() - new Date(JSON.parse((last_login_date))).getTime(); 
      var days_diff = time_diff / (1000 * 3600 * 24);
      if (days_diff >= 1) {
        authContext.signOut()
      }
    }

    const access_token = await ApiSerice.getCurrentUser();
    if(access_token !== null) {
      setValidSession(true);
    }
    
  }

  useEffect(() => {
    getSession()
  }, []);
  

  async function logoutSession() {
    setIsSignout(true);
    setValidSession(false);
    
    setTimeout(function() {
      setIsSignout(false);
    }, 100);

    try {
      await AsyncStorage.removeItem("@access_token")
      await AsyncStorage.removeItem("@refresh_token")
      await AsyncStorage.removeItem("@date")
      
    } catch(e) {
    }
  }

  

  const Stack = createStackNavigator();
  const Tab = createBottomTabNavigator();

  const HomeStack = createStackNavigator();
  function HomeStackScreen() {
    return (
      <HomeStack.Navigator 
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.info,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <HomeStack.Screen name="Home" component={MainView} options={{ title: 'Record audio'}}/>
      </HomeStack.Navigator>
    );
  }

  const ClientStack = createStackNavigator();
  function ClientStackScreen() {
    return (
      <ClientStack.Navigator mode="modal"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.info,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}> 
        <ClientStack.Screen name="My Clients" component={ClientView} 
          options={({ navigation }) => ({
            headerRight: () => <Button title="New" color="white" onPress={() => navigation.navigate("New Client")} />, 
          })}
          />
        <ClientStack.Screen name="New Client" component={NewClientView} 
          options={({ navigation }) => ({
            headerLeft: () =>  <Button title="Cancel" color="white" onPress={() => navigation.goBack() } />
          })}
          />
        <ClientStack.Screen name="Client Sessions" component={ClientProfileView} 
          options={({ navigation }) => ({
            headerLeft: () =>  <Button title="Close" color="white" onPress={() => navigation.goBack() } />
          })}
        />
      </ClientStack.Navigator>
    );
  }

  const ProfileStack = createStackNavigator();
  function ProfileStackScreen() {
    return (
      <ProfileStack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.info,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <ProfileStack.Screen name="Profile" component={ProfileView} />
      </ProfileStack.Navigator>
    );
  }

  return (
    <ApplicationProvider iconPack={FontAwesome5} theme={theme}>
      <AuthContext.Provider value={authContext}>
        <NavigationContainer>
          {validSession ? (
            <Tab.Navigator
              screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                  let iconName;
      
                  if (route.name === 'Home') {
                    iconName = focused
                      ? 'home'
                      : 'home-outline';
                  } else if (route.name === 'My Clients') {
                    iconName = focused ? 'people' : 'people-outline';
                  } else if (route.name === 'Profile') {
                    iconName = focused ? 'person' : 'person-outline';
                  }
      
                  // You can return any component that you like here!
                  return <Ionicons name={iconName} size={size} color={color} />;
                },
              })}
              tabBarOptions={{
                activeTintColor: theme.colors.info,
                inactiveTintColor: 'gray',
              }}
            >
              <Tab.Screen name="Home" component={HomeStackScreen} />
              <Tab.Screen name="My Clients" component={ClientStackScreen} />
              <Tab.Screen name="Profile" component={ProfileStackScreen} />
            </Tab.Navigator>
            ) : (
              <Stack.Navigator
              screenOptions={{
                headerStyle: {
                  backgroundColor: theme.colors.info,
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}>
                <Stack.Screen name="SignIn" component={LoginView} 
                  options={{ title: 'Theralogs', animationTypeForReplace: isSignout ? 'pop' : 'popup', }} 
                />
              </Stack.Navigator>
            )
          }
        </NavigationContainer>
      </AuthContext.Provider>
    </ApplicationProvider>
  );

}
