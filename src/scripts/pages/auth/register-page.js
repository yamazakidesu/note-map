import StoryApiSource from '../../data/api';

class RegisterPage {
  async render() {
    return `
      <div class="register-container">
        <h2>Daftar Akun Baru</h2>
        <form id="register-form" class="register-form">
          <div class="form-group">
            <label for="name">Nama</label>
            <input type="text" id="name" name="name" required minlength="3">
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required minlength="8">
          </div>
          <button type="submit" class="submit-button">Daftar</button>
        </form>
        <div id="feedback-message"></div>
        <p class="auth-switch">Sudah punya akun? <a href="#/login">Login di sini</a>.</p>
      </div>
    `;
  }

  async afterRender() {
    const form = document.getElementById('register-form');
    const feedbackMessage = document.getElementById('feedback-message');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      if (!name || !email || !password) {
        feedbackMessage.innerHTML = '<p class="error">Semua kolom harus diisi.</p>';
        return;
      }
      
      feedbackMessage.innerHTML = '<p class="info">Mendaftarkan akun...</p>';

      try {
        await StoryApiSource.register({ name, email, password });
        feedbackMessage.innerHTML = '<p class="success">Registrasi berhasil! Anda akan diarahkan ke halaman login.</p>';

        setTimeout(() => {
          window.location.hash = '#/login';
        }, 2000);

      } catch (error) {
        feedbackMessage.innerHTML = `<p class="error">Registrasi gagal: ${error.message}</p>`;
      }
    });
  }
}

export default RegisterPage;