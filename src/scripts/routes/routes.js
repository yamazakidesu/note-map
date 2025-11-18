import AddStoryPage from '../pages/add/add-page';
import LoginPage from '../pages/auth/login-page';
import RegisterPage from '../pages/auth/register-page';
import FavoritesPage from '../pages/favorites/favorite-page';
import HomePage from '../pages/home/home-page';

const routes = {
  '/': HomePage,
  '/add': AddStoryPage,
  '/login': LoginPage,
  '/register': RegisterPage,
  '/favorites': FavoritesPage,
};

export default routes;