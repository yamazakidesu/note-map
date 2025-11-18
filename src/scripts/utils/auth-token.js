const AuthToken = {
  save(token) {
    localStorage.setItem('authToken', token);
  },

  get() {
    return localStorage.getItem('authToken');
  },

  remove() {
    localStorage.removeItem('authToken');
  },
};

export default AuthToken;