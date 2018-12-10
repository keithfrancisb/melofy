import React from 'react';
import { NavLink } from 'react-router-dom';
import Browse from './browse/browse';
import Search from './search/search';
import Collection from './collection/collection';
import { ProtectedRoute } from '../../util/route_util';

import { connect } from 'react-redux';
import { logout } from '../../actions/session_actions';
import { fetchCurrentSong } from '../../actions/now_playing_actions';

class Dashboard extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      // progress: 0,
      playbackButton: 'https://s3.amazonaws.com/playlist-dev/icons/music+player/noun_play+button_895200.png',
      volume: 1,
      duration: 0,
      currentTime: 0,
      muted: false,
      shuffle: false
     };

    this.updateProgressBar = this.updateProgressBar.bind(this);
    this.togglePlayPause = this.togglePlayPause.bind(this);
    this.toggleShuffle = this.toggleShuffle.bind(this);
    this.updateVolume = this.updateVolume.bind(this);
    this.muteVolume = this.muteVolume.bind(this);
    this.nextSong = this.nextSong.bind(this);
    this.prevSong = this.prevSong.bind(this);
    this.seek = this.seek.bind(this);
  }

  componentDidMount() {
    this.updateInterval = setInterval(this.updateProgressBar, 300);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.nowPlaying.id !== this.props.nowPlaying.id){
      const player = document.getElementById('music-player');
      player.load();
      this.togglePlayPause();
      this.setState({
        duration: player.duration || 0,
      });
    }
  }

  nextSong() {
    const { songIdList } = window;
    const { nowPlaying } = this.props;
    let newIndex = !this.state.shuffle ? songIdList.queue.indexOf(nowPlaying.id) + 1 : songIdList.shuffleQueue.indexOf(nowPlaying.id) + 1;
    let newSongId = !this.state.shuffle ? songIdList.queue[newIndex] : songIdList.shuffleQueue[newIndex];
    if (newIndex === songIdList.length) newSongId = songIdList[0];

    this.props.fetchCurrentSong(newSongId);
  }

  prevSong() {
    const { songIdList } = window;
    const { nowPlaying } = this.props;
    const player = document.getElementById('music-player');

    if(player.currentTime < 2){
      let newIndex = !this.state.shuffle ? songIdList.queue.indexOf(nowPlaying.id) - 1 : songIdList.shuffleQueue.indexOf(nowPlaying.id) - 1;
      let newSongId = !this.state.shuffle ? songIdList.queue[newIndex] : songIdList.shuffleQueue[newIndex];
      if (newIndex === -1) newSongId = songIdList[songIdList.length-1];
      this.props.fetchCurrentSong(newSongId);
    } else {
      player.load();
      player.play();
    }

  }

  togglePlayPause() {
    const player = document.getElementById('music-player');

    const newIcon = player.paused ? 'https://s3.amazonaws.com/playlist-dev/icons/music+player/noun_pause+button_895204.png' :
      'https://s3.amazonaws.com/playlist-dev/icons/music+player/noun_play+button_895200.png';

    this.setState({ playbackButton: newIcon });
    player.paused ? player.play() : player.pause();
  }

  toggleRepeat() {
    const player = document.getElementById('music-player');
    const repeatButton = document.getElementsByClassName('repeat')[0];

    player.loop = !player.loop;
    if(player.loop) {
      repeatButton.style.color = '#1db954';
    } else {
      repeatButton.style.color = '';
    }
  }

  toggleShuffle() {
    const shuffleButton = document.getElementsByClassName('shuffle')[0];
    let { shuffleQueue } = window.songIdList;

    if(!this.state.shuffle){
      const currentIndex = shuffleQueue.indexOf(this.props.nowPlaying.id);
      shuffleQueue = shuffleQueue.slice(currentIndex).concat(shuffleQueue.slice(0,currentIndex));
      shuffleButton.style.color = '#1db954';
      this.setState({ shuffle: !this.state.shuffle});
    } else {
      shuffleButton.style.color = '';
      this.setState({ shuffle: !this.state.shuffle});
    }
  }

  seek(e) {
    const player = document.getElementById('music-player');

    if(player && player.currentTime) {
      this.setState({ currentTime: e.target.value });
      player.currentTime = e.target.value;
    }
  }

  updateProgressBar() {
    const player = document.getElementById('music-player');
    if (player.paused) this.setState( { playbackButton: 'https://s3.amazonaws.com/playlist-dev/icons/music+player/noun_play+button_895200.png'});
    this.setState({
      duration: player.duration || 0,
      currentTime: player.currentTime || 0,
    });
  }

  updateCurrentTime() {
    const player = document.getElementById('music-player');

    if(player) {
      const currentTime = player.currentTime;

      const current_hour = parseInt(currentTime / 3600) % 24;
      const current_minute = parseInt(currentTime / 60) % 60;
      const current_seconds_long = currentTime % 60;
      const current_seconds = current_seconds_long.toFixed();
      const current_time = (current_minute < 10 ? "0" + current_minute :
        current_minute) + ":" + (current_seconds < 10 ? "0" + current_seconds : current_seconds);

      return current_time;
    }
  }

  renderTotalTime() {
    const player = document.getElementById('music-player');

    if(player && player.duration) {
      const duration = player.duration;
      const total_minute = parseInt(duration / 60) % 60;
      const total_seconds_long = duration % 60;
      const total_seconds = total_seconds_long.toFixed();
      const totalTime = (total_minute < 10 ? "0" + total_minute :
        total_minute) + ":" + (total_seconds < 10 ? "0" + total_seconds : total_seconds);

      return totalTime;
    } else {
      return '--:--';
    }
  }

  muteVolume() {
    const volumeBar = document.getElementById('volume');
    const player = document.getElementById('music-player');
    const mute = document.getElementById('mute');

    if(!this.state.muted) {
      mute.classList.toggle('muted');
      this.setState({ muted: !this.state.muted });
      volumeBar.value = 0;
      player.volume = 0;
    } else {
      mute.classList.toggle('muted');
      this.setState({ muted: !this.state.muted });
      volumeBar.value = this.state.volume;
      player.volume = this.state.volume;
    }
  }

  updateVolume(e) {
    const volumeBar = document.getElementById('volume');
    const player = document.getElementById('music-player');
    const mute = document.getElementById('mute');
    debugger
    this.setState({ volume: e.target.value });
    if(Object.values(mute.classList).includes('muted')) {
      this.muteVolume();
    } else {
      volumeBar.value = e.target.value;
      player.volume = e.target.value;

    }
  }

  renderNowPlayingInfo() {
    if(this.props.nowPlaying.name) {
      const { name, artistName, albumName, albumImage } = this.props.nowPlaying;
      return (
        <>
          <div className='album-image-player'>
            <img src={albumImage}></img>
          </div>
          <div className='song-artist-info-bar'>
            <div className='song-name-player'><span>{name}</span></div>
            <div className='artist-name-player'><span>{artistName}</span></div>
          </div>
        </>
      );
    }
  }

  render(){
    const { currentUser, logout, albums, artists } = this.props;
    return (
      <div className='collection-main'>
        <nav className='sidebar'>
          <div>
            <h2>Melofy</h2>
            <ul className='three-musketeers'>
              <li>
                <div>
                <NavLink activeClassName='green' to='/dashboard/search'>
                  <svg viewBox="0 0 512 512" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path d="M349.714 347.937l93.714 109.969-16.254 13.969-93.969-109.969q-48.508 36.825-109.207 36.825-36.826 0-70.476-14.349t-57.905-38.603-38.603-57.905-14.349-70.476 14.349-70.476 38.603-57.905 57.905-38.603 70.476-14.349 70.476 14.349 57.905 38.603 38.603 57.905 14.349 70.476q0 37.841-14.73 71.619t-40.889 58.921zM224 377.397q43.428 0 80.254-21.461t58.286-58.286 21.461-80.254-21.461-80.254-58.286-58.285-80.254-21.46-80.254 21.46-58.285 58.285-21.46 80.254 21.46 80.254 58.285 58.286 80.254 21.461z" fill="currentColor" fillRule="evenodd"></path></svg>
                  <span className='three-musketeers-text'>Search</span>
                </NavLink>
                </div>
              </li>
              <li>
                <div>
                  <NavLink activeClassName='green' to='/dashboard/browse'>
                    <svg viewBox="0 0 512 512" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path d="M 256.274 60.84 L 84.324 166.237 L 84.324 443.063 L 193.27 443.063 L 193.27 293.73 L 320.228 293.73 L 320.228 443.063 L 428.222 443.063 L 428.222 165.476 L 256.274 60.84 Z M 256.274 35.95 L 448.452 149.145 L 448.452 464.395 L 300 464.395 L 300 315.062 L 213.499 315.062 L 213.499 464.395 L 64.095 464.395 L 64.095 150.161 L 256.274 35.95 Z" fill="currentColor"></path></svg>
                    <span className='three-musketeers-text'>Home</span>
                  </NavLink>
                </div>
              </li>
              <li>
                <div>
                  <NavLink activeClassName='green' to='/dashboard/collection'>
                    <svg viewBox="0 0 512 512" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path d="M311.873 77.46l166.349 373.587-39.111 17.27-166.349-373.587zM64 463.746v-384h42.666v384h-42.666zM170.667 463.746v-384h42.667v384h-42.666z" fill="currentColor"></path></svg>
                    <span className='three-musketeers-text'>Your Library</span>
                  </NavLink>
                </div>
              </li>
            </ul>
          </div>

          <ul className='current-user-info'>
            <li><button onClick={logout}>Log Out</button></li>
            <div className='super-mini-divider'/>
            <li>{currentUser.first_name} {currentUser.last_name}</li>
          </ul>
        </nav>

        <div className='now-playing-bar'>
          <footer className='footer-player-bar'>
            <div className='now-playing-bar-left'>
              {this.renderNowPlayingInfo()}
            </div>
            <div className='now-playing-bar-center'>
              <div className='player-controls'>
                <button className='control-button shuffle' onClick={this.toggleShuffle}></button>
                <button className='control-button previousSong' onClick={this.prevSong}></button>
                <button onClick={this.togglePlayPause}>
                  <img src={this.state.playbackButton}></img>
                </button>
                <button className='control-button nextSong' onClick={this.nextSong}></button>
                <button className='control-button repeat' onClick={this.toggleRepeat}></button>
                <audio id='music-player' onTimeUpdate={this.updateProgressBar} volume={this.state.muted ? 0 : this.state.volume} src={this.props.nowPlaying.song_url}>
                </audio>
              </div>
              <div className='playback-bar'>
                <div className='current-time'>{this.updateCurrentTime()}</div>
                <div className='progress-bar-container'>
                  <input className='seeker-bar' type='range' min='0' max={this.state.duration} step='0.25' onChange={this.seek} value={this.state.currentTime}/>
                  <div className='outer-bar'>
                    <div className='inner-bar' style={{width: `${(this.state.currentTime*100)/this.state.duration || 1}%`}}></div>
                  </div>
                </div>
                <div className='end-time'>{this.renderTotalTime()}</div>
              </div>
            </div>
            <div className='now-playing-bar-right'>
              <div className='right-button-icons'>
                <button id='mute' className='control-button mute-button' onClick={this.muteVolume}></button>
              </div>
              <div className='volume-bar-container'>
                <input id='volume' className='volume-slider' type='range' min='0' max='1' step='0.01' value={this.state.muted ? 0 : this.state.volume} onChange={this.updateVolume}/>
                <div className='outer-bar'>
                  <div className='inner-bar' style={{width: `${((document.getElementById('volume') ? document.getElementById('volume').value : .01) * 100)+1 || 100}%`}}></div>
                </div>
              </div>
            </div>
          </footer>
        </div>
        <ProtectedRoute path='/dashboard/search' component={Search}/>
        <ProtectedRoute path='/dashboard/browse' component={Browse}/>
        <ProtectedRoute path='/dashboard/collection' component={Collection}/>
      </div>

    );
  }
}

// <progress id='progress-bar' value={this.state.progress} max='100'></progress>
const msp = (state, ownProps) => {
  return {
    currentUser: state.entities.users[state.session.id],
    albums: state.entities.albums,
    artists: state.entities.artists,
    nowPlaying: state.nowPlaying
  };
};

const mdp = (dispatch) => {
  return {
    logout: () => dispatch(logout()),
    fetchCurrentSong: (songId) => dispatch(fetchCurrentSong(songId))
  };
};

export default connect(msp,mdp)(Dashboard);
