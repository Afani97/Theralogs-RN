import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from "react-native-config";

export default class ApiService {

    static base_url = `${Config.BASE_URL}`;

    static async getCurrentUser() {
        try {
            const access_token = await AsyncStorage.getItem('@access_token')
            if(access_token !== null) {
              return access_token;
            } else {
                return null;
            }
          } catch(e) {
            return null;
          }
    }

    static async post(url, data, success, error) {
        const accecss_token = await ApiService.getCurrentUser();
        fetch(`${ApiService.base_url}/${url}`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json", 
                'Authorization': `Bearer ${accecss_token}`,
            },
            body: data
          }).then(async resp => {
            if (resp.status == 200) {
                const json = await resp.json()
                success(json)
            } else {
                error("Error posting to service")
            }
          }).catch(err => {
              error(err)
          })
    }

    static async get(url, success, error) {
        const accecss_token = await ApiService.getCurrentUser();
        fetch(`${ApiService.base_url}/${url}`, {
            method: 'GET', 
            headers: {
                'Authorization': `Bearer ${accecss_token}`,
            }
        }).then(async resp => {
            if (resp.status == 200) {
                const json = await resp.json()
                success(json)
            } else {
                error("Error getting service")
            }
          }).catch(err => {
              error(err)
          })
    }
}