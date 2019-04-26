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

    this.state = {
      clock:              clock,
      isAssigning:        false,
      isAssigned:         false,
      songReady:          false,
      songLoading:        false,
      assignmentsLoading: false,
      assignmentsReady:   false,
      assignments:        {}
    };
  }

  componentDidMount() { }

  handleAssignmentClick = () => {
    this.setState({ assignmentsLoading: false, assignmentsReady: false });
    this.conductorChannel.channel.assignInstruments();
  }

  handleBufferClick = () => {
    this.setState({ songLoading: false, songReady: false });
    this.conductorChannel.channel.bufferMusic();
  };

  handlePlayClick = () => {
    this.setState({ songPlaying: true });
    this.conductorChannel.channel.play();
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

  render() {
    return (<div>
      <h1>Administrator</h1>

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
