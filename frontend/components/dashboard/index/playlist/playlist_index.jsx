import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PlaylistItem from './playlist_item';

import { fetchPlaylists } from '../../../../actions/playlist_actions';

class PlaylistIndex extends React.Component {

  componentDidMount(){
    const { searchTerm, playlistIds } = this.props;

    this.props.fetchPlaylists(searchTerm, playlistIds);
  }

  componentDidUpdate(prevProps) {
    if(prevProps.searchTerm != this.props.searchTerm)
      this.props.fetchPlaylists(this.props.searchTerm);
  }

  render() {
    const playlists = this.props.playlists.map((playlist) => {
      return (
        <PlaylistItem key={playlist.id} playlist={playlist} user={playlist.user}/>
      );
    });
    return (
      <div>
        <ul className='playlist-list'>
          {playlists}
        </ul>
      </div>
    );
  }
}

const msp = ({entities}) => {
  const { playlists } = entities;
  return {
    playlists: Object.values(playlists)
  };
};

const mdp = dispatch => {
  return {
    clearEntitiesState: () => dispatch(clearEntitiesState()),
    fetchPlaylists: (searchTerm, playlist_ids) => dispatch(fetchPlaylists(searchTerm, playlist_ids))
  };
};

export default connect(msp,mdp)(PlaylistIndex);
