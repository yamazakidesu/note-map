import { openDB } from 'idb';
import CONFIG from './config';

const { 
  DATABASE_NAME, 
  DATABASE_VERSION, 
  OBJECT_STORE_NAME, 
  DRAFT_OBJECT_STORE_NAME, 
} = CONFIG;

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(database) {
    database.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
    database.createObjectStore(DRAFT_OBJECT_STORE_NAME, { autoIncrement: true, keyPath: 'id' });
  },
});

const DatabaseHelper = {
  async getStory(id) {
    return (await dbPromise).get(OBJECT_STORE_NAME, id);
  },
  async getAllStories() {
    return (await dbPromise).getAll(OBJECT_STORE_NAME);
  },
  async putStory(story) {
    return (await dbPromise).put(OBJECT_STORE_NAME, story);
  },
  async deleteStory(id) {
    return (await dbPromise).delete(OBJECT_STORE_NAME, id);
  },

  async getAllDrafts() {
    return (await dbPromise).getAll(DRAFT_OBJECT_STORE_NAME);
  },
  async putDraft(draft) {
    return (await dbPromise).put(DRAFT_OBJECT_STORE_NAME, draft);
  },
  async deleteDraft(id) {
    return (await dbPromise).delete(DRAFT_OBJECT_STORE_NAME, id);
  },
};

export default DatabaseHelper;