import React from 'react';
import { StyleSheet } from 'react-native';
import axios from 'axios';
import { Button, Content, List, ListItem, Left, Body, Right, Text } from 'native-base';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { Audio, Permissions, FileSystem } from 'expo';

class SongsScreen extends React.Component {
  constructor() {
    super();

    this.state = {
      statusSong: {},
    };

    this.updateStatusSong = this.updateStatusSong.bind(this);
    this._play = this._play.bind(this);
    this._stop = this._stop.bind(this);
    this._pauseOrResume = this._pauseOrResume.bind(this);
    this._askPermission = this._askPermission.bind(this);
  }

  componentDidMount() {
    this._askPermission();

    axios
      .get('http://localhost:3000/songs')
      .then(({ data }) => {
        this.setState({
          songs: data
        });
      })
      .catch(err => {
        console.log('err:', err);
      });
  }

  _askPermission = async () => {
    const permission = await Permissions.askAsync(Permissions.AUDIO_RECORDING);

    this.setState({
      havePermission: permission.status === 'granted'
    });
  };

  updateStatusSong = async () => {
    let { statusSong, currentSound } = this.state;

    statusSong = await currentSound.getStatusAsync();

    this.setState({
      statusSong
    });
  };

  _stop = async () => {
    const { currentSound } = this.state;

    await currentSound.stopAsync();
    this.updateStatusSong();

    this.setState({
      id: ''
    });
  };

  _play = async (uri, id) => {
    const { idCurrentSong, currentSound } = this.state;

    // to avoid play multiple songs
    if (idCurrentSong !== id && currentSound) {
      this._stop();
    }

    const songPlayed = new Audio.Sound();

    try {
      await songPlayed.loadAsync({ uri });
      await songPlayed.playAsync();

      this.setState({
        currentSound: songPlayed,
        idCurrentSong: id
      });

      this.updateStatusSong();
    } catch (error) {
      // An error occurred!
    }
  };

  _pauseOrResume() {
    const { statusSong, currentSound } = this.state;

    if (statusSong.isPlaying) {
      currentSound.pauseAsync();
    } else {
      currentSound.playAsync();
    }

    this.updateStatusSong();
  }

  render() {
    const { songs, statusSong, idCurrentSong } = this.state;
    const { isPlaying } = statusSong;

    return (
      <Content style={styles.container}>
        {songs && songs.length ? (
          <List>
            {songs.map(({ artist, title, uri, id }, i) => (
              <ListItem thumbnail key={i}>
                <Left>
                  <MaterialIcons name="album" size={40} />
                </Left>
                <Body>
                  <Text>{title}</Text>
                  <Text>{artist}</Text>
                </Body>
                <Right style={{ flexDirection: 'row' }}>
                  <FontAwesome
                    name={isPlaying && idCurrentSong === id ? 'stop-circle' : 'play-circle'}
                    size={30}
                    onPress={() =>
                      isPlaying && idCurrentSong === id ? this._stop() : this._play(uri, id)
                    }
                    style={{ marginHorizontal: 10 }}
                  />
                  <FontAwesome
                    name={isPlaying && idCurrentSong === id ? 'pause' : 'play'}
                    size={30}
                    onPress={() => this._pauseOrResume()}
                  />
                </Right>
              </ListItem>
            ))}
          </List>
        ) : (
          <Text style={{ alignSelf: 'center', fontSize: 20, flex: 1 }}>No songs recorded yet</Text>
        )}
      </Content>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    backgroundColor: '#fff'
  }
});

export default SongsScreen;
