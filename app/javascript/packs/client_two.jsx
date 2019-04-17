import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

import { uuid } from 'util/uuid'

import MidiChannel from 'cables/midi';
import ConductorChannel from 'cables/conductor';

import { InstrumentCard } from 'instruments/instrument_card';
import { Connection } from 'client/connection';

const midiChannel               = new MidiChannel();
const directConductorChannel    = new ConductorChannel(midiChannel);
const universalConductorChannel = new ConductorChannel(midiChannel);

class Client extends React.Component {
  constructor() {
    super();

    this.state = {
      isConnecting:   false,
      isConnected:    false,
      myUuid:         uuid(),
      instrumentName: null
    };

    midiChannel.on('instrument', (instrumentName) => {
      this.setState({ instrumentName });
    });
  }

  componentDidMount() {

  }

  handleConnectClick = () => {
    if (this.state.isConnecting || this.state.isConnected) return;

    this.setState({ isConnecting: true });

    return Promise.all([
      directConductorChannel.connect({ uuid: this.state.myUuid }),
      universalConductorChannel.connect({ uuid: null, universal: true })
    ]).then(() => {
      this.setState({
        isConnecting: false,
        isConnected: true
      });
    })
  }

  render() {
    return (
      <div className="client">
        {!this.state.isConnected && <button onClick={this.handleConnectClick}>
          Connect
        </button>}

        {this.state.isConnected && 'Connected!'}

        <InstrumentCard
          instrumentName={this.state.instrumentName}
          midiChannel={midiChannel}
        />
      </div>
     );
  }
}

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <Client name="React" />,
    document.body.appendChild(document.createElement('div')),
  )
})
