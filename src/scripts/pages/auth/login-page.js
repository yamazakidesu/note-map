import StoryApiSource from '../../data/api';
import AuthToken from '../../utils/auth-token';
import SweetAlert from '../../utils/sweet-alert';

export default class LoginPage {
  async render() {
    return `
      <div class="login-container">
        <h1>Login Notemap</h1>
        <form id="login-form" class="login-form" novalidate>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required placeholder="email@contoh.com">
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required placeholder="Masukkan password">
          </div>
          <button type="submit" class="submit-button">Login</button>
        </form>
        <p class="auth-switch">Belum punya akun? <a href="#/register">Daftar di sini</a>.</p>
      </div>
    `;
  }

  async afterRender() {
    const form = document.getElementById('login-form');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      if (!email || !password) {
        SweetAlert.showError('Email dan password harus diisi.');
        return;
      }

      SweetAlert.showLoading();

      try {
        const loginResult = await StoryApiSource.login({ email, password });
        AuthToken.save(loginResult.token);
        SweetAlert.showSuccess('Login berhasil!');
        setTimeout(() => {
          window.location.hash = '#/';
          window.location.reload();
        }, 1500);

      } catch (error) {
        SweetAlert.showError(`Login gagal: ${error.message}`);
      }
    });
  }
}