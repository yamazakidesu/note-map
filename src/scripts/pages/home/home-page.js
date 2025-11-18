import L from 'leaflet';
import StoryApiSource from '../../data/api';
import CONFIG from '../../utils/config';
import DatabaseHelper from '../../utils/database-helper';
import SweetAlert from '../../utils/sweet-alert';

// Import dan perbaikan untuk ikon Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export default class HomePage {
  async render() {
    return `
      <section class="content-container">
        <div class="story-list-container">
          <h1 class="story-list__title">Jelajahi Cerita Pengguna</h1>
          <div class="story-list">
            </div>
        </div>
        <div id="map" class="map-container" aria-label="Peta Lokasi Cerita"></div>
      </section>
    `;
  }

  async afterRender() {
    const openStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    });
    const esriWorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles © Esri',
    });
    const map = L.map('map', { layers: [openStreetMap] }).setView(CONFIG.MAP_INITIAL_COORDS, CONFIG.MAP_INITIAL_ZOOM);
    L.control.layers({ 'Street View': openStreetMap, 'Satelit View': esriWorldImagery }).addTo(map);

    const storyListContainer = document.querySelector('.story-list');
    const markers = {};

    try {
      storyListContainer.innerHTML = '<p class="loading-message">Memuat data cerita...</p>';
      const stories = await StoryApiSource.getAllStories();
      const favoriteStories = await DatabaseHelper.getAllStories();
      const favoriteIds = favoriteStories.map((story) => story.id);
      
      storyListContainer.innerHTML = '';

      if (stories.length === 0) {
        storyListContainer.innerHTML = '<p>Belum ada cerita dengan lokasi yang dibagikan.</p>';
        return;
      }
      
      stories.forEach((story) => {
        const isFavorite = favoriteIds.includes(story.id);
        storyListContainer.innerHTML += `
          <article class="story-item" data-id="${story.id}" tabindex="0" role="button" aria-label="Cerita oleh ${story.name}">
            <img class="story-item__image" src="${story.photoUrl}" alt="Foto cerita dari ${story.name}" crossorigin="anonymous">
            <div class="story-item__content">
              <h3 class="story-item__name">${story.name}</h3>
              <p class="story-item__date">
                ${new Date(story.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}
              </p>
              <p class="story-item__description">${story.description.substring(0, 100)}...</p>
            </div>
            <button class="favorite-button" data-id="${story.id}" aria-label="${isFavorite ? 'Hapus dari favorit' : 'Tambahkan ke favorit'}">
              <i class="${isFavorite ? 'fas' : 'far'} fa-heart" aria-hidden="true"></i>
            </button>
          </article>
        `;

        const marker = L.marker([story.lat, story.lon]).addTo(map);
        marker.bindPopup(`...`); 
        markers[story.id] = marker;
      });

      const handleStoryClick = (storyId) => {
        const targetMarker = markers[storyId];
        if (targetMarker) {
          map.flyTo(targetMarker.getLatLng(), 13);
          targetMarker.openPopup();
        }
      };

      storyListContainer.addEventListener('click', async (event) => {
        const storyItem = event.target.closest('.story-item[role="button"]');
        const favoriteButton = event.target.closest('.favorite-button');

        if (favoriteButton) { 
          event.stopPropagation();
          const storyId = favoriteButton.dataset.id;
          const storyData = stories.find((story) => story.id === storyId);
          const heartIcon = favoriteButton.querySelector('i');

          const isCurrentlyFavorite = heartIcon.classList.contains('fas');

          if (isCurrentlyFavorite) {
            await DatabaseHelper.deleteStory(storyId);
            SweetAlert.showSuccess('Cerita dihapus dari favorit.');
            heartIcon.classList.replace('fas', 'far');
            favoriteButton.setAttribute('aria-label', 'Tambahkan ke favorit');
          } else {
            await DatabaseHelper.putStory(storyData);
            SweetAlert.showSuccess('Cerita ditambahkan ke favorit!');
            heartIcon.classList.replace('far', 'fas');
            favoriteButton.setAttribute('aria-label', 'Hapus dari favorit');
          }
        } else if (storyItem) {
          handleStoryClick(storyItem.dataset.id);
        }
      });
      
      storyListContainer.addEventListener('keydown', (event) => {
        const storyItem = event.target.closest('.story-item[role="button"]');
        if (storyItem && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          handleStoryClick(storyItem.dataset.id);
        }
      });

    } catch (error) {
      storyListContainer.innerHTML = `<p class="error-message">Gagal memuat data. Error: ${error.message}</p>`;
      console.error(error);
    }
  }
}