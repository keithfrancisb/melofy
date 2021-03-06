import React from 'react';
import { withRouter } from 'react-router-dom';
import { fetchCurrentSong } from '../../../actions/queue_actions';
import { connect } from 'react-redux';
import { save, unsave } from '../../../actions/save_actions';
import { toggleShuffle, toggleRepeat, nextSong, prevSong, finalizeSongChange, changePlayStatus, toggleQueue } from '../../../actions/queue_actions';

class MusicPlayer extends React.Component{

  constructor(props) {
    super(props);

    this.state = {
      playbackButton: 'https://s3.amazonaws.com/playlist-dev/icons/music+player/noun_play+button_895200.png',
      volume: 1,
      duration: 0,
      currentTime: 0,
      muted: false,
      showQueue: false
     };

    this.updateProgressBar = this.updateProgressBar.bind(this);
    this.togglePlayPause = this.togglePlayPause.bind(this);
    this.updateVolume = this.updateVolume.bind(this);
    this.muteVolume = this.muteVolume.bind(this);
    this.prevSong = this.prevSong.bind(this);
    this.seek = this.seek.bind(this);
    this.toggleSave = this.toggleSave.bind(this);
    this.redirectQueue = this.redirectQueue.bind(this);
  }

  componentDidMount() {
    this.updateInterval = setInterval(this.updateProgressBar, 300);
  }

  componentDidUpdate(prevProps) {
    if (this.props.changedSongStatus){
      const player = document.getElementById('music-player');
      player.load();
      this.togglePlayPause();
      this.setState({
        duration: player.duration || 0,
      });
      this.props.finalizeSongChange();
    }
  }

  componentWillUnmount() {
    clearInterval(this.updateInterval);
  }

  togglePlayPause() {
    const player = document.getElementById('music-player');
    if(!player.paused){
      player.pause();
      this.props.changePlayStatus(false);
    } else {
      player.play();
      this.props.changePlayStatus(true);
    }
  }

  prevSong(){
    const player = document.getElementById('music-player');
    if(player.currentTime < 2){
      this.props.prevSong();
    } else {
      player.load();
      player.play();
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
    // if(player && player.paused) this.setState( { playbackButton: 'https://s3.amazonaws.com/playlist-dev/icons/music+player/noun_play+button_895200.png'});
    if(player.ended && (this.props.songList.length !== 0 || this.props.queue.length !== 0)) this.props.nextSong();
    this.setState({
      duration: player.duration || 0,
      currentTime: player.currentTime || 0,
    });
  }

  updateVolume(e) {
    const volumeBar = document.getElementById('volume');
    const player = document.getElementById('music-player');
    const mute = document.getElementById('mute');
    this.setState({ volume: e.target.value });
    if(Object.values(mute.classList).includes('muted')) {
      this.muteVolume();
    } else {
      volumeBar.value = e.target.value;
      player.volume = e.target.value;
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

  toggleSave() {
    const saveButton = document.getElementById('save');
    if(this.props.savedSongIds.includes(this.props.nowPlaying.id)){
      const saveId = this.props.saves.filter( (save) => {
        return save.saveable_id === this.props.nowPlaying.id && save.saveable_type === 'Song';
      })[0].id;
      this.props.unsave(saveId);
      saveButton.classList.remove('saved');
    } else {
      this.props.save(this.props.nowPlaying.id, 'Song');
      saveButton.classList.add('saved');
    }

  }

  renderNowPlayingInfo() {
    let saveIcon;
    if(this.props.savedSongIds.includes(this.props.nowPlaying.id)) {
      saveIcon = 'save-button saved';
    } else {
      saveIcon = 'save-button';
    }

    if(this.props.nowPlaying.name) {
      const { name, artist, album } = this.props.nowPlaying;
      return (
        <>
          <div className='album-image-player'>
            <img src={album.image_url}></img>
          </div>
          <div className='song-artist-info-bar'>
            <div className='song-name-player'><span>{name}</span></div>
            <div className='artist-name-player'><span>{artist.name}</span></div>
          </div>
          <button id='save' className={saveIcon} onClick={this.toggleSave}></button>
        </>
      );
    }
  }

  redirectQueue() {
    // debugger
    if(!this.props.showQueue){
      this.props.toggleQueue(true);
      this.props.history.push('/dashboard/queue');
    } else {
      this.props.history.goBack();
      this.props.toggleQueue(false);
    }
  }

  render() {
    const { shuffleStatus, repeatAllStatus, repeatSongStatus, playStatus, history } = this.props;

    const playIcon = 'https://s3.amazonaws.com/playlist-dev/icons/music+player/noun_play+button_895200.png';
    const pauseIcon = 'https://s3.amazonaws.com/playlist-dev/icons/music+player/noun_pause+button_895204.png';

    const currentIcon = playStatus ? pauseIcon : playIcon;

    const shuffleClass = shuffleStatus ? 'control-button shuffle green' : 'control-button shuffle';
    let repeatClass;
    if(!repeatAllStatus && !repeatSongStatus) {
      repeatClass = 'control-button repeat';
    } else if(repeatAllStatus && !repeatSongStatus) {
      repeatClass = 'control-button repeat green';
    } else if(!repeatAllStatus && repeatSongStatus) {
      repeatClass = 'control-button repeat green repeat-single';
    }

    const queueClass = this.props.showQueue ? 'control-button queue-button green' : 'control-button queue-button';

    const nextClass = this.props.songList.length === 0 && this.props.queue.length === 0 ? 'control-button nextSong disabled' : 'control-button nextSong';
    const prevClass = this.props.songList.length === this.props.originalList.length - 1 || Object.keys(this.props.nowPlaying).length === 0 ? 'control-button previousSong disabled' : 'control-button previousSong';
    const playPauseClass = Object.keys(this.props.nowPlaying).length === 0 ? 'disabled' : '';
    return (
      <div className='now-playing-bar'>
        <footer className='footer-player-bar'>
          <div className='now-playing-bar-left'>
            {this.renderNowPlayingInfo()}
          </div>
          <div className='now-playing-bar-center'>
            <div className='player-controls'>
              <audio id='music-player' onTimeUpdate={this.updateProgressBar} loop={this.props.repeatSongStatus} volume={this.state.muted ? 0 : this.state.volume} src={this.props.nowPlaying.song_url}>
              </audio>
              <button className={shuffleClass} onClick={this.props.toggleShuffle}></button>
              <button className={prevClass} onClick={this.prevSong} disabled={this.props.songList.length === this.props.originalList.length - 1 || Object.keys(this.props.nowPlaying).length === 0}></button>
              <button className={playPauseClass} onClick={this.togglePlayPause} disabled={Object.keys(this.props.nowPlaying).length === 0}>
                <img src={currentIcon}></img>
              </button>
              <button className={nextClass} onClick={this.props.nextSong} disabled={this.props.songList.length === 0 && this.props.queue.length === 0}></button>
              <button className={repeatClass} onClick={this.props.toggleRepeat}></button>
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
              <button id='queue' className={queueClass} onClick={this.redirectQueue}></button>
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

    );
  }

}

const msp = state => {
  const { shuffleStatus, repeatAllStatus, repeatSongStatus, changedSongStatus, originalList, songList, queue, playing, showQueue } = state.ui.queue;
  return {
    nowPlaying: state.ui.queue.nowPlaying,
    savedSongIds: state.session.saved_song_ids,
    saves: Object.values(state.session.saves),
    shuffleStatus,
    repeatAllStatus,
    repeatSongStatus,
    changedSongStatus,
    originalList,
    songList,
    queue,
    playStatus: playing,
    showQueue
  };
};

const mdp = dispatch => {
  return {
    fetchCurrentSong: (songId) => dispatch(fetchCurrentSong(songId)),
    save: (saveId, saveType) => dispatch(save(saveId, saveType)),
    unsave: saveId => dispatch(unsave(saveId)),
    toggleShuffle: () => dispatch(toggleShuffle()),
    toggleRepeat: () => dispatch(toggleRepeat()),
    nextSong: () => dispatch(nextSong()),
    prevSong: () => dispatch(prevSong()),
    finalizeSongChange: () => dispatch(finalizeSongChange()),
    changePlayStatus: (boolean) => dispatch(changePlayStatus(boolean)),
    toggleQueue: (boolean) => dispatch(toggleQueue(boolean))
  };
};


export default withRouter(connect(msp,mdp)(MusicPlayer));
