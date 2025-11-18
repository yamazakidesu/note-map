import 'leaflet/dist/leaflet.css';
import '../styles/styles.css';
import App from './app';
import StoryApiSource from './data/api';
import AuthToken from './utils/auth-token';
import DatabaseHelper from './utils/database-helper';
import NotificationHelper from './utils/notification-helper';

const app = new App({
  drawerButton: document.querySelector('#drawer-button'),
  navigationDrawer: document.querySelector('#navigation-drawer'),
  content: document.querySelector('.main-content'),
});

const checkLoginState = () => {
  const logoutButton = document.querySelector('#logout-button');
  const addStoryLink = document.querySelector('a[href="#/add"]');
  const notificationBtn = document.querySelector('#notification-toggle-btn');

  const isLoggedIn = !!AuthToken.get();

  if (logoutButton) {
    logoutButton.style.display = isLoggedIn ? 'block' : 'none';
  }
  if (addStoryLink) {
    addStoryLink.style.display = isLoggedIn ? 'block' : 'none';
  }
  if (notificationBtn) {
    notificationBtn.style.display = isLoggedIn ? 'flex' : 'none';
  }
};

const updateNotificationButtonState = async () => {
  const notificationBtn = document.getElementById('notification-toggle-btn');
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      SweetAlert.showError('Fitur notifikasi tidak didukung di browser atau lingkungan ini.');
      return;
    }

  const notificationText = document.getElementById('notification-text');
  const notificationIcon = notificationBtn.querySelector('i');

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration?.pushManager.getSubscription();

    if (subscription) {
      notificationText.textContent = 'Unsubscribe';
      notificationIcon.className = 'fas fa-bell-slash';
      notificationBtn.classList.add('subscribed');
    } else {
      notificationText.textContent = 'Subscribe';
      notificationIcon.className = 'far fa-bell';
      notificationBtn.classList.remove('subscribed');
    }
  } catch (error) {
    console.error('Gagal memperbarui status tombol notifikasi:', error);
  }
};

const syncOfflineDrafts = async () => {
  if (!navigator.onLine || !AuthToken.get()) return;

  try {
    const drafts = await DatabaseHelper.getAllDrafts();
    if (drafts.length === 0) return;

    console.log(`Menemukan ${drafts.length} draft, mencoba sinkronisasi...`);
    alert(`Menyinkronkan ${drafts.length} cerita yang tersimpan offline...`);

    for (const draft of drafts) {
      await StoryApiSource.addNewStory(draft);
      await DatabaseHelper.deleteDraft(draft.id);
      console.log(`Draft dengan ID ${draft.id} berhasil disinkronkan.`);
    }
    alert('Semua draft offline berhasil dikirim ke server!');
    
  } catch (error) {
    console.error('Gagal melakukan sinkronisasi draft:', error);
    alert('Sebagian draft mungkin gagal disinkronkan.');
  }
};

const handleRoute = () => {
  const destination = window.location.hash.substring(1) || '/';
  const privatePages = ['/', '/add'];
  const publicPages = ['/login', '/register', '/about'];

  checkLoginState();

  if (privatePages.includes(destination) && !AuthToken.get()) {
    window.location.hash = '#/login';
    return;
  }

  if ((destination === '/login' || destination === '/register') && AuthToken.get()) {
    window.location.hash = '#/';
    return;
  }
  
  app.renderPage();
};

window.addEventListener('hashchange', handleRoute);

window.addEventListener('load', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log('Service Worker registered successfully.'))
      .catch(error => console.log('Service Worker registration failed:', error));
  }

  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      AuthToken.remove();
      window.location.hash = '#/login';
      window.location.reload();
    });
  }

  const notificationBtn = document.getElementById('notification-toggle-btn');
if (notificationBtn) {
  notificationBtn.addEventListener('click', async () => {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    let success = false;
    
    if (subscription) {
      success = await NotificationHelper.unsubscribe();
    } else {
      success = await NotificationHelper.subscribe();
    }

    if (success) {
      setTimeout(() => updateNotificationButtonState(), 100); 
    }
  });
}
  handleRoute();
  syncOfflineDrafts();
  updateNotificationButtonState();
});