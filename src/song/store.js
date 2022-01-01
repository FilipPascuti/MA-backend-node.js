import dataStore from 'nedb-promise';

export class SongStore {
  constructor({ filename, autoload }) {
    this.store = dataStore({ filename, autoload });
  }
  
  async find(props) {
    return this.store.find(props);
  }
  
  async findOne(props) {
    return this.store.findOne(props);
  }
  
  async insert(song) {
    let songText = song.text;
    let songDate = song.date;
    let songLiked = song.liked;
    let songLength = song.length;
    if (!songText || !songDate || !songLength || songLiked === undefined ) { // validation
      throw new Error('Missing text property')
    }
    return this.store.insert(song);
  };
  
  async update(props, song) {
    return this.store.update(props, song);
  }
  
  async remove(props) {
    return this.store.remove(props);
  }
}

export default new SongStore({ filename: './db/songs.json', autoload: true });
