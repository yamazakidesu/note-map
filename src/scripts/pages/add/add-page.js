import L from 'leaflet';
import StoryApiSource from '../../data/api';
import CONFIG from '../../utils/config';
import DatabaseHelper from '../../utils/database-helper';
import SweetAlert from '../../utils/sweet-alert';

export default class AddStoryPage {
  async render() {
    return `
      <section class="content add-story-container">
        <h1 class="content__title"><i class="fas fa-plus-circle" aria-hidden="true"></i> Tambah Cerita Baru</h1>
        
        <form id="add-story-form" class="add-story-form" novalidate>
          <div class="form-group">
            <label for="photo">1. Unggah Foto</label>
            <input type="file" id="photo" name="photo" accept="image/*" required>
          </div>

          <div class="camera-section">
            <p>Atau ambil foto langsung:</p>
            <button type="button" id="open-camera-btn" class="camera-button">
              <i class="fas fa-camera" aria-hidden="true"></i> Buka Kamera
            </button>
            <div id="camera-container" class="camera-container" style="display: none;">
              <video id="camera-feed" autoplay></video>
              <div class="camera-controls">
                <button type="button" id="capture-btn" class="capture-button">Ambil Gambar</button>
                <button type="button" id="close-camera-btn" class="close-button">Tutup</button>
              </div>
            </div>
            <canvas id="camera-canvas" style="display: none;"></canvas>
            <div id="capture-preview"></div>
          </div>
          
          <div class="form-group">
            <label for="description">2. Tulis Deskripsi Cerita</label>
            <textarea id="description" name="description" rows="4" required minlength="3"></textarea>
          </div>
          
          <div class="form-group">
            <label for="map-picker">3. Pilih Lokasi di Peta</label>
            <div id="map-picker" class="map-picker"></div>
          </div>
          
          <div class="form-group form-group-coords">
            <div class="coord-input">
              <label for="latitude">Latitude</label>
              <input type="text" id="latitude" name="lat" readonly required placeholder="Pilih dari peta">
            </div>
            <div class="coord-input">
              <label for="longitude">Longitude</label>
              <input type="text" id="longitude" name="lon" readonly required placeholder="Pilih dari peta">
            </div>
          </div>

          <button type="submit" id="submit-button" class="submit-button">
            <i class="fas fa-paper-plane" aria-hidden="true"></i> Bagikan Cerita
          </button>
        </form>
      </section>
    `;
  }

  async afterRender() {
    this.capturedFile = null;
    this._initializeMapPicker();
    this._initializeCamera();
    this._handleFormSubmission();
  }

  _initializeMapPicker() {
    const mapPicker = L.map('map-picker').setView(CONFIG.MAP_INITIAL_COORDS, CONFIG.MAP_INITIAL_ZOOM);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapPicker);
    this._handleMapClicks(mapPicker);
  }

  _handleMapClicks(map) {
    let selectedMarker = null;
    const latInput = document.getElementById('latitude');
    const lonInput = document.getElementById('longitude');

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      latInput.value = lat.toFixed(6);
      lonInput.value = lng.toFixed(6);

      if (selectedMarker) map.removeLayer(selectedMarker);
      
      selectedMarker = L.marker([lat, lng]).addTo(map);
      selectedMarker.bindPopup("Lokasi cerita dipilih").openPopup();
    });
  }

   _initializeCamera() {
    const openCameraBtn = document.getElementById('open-camera-btn');
    const closeCameraBtn = document.getElementById('close-camera-btn');
    const cameraContainer = document.getElementById('camera-container');
    const video = document.getElementById('camera-feed');
    const captureBtn = document.getElementById('capture-btn');
    const canvas = document.getElementById('camera-canvas');
    const capturePreview = document.getElementById('capture-preview');
    this.mediaStream = null;
    this.capturedFile = null;
    const closeCamera = () => {
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop());
        cameraContainer.style.display = 'none';
        this.mediaStream = null;
      }
    };

    openCameraBtn.addEventListener('click', async () => {
      try {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        video.srcObject = this.mediaStream;
        cameraContainer.style.display = 'flex';
      } catch(err) {
        alert('Kamera tidak dapat diakses. Pastikan Anda memberikan izin.');
       console.error("Error accessing camera: ", err);
      }
    });

    captureBtn.addEventListener('click', () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
     
      const previewUrl = canvas.toDataURL('image/jpeg');
      capturePreview.innerHTML = `<p>Preview Foto:</p><img src="${previewUrl}" alt="Hasil jepretan kamera">`;
      canvas.toBlob(blob => {
        this.capturedFile = new File([blob], "camera-shot.jpg", { type: "image/jpeg" });
      }, 'image/jpeg');
      closeCamera();
    });
    closeCameraBtn.addEventListener('click', closeCamera);
  }

  async _compressImage(file) {
    const maxSize = 1000000; 
    if (file.size <= maxSize) return file;

    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = URL.createObjectURL(file);
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.sqrt(maxSize / file.size);
        canvas.width = image.width * scale;
        canvas.height = image.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        ctx.canvas.toBlob((blob) => {
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        }, 'image/jpeg', 0.7);
      };
      image.onerror = (error) => reject(error);
    });
  }

  _handleFormSubmission() {
    const form = document.getElementById('add-story-form');
    const submitButton = document.getElementById('submit-button');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      submitButton.disabled = true;
      
      const photoInput = document.getElementById('photo');
      const descriptionInput = document.getElementById('description');
      const latInput = document.getElementById('latitude');
      const lonInput = document.getElementById('longitude');

      const photo = this.capturedFile || photoInput.files[0];

      if (!photo || !descriptionInput.value || !latInput.value || !lonInput.value) {
        SweetAlert.showError('Gagal: Semua kolom wajib diisi.');
        submitButton.disabled = false;
        return;
      }
      
      const storyData = {
        photo,
        description: descriptionInput.value,
        lat: parseFloat(latInput.value),
        lon: parseFloat(lonInput.value),
      };

      try {
        SweetAlert.showLoading();
        const compressedPhoto = await this._compressImage(storyData.photo);
        storyData.photo = compressedPhoto;

        await StoryApiSource.addNewStory(storyData);
        SweetAlert.showSuccess('Cerita berhasil ditambahkan!');
        
        setTimeout(() => { window.location.hash = '#/'; }, 1500);
        
      } catch (error) {
        if (!navigator.onLine || error.message.includes('Failed to fetch')) {
          SweetAlert.close();
          try {
            await DatabaseHelper.putDraft(storyData);
            
            if ('SyncManager' in window) {
              const registration = await navigator.serviceWorker.ready;
              await registration.sync.register('sync-new-stories');
              SweetAlert.showSuccess('Anda sedang offline. Cerita disimpan sebagai draft dan akan dikirim saat kembali online.');
            } else {
              SweetAlert.showError('Background Sync tidak didukung. Draft tidak bisa dikirim otomatis.');
            }
            
            setTimeout(() => { window.location.hash = '#/'; }, 2000);
          } catch (dbError) {
            SweetAlert.showError(`Gagal menyimpan draft: ${dbError.message}`);
            submitButton.disabled = false;
          }
        } else {
          SweetAlert.showError(`Gagal menambahkan cerita: ${error.message}`);
          submitButton.disabled = false;
        }
      }
    });
  }
}