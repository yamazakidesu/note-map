import DatabaseHelper from '../../utils/database-helper';
import SweetAlert from '../../utils/sweet-alert';

class FavoritesPage {
  async render() {
    return `
      <section class="content favorites-container">
        <h1 class="content__title">Cerita Favorit Anda</h1>
        <div class="search-bar-container">
          <input type="search" id="search-favorite" placeholder="Cari cerita berdasarkan nama atau deskripsi...">
        </div>
        <div id="favorite-list" class="story-list"></div>
      </section>
    `;
  }

  async afterRender() {
    const favoriteListContainer = document.getElementById('favorite-list');
    const searchInput = document.getElementById('search-favorite');

    const renderStories = (stories) => {
      favoriteListContainer.innerHTML = '';
      if (stories.length === 0) {
        favoriteListContainer.innerHTML = '<p class="empty-message">Anda belum memiliki cerita favorit.</p>';
        return;
      }
      stories.forEach((story) => {
        favoriteListContainer.innerHTML += `
          <article class="story-item" data-story-id="${story.id}">
            <img class="story-item__image" src="${story.photoUrl}" alt="Foto cerita dari ${story.name}" crossorigin="anonymous">
            <div class="story-item__content">
              <h3 class="story-item__name">${story.name}</h3>
              <p class="story-item__date">
                ${new Date(story.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}
              </p>
              <p class="story-item__description">${story.description.substring(0, 150)}...</p>
            </div>
            <button class="favorite-button unfavorite-btn" data-id="${story.id}" aria-label="Hapus dari favorit">
              <i class="fas fa-heart" aria-hidden="true"></i>
            </button>
          </article>
        `;
      });
    };

    let allFavoriteStories = await DatabaseHelper.getAllStories();
    renderStories(allFavoriteStories);

    favoriteListContainer.addEventListener('click', async (event) => {
      const unfavoriteButton = event.target.closest('.unfavorite-btn');
      if (unfavoriteButton) {
        const storyId = unfavoriteButton.dataset.id;

        await DatabaseHelper.deleteStory(storyId);

        const storyElement = document.querySelector(`.story-item[data-story-id="${storyId}"]`);
        storyElement.remove();

        // Perbarui array data lokal
        allFavoriteStories = allFavoriteStories.filter(story => story.id !== storyId);
        if (allFavoriteStories.length === 0) {
          renderStories([]);
        }
        
        SweetAlert.showSuccess('Cerita dihapus dari favorit.');
      }
    });

    searchInput.addEventListener('input', (event) => {
      const query = event.target.value.toLowerCase();
      const filteredStories = allFavoriteStories.filter(
        (story) => story.name.toLowerCase().includes(query) || story.description.toLowerCase().includes(query)
      );
      renderStories(filteredStories);
    });
  }
}

export default FavoritesPage;