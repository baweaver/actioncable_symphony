import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

import { uuid } from 'util/uuid';

import PlayerChannel from 'cables/player_channel';

import { InstrumentCard } from 'instruments/instrument_card';

import { Clock } from 'timesync/clock';

import { Colors } from "@blueprintjs/core";

import { Button, Card, Container, Row, Column } from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faPlug, faSpinner, faWifi } from '@fortawesome/free-solid-svg-icons';

const myUuid = uuid();

const clock = new Clock({
  onChange(offset) {
    this.offset = offset;
  }
});

class Client extends React.Component {
  constructor() {
    super();

    this.playerChannel    = new PlayerChannel({
      uuid:         myUuid,
      clock:        clock,
      onInstrument: instrumentName => this.setState({ instrumentName })
    });

    this.playerChannel.on('firstNote', ({ time }) => {
      this.setState({ firstNoteTime: time * 1000 });
    });

    this.playerChannel.on('songStart', time => {
      this.setState({ beginTime: time });
    });

    this.state = {
      isConnecting:   false,
      isConnected:    false,
      myUuid:         myUuid,
      instrumentName: null,
      clock:          clock,
      firstNoteTime:  null,
      beginTime:      null
    };
  }

  componentDidMount() {

  }

  handleConnectClick = () => {
    if (this.state.isConnecting || this.state.isConnected) return;

    this.setState({ isConnecting: true });

    return this.playerChannel.connect().then(() => {
      this.setState({
        isConnecting: false,
        isConnected: true
      });
    });
  }

  subscriptionStatus() {
    if (this.state.isConnecting) return 'warning';
    if (this.state.isConnected)  return 'success';

    return 'danger';
  }

  render() {
    return (
      <Container style={{
        maxWidth:  '100%',
        minHeight: '100%',
        height:    '100%',
      }}>
        <Row className="bg-primary text-light" style={{
          borderBottom: `5px solid ${Colors.COBALT1}`
        }}>
          <h1 className="display-4 mx-auto my-5">
            ActionCable Symphony Client
          </h1>
        </Row>

        <Row>
          {!this.state.isConnected && !this.state.isConnecting &&
            <Button onClick={this.handleConnectClick}
              variant="primary"
              size="lg"
              block
              style={{
                fontSize: '2.5em'
              }}
            >
              <FontAwesomeIcon icon={faPlug} /> Connect
            </Button>
          }

          {this.state.isConnecting &&
            <Button
              variant="warning"
              disabled="disabled"
              block
              style={{
                fontSize: '2.5em'
              }}
            >
              <FontAwesomeIcon icon={faSpinner} spin /> Connecting
            </Button>
          }

          {this.state.isConnected &&
            <Button
              variant="success"
              disabled="disabled"
              icon="feed-subscribed"
              block
              style={{
                fontSize: '2.5em'
              }}
            >
              <FontAwesomeIcon icon={faWifi} /> Connected
            </Button>
          }
        </Row>

        <Row style={{
          height: '60%'
        }}>
          <InstrumentCard
            instrumentName={this.state.instrumentName}
            clock={clock}
            firstNoteTime={this.state.firstNoteTime}
            beginTime={this.state.beginTime}
          />
        </Row>
      </Container>
     );
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const targetElement = document.createElement('div');

  // There are words for this....
  targetElement.style.cssText = `
    min-height: 100vh;
    height: 100vh;
    width: 100vw;
  `;

  ReactDOM.render(
    <Client name="React" />,
    document.body.appendChild(targetElement),
  )
})
