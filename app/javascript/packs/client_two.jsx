import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

import { uuid } from 'util/uuid'

import ConductorChannel from 'cables/conductor_channel';
import PlayerChannel from 'cables/player_channel';

import { InstrumentCard } from 'instruments/instrument_card';

import { Clock } from 'timesync/clock';

import { Button, Icon, Navbar, Alignment, Colors } from "@blueprintjs/core";

const myUuid = uuid();

const clock = new Clock({
  onChange(offset) {
    this.offset = offset;
  }
});

class Client extends React.Component {
  constructor() {
    super();

    // this.conductorChannel = new ConductorChannel();
    this.playerChannel    = new PlayerChannel({
      uuid:         myUuid,
      clock:        clock,
      onInstrument: instrumentName => this.setState({ instrumentName })
    });

    this.state = {
      isConnecting:   false,
      isConnected:    false,
      myUuid:         uuid(),
      instrumentName: null,
      clock:          clock
    };
  }

  componentDidMount() {

  }

  handleConnectClick = () => {
    if (this.state.isConnecting || this.state.isConnected) return;

    this.setState({ isConnecting: true });

    return Promise.all([
      // this.conductorChannel.connect(),
      this.playerChannel.connect()
    ]).then(() => {
      this.setState({
        isConnecting: false,
        isConnected: true
      });
    })
  }

  subscriptionStatus() {
    if (this.state.isConnecting) return 'warning';
    if (this.state.isConnected)  return 'success';

    return 'danger';
  }

  render() {
    return (
      <div className="client">
        <h1 className="bp3-heading">
          ActionCable Symphony Client &nbsp;
        </h1>

        <div>
          {!this.state.isConnected &&
            <Button onClick={this.handleConnectClick}
              intent="primary"
              loading={this.state.isConnecting}
              icon="feed"
              large={true}
              fill={true}
            >
              Connect
            </Button>
          }

          {this.state.isConnected &&
            <Button
              intent="success"
              disabled="disabled"
              icon="feed-subscribed"
              large={true}
              fill={true}
            >
              Connected
            </Button>
          }
        </div>

        <InstrumentCard
          instrumentName={this.state.instrumentName}
          clock={clock}
        />

        <div>{this.state.myUuid}</div>
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
