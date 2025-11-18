export default class AboutPage {
  async render() {
    return `
      <section class="content about-container">
        <h1 class="content__title">Apa itu notemap?</h1>
        
        <div class="about-section">
          <h2>Deskripsi</h2>
          <p>
            notemap ini merupakan aplikasi note app dengan map interaktif menggunakan leaflet
          </p>
          <p>
            aplikasi ini menggunakan API dari dicoding untuk menampilkan note dari pengguna lain dengan API yang sama
        </div>

        <div class="about-section">
          <h2>Fitur-fitur</h2>
          <ul>
            <li>Menyajikan visualisasi data cerita dalam bentuk peta digital interaktif menggunakan Leaflet.js.</li>
            <li>Setiap cerita ditandai dengan marker yang dapat diklik untuk menampilkan informasi lengkap lewat pop-up.</li>
            <li>Menyediakan opsi tampilan peta, mulai dari mode ‘Street View’ hingga ‘Satellite View’ yang bisa dipilih pengguna.</li>
            <li>Daftar cerita terhubung dengan peta sehingga navigasi antar lokasi menjadi lebih praktis.</li>
            <li>Memungkinkan pengguna menambahkan cerita baru dengan menentukan titik lokasi langsung melalui klik pada peta.</li>
            <li>Mendukung unggahan gambar baik dari berkas lokal maupun melalui kamera perangkat secara langsung.</li>
            <li>Tata letak responsif yang berfungsi optimal di smartphone, tablet, maupun komputer.</li>
            <li>Mengadopsi prinsip aksesibilitas, termasuk dukungan navigasi via keyboard dan tombol “Skip to Content”.</li>

          </ul>
        </div>

        
      </section>
    `;
  }

  async afterRender() {}
}
