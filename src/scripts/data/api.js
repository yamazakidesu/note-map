import AuthToken from '../utils/auth-token';
import CONFIG from '../utils/config';

class StoryApiSource {
  static async login(credentials) {
    const response = await fetch(`${CONFIG.BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const responseJson = await response.json();
    if (responseJson.error) {
      throw new Error(responseJson.message);
    }
    
    return responseJson.loginResult;
  }

  static async getAllStories() {
    const token = AuthToken.get();
    if (!token) {
      return [];
    }

    try {
      const response = await fetch(`${CONFIG.BASE_URL}/stories?location=1`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const responseJson = await response.json();
      if (responseJson.error) { throw new Error(responseJson.message); }
      return responseJson.listStory;
    } catch (error) {
      console.error('Gagal mengambil data cerita:', error);
      return [];
    }
  }

  static async addNewStory(data) {
    const token = AuthToken.get(); 
    if (!token) {
      throw new Error('Anda harus login untuk menambahkan cerita.');
    }
    
    const formData = new FormData();
    formData.append('photo', data.photo);
    formData.append('description', data.description);
    formData.append('lat', data.lat);
    formData.append('lon', data.lon);

    const response = await fetch(`${CONFIG.BASE_URL}/stories`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const responseJson = await response.json();
    if (responseJson.error) { throw new Error(responseJson.message); }
    return responseJson;
  }
  static async register(credentials) {
    const response = await fetch(`${CONFIG.BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const responseJson = await response.json();
    if (responseJson.error) {
      throw new Error(responseJson.message);
    }
    
    return responseJson;
  }

static async subscribeNotification(subscription) {
  const token = AuthToken.get();
  const subscriptionJson = subscription.toJSON();
  delete subscriptionJson.expirationTime;
  const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(subscriptionJson),
  });

  const responseJson = await response.json();
  if (responseJson.error) throw new Error(responseJson.message);
  return responseJson;
}

  static async unsubscribeNotification(endpoint) {
    const token = AuthToken.get();
    const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ endpoint }),
    });
    const responseJson = await response.json();
    if (responseJson.error) throw new Error(responseJson.message);
    return responseJson;
  }
}

export default StoryApiSource;