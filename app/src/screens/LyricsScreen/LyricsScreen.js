import styles from './LyricsScreen.style';
import React from 'react';
import axios from 'axios';
import { Audio, Permissions, FileSystem } from 'expo';
import { ScrollView } from 'react-native';
import { Form, Item, Input, Text, Label, View, Button } from 'native-base';
import { FontAwesome } from '@expo/vector-icons';

class LyricsScreen extends React.Component {
  constructor() {
    super();

    this.state = {
      artist: 'Lady Gaga',
      title: 'Poker Face',
      statusRecording: {}
    };

    this.updateStatusRecord = this.updateStatusRecord.bind(this);
    this.searchLyrics = this.searchLyrics.bind(this);
    this._askPermission = this._askPermission.bind(this);
    this._startRecord = this._startRecord.bind(this);
    this._stopRecord = this._stopRecord.bind(this);
    this._stopAndSaveRecord = this._stopAndSaveRecord.bind(this);
    this._pauseOrResume = this._pauseOrResume.bind(this);
  }

  componentDidMount() {
    this._askPermission();
  }

  _askPermission = async () => {
    const permission = await Permissions.askAsync(Permissions.AUDIO_RECORDING);

    this.setState({
      havePermission: permission.status === 'granted'
    });
  };

  _startRecord = async () => {
    const recording = new Audio.Recording();

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX
    });

    try {
      await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recording.startAsync();
      const statusRecording = await recording.getStatusAsync();

      // is recording!
      this.setState({
        recording,
        statusRecording
      });
    } catch (error) {
      console.log('error', error);
    }
  };

  updateStatusRecord = async () => {
    let { statusRecording, recording } = this.state;

    statusRecording = await recording.getStatusAsync();

    this.setState({
      statusRecording
    });
  };

  _pauseOrResume = async () => {
    let { recording, statusRecording } = this.state;

    if (statusRecording.isRecording) {
      await recording.pauseAsync();
    } else {
      await recording.startAsync();
    }

    this.updateStatusRecord();
  };

  _stopAndSaveRecord = async () => {
    let { recording, artist, title } = this.state;

    await recording.stopAndUnloadAsync();
    this.updateStatusRecord();

    const soundUri = recording.getURI();

    const arr = soundUri.toString().split('/');
    const filename = arr[arr.length - 1];

    FileSystem.downloadAsync(soundUri, FileSystem.documentDirectory + filename)
      .then(async ({ uri }) => {
        console.log('finished downloading to', uri);

        // save data in db
        axios
          .post('http://localhost:3000/songs', {
            uri,
            artist,
            title
          })
          .then(({ data }) => {
            console.log(data);
          })
          .catch(error => {
            console.log(error);
          });
      })
      .catch(error => {
        console.error(error);
      });
  };

  _stopRecord = async () => {
    const { recording } = this.state;

    await recording.stopAndUnloadAsync();
    this.updateStatusRecord();
  };

  searchLyrics() {
    const { artist, title } = this.state;

    axios
      .get(`https://api.lyrics.ovh/v1/${artist}/${title}`)
      .then(({ data }) => {
        this.setState({
          lyrics: data.lyrics
        });
      })
      .catch(({ err }) => {
        console.log(err);
      });
  }

  render() {
    const { artist, title, lyrics, statusRecording } = this.state;
    const { isRecording, canRecord } = statusRecording;

    return (
      <ScrollView style={styles.container}>
        <Form>
          <Item floatingLabel>
            <Label>Artist</Label>
            <Input
              style={{ height: 40 }}
              onChangeText={artist => this.setState({ artist })}
              value={artist}
            />
          </Item>
          <Item floatingLabel>
            <Label>Title</Label>

            <Input
              style={{ height: 40 }}
              onChangeText={title => this.setState({ title })}
              value={title}
            />
          </Item>
          <View style={{ marginVertical: 20, justifyContent: 'space-around' }}>
            <Button onPress={this.searchLyrics} style={{ alignSelf: 'center', marginVertical: 10 }}>
              <Text>Search</Text>
            </Button>
            {lyrics && !canRecord && (
              <Button
                warning
                onPress={() => this._startRecord()}
                style={{ alignSelf: 'center' }}
              >
                <Text>Start recording !</Text>
              </Button>
            )}
            {canRecord && (
              <View style={styles.wrapperAction}>
                <Button iconLeft danger style={styles.btnAction} onPress={() => this._stopRecord()}>
                  <FontAwesome name="stop-circle" size={30} />
                  <Text>Stop</Text>
                </Button>
                <Button
                  iconLeft
                  success
                  style={styles.btnAction}
                  onPress={() => this._stopAndSaveRecord()}
                >
                  <FontAwesome name="save" size={30} />
                  <Text>Stop & save</Text>
                </Button>
                <Button dark onPress={() => this._pauseOrResume()} style={styles.btnAction}>
                  <FontAwesome name={isRecording ? 'pause' : 'play'} size={30} color="#fff" />
                </Button>
              </View>
            )}
          </View>
        </Form>
        <Text style={styles.lyrics}>{lyrics}</Text>
      </ScrollView>
    );
  }
}

export default LyricsScreen;
