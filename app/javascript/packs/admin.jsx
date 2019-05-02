import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

import MidiChannel from 'cables/midi_channel';
import ConductorChannel from 'cables/conductor_channel';

import { InstrumentCard } from 'instruments/instrument_card';

import { Clock } from 'timesync/clock';

import { Button, Icon, Colors } from "@blueprintjs/core";

import { countBy, values, compose, isEmpty, identity } from 'ramda';

const clock = new Clock({
  onChange(offset) {
    this.offset = offset;
  }
});

class Admin extends React.Component {
  constructor() {
    super();

    this.conductorChannel = new ConductorChannel();

    this.conductorChannel.on('assignment', assignments => {
      this.setState({
        assignmentsLoading: false,
        assignmentsReady:   true,
        assignments:        assignments
      });
    });

    this.conductorChannel.on('counts', count => {
      this.setState({
        clientsConnected: count
      })
    })

    this.conductorChannel.connect();

    this.midiChannel = new MidiChannel({
      instrument: 'all'
    });

    this.midiChannel.on('startSongBroadcast', () => {
      this.setState({ songLoading: true });
    });

    this.midiChannel.on('stopSongBroadcast', () => {
      this.setState({ songLoading: false, songReady: true });
    });

    this.midiChannel.connect();

    this.defaultSongOptions = {
      beethoven_6th_midi: { upTo: 61.5 },
      beethoven_9th_midi: { seek: 107.5, upTo: 167.5 },
      beethoven_9th_midi2: { }
    };

    this.state = {
      clock:              clock,
      isAssigning:        false,
      isAssigned:         false,
      songReady:          false,
      songLoading:        false,
      assignmentsLoading: false,
      assignmentsReady:   false,
      assignments:        {},
      clientsConnected:   0,
      song:               'beethoven_6th_midi'
    };
  }

  componentDidMount() { }

  handleAssignmentClick = () => {
    this.setState({ assignmentsLoading: false, assignmentsReady: false });

    const song = this.state.song;
    this.conductorChannel.channel.assignInstruments({
      song, options: this.defaultSongOptions[song]
    });
  }

  handleBufferClick = () => {
    this.setState({ songLoading: false, songReady: false });

    const song = this.state.song;
    this.conductorChannel.channel.bufferMusic({
      song, options: this.defaultSongOptions[song]
    });
  };

  handlePlayClick = () => {
    this.setState({ songPlaying: true });

    const song = this.state.song;
    this.conductorChannel.channel.play({
      song, options: this.defaultSongOptions[song]
    });
  };

  handleStopClick = () => {
    this.setState({ songPlaying: false });
    this.conductorChannel.channel.stop();
  };

  instrumentCounts() {
    const counts = countBy(identity, values(this.state.assignments));

    return (<table border="1">
      <thead>
        <tr>
          <td>Name</td>
          <td>Counts</td>
        </tr>
      </thead>

      <tbody>
        {Object.keys(counts).map(name => (<tr key={name}>
          <td>{name}</td>
          <td>{counts[name]}</td>
        </tr>))}
      </tbody>
    </table>);
  }

  onSongChange(event) {
    this.setState({
      song: event.target.value
    });
  }

  render() {
    return (<div>
      <h1>Administrator</h1>

      <select className="custom-select"
        onChange={this.onSongChange.bind(this)}
        value={this.state.song}
      >
        <option value="beethoven_6th_midi">
          Beethoven's 6th Symphony
        </option>

        <option value="beethoven_9th_midi">
          Beethoven's 9th Symphony
        </option>

        <option value="beethoven_9th_midi2">
          Beethoven's 9th Symphony (Simple)
        </option>

        <option value="scale">
          Scales
        </option>
      </select>

      <Button onClick={this.handleAssignmentClick}
        intent="primary"
        loading={this.state.assignmentsLoading}
        icon="music"
        large={true}
      >
        Assign Instruments
      </Button>

      <Button onClick={this.handleBufferClick}
        intent="primary"
        loading={this.state.songLoading}
        large={true}
        icon="cloud-download"
        disabled={!this.state.assignmentsReady}
      >
        Buffer
      </Button>

      <Button onClick={this.handlePlayClick}
        intent="success"
        large={true}
        icon="play"
        disabled={!this.state.songReady || this.state.songPlaying}
      >
        Play
      </Button>

      <Button onClick={this.handleStopClick}
        intent="danger"
        large={true}
        icon="stop"
        disabled={!this.state.songPlaying}
      >
        Stop
      </Button>

      <br/>

      <hr/>

      <Button onClick={this.handleStopClick}
        intent="danger"
        large={true}
        icon="stop"
      >
        Emergency Stop
      </Button>

      <Button onClick={this.handlePlayClick}
        intent="success"
        large={true}
        icon="play"
      >
        Emergency Play
      </Button>

      <hr/>

      <strong>Clients Connected</strong>: {this.state.clientsConnected}

      <hr/>

      {!isEmpty(this.state.assignments) && this.instrumentCounts()}
    </div>);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <Admin name="React" />,
    document.body.appendChild(document.createElement('div')),
  )
})
