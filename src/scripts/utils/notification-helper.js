import StoryApiSource from '../data/api';
import SweetAlert from './sweet-alert';

const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const NotificationHelper = {
  async subscribe() {
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      SweetAlert.showError('Izin notifikasi tidak diberikan. Silakan izinkan notifikasi pada pengaturan browser Anda.');
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    let newSubscription = null;
    SweetAlert.showLoading();

    try {
      newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      console.log('Berhasil mendapatkan subscription dari browser:', newSubscription);

      await StoryApiSource.subscribeNotification(newSubscription);
      console.log('Berhasil mengirim subscription ke server.');

      SweetAlert.showSuccess('Berhasil subscribe notifikasi!');
      return true;
    } catch (err) {
      console.error('PROSES SUBSCRIBE GAGAL:', err);
      SweetAlert.showError('Gagal subscribe, silakan periksa console untuk detail.');

      if (newSubscription) {
        console.log('Membatalkan subscription lokal karena gagal dikirim ke server.');
        await newSubscription.unsubscribe();
      }
      
      return false;
    }
  },

  async unsubscribe() {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      SweetAlert.showError('Anda belum subscribe notifikasi.');
      return false;
    }

    SweetAlert.showLoading();

    try {
      await subscription.unsubscribe();
      await StoryApiSource.unsubscribeNotification(subscription.endpoint);
      SweetAlert.showSuccess('Berhasil unsubscribe notifikasi!');
      return true;
    } catch (err) {
      console.error('PROSES UNSUBSCRIBE GAGAL:', err);
      SweetAlert.showError('Gagal unsubscribe, silakan periksa console untuk detail.');
      return false;
    }
  },
};

export default NotificationHelper;