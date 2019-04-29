import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

import MidiChannel from 'cables/midi_channel';
import DashboardPlayerChannel from 'cables/dashboard_player_channel';
import ConductorChannel from 'cables/conductor_channel';

import { uuid } from 'util/uuid'

import { Clock } from 'timesync/clock';

import { Icon, Colors } from "@blueprintjs/core";

import { Button, Card, Container, Row, Col, Table } from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
  faCheck, faCross, faSpinner, faTable, faQuestionCircle, faWifi
} from '@fortawesome/free-solid-svg-icons';

import {
  countBy, values, compose, isEmpty, identity, mean, prop, max, min
} from 'ramda';

const clock = new Clock({
  onChange(offset) {
    this.offset = offset;
  }
});

class Dashboard extends React.Component {
  constructor() {
    super();

    this.conductorChannel = new ConductorChannel();

    this.conductorChannel.on('assignment', assignments => {
      this.setState({
        assignmentsLoading: false,
        assignmentsReady:   true,
        assignments:        assignments,
        isPlaying:          false,
        isStopped:          false,
        songLoading:        false,
        songReady:          false
      });
    });

    this.conductorChannel.on('counts', count => this.setState({ clientsConnected: count }));

    this.conductorChannel.on('meta', (meta) => {
      const latencyCounts = meta.map(m => m.latency);

      this.setState({
        clientMeta:    meta,
        clientsMaxLag: Math.max(...latencyCounts).toFixed(2),
        clientsMinLag: Math.min(...latencyCounts).toFixed(2),
        clientsAvgLag: mean(latencyCounts).toFixed(2),
        clientsReady:  countBy(prop('ready'), meta).true || 0
      });
    });

    this.conductorChannel.connect();

    this.playerChannel = new DashboardPlayerChannel({
      uuid: uuid(),
      clock: clock,
    });

    this.playerChannel.on('startSongBroadcast', () => {
      this.setState({ songLoading: true, songReady: false });
    });

    this.playerChannel.on('stopSongBroadcast', () => {
      this.setState({ songLoading: false, songReady: true });
    });

    this.playerChannel.on('play', () => this.setState({
      isPlaying: true,
      isStopped: false
    }));

    this.playerChannel.on('stop', () => this.setState({
      isPlaying: false,
      isStopped: true
    }));

    this.playerChannel.connect();

    this.state = {
      clock:              clock,

      songLoading:        false,
      songReady:          false,

      assignmentsLoading: false,
      assignmentsReady:   false,

      assignments:        {},

      clientsConnected:   0,
      clientsAssigned:    0,
      clientsReady:       0,

      clientsMaxLag:      0,
      clientsMinLag:      0,
      clientsAvgLag:      0,

      clientMeta:         [],

      isPlaying:          false,
      isStopped:          false
    };
  }

  componentDidMount() { }

  instrumentCounts() {
    const counts = countBy(identity, values(this.state.assignments));

    return (<Table striped bordered>
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
    </Table>);
  }

  hudClass({ loading, finished, errored }) {
    if (this.state[loading])  return 'bg-warning text-dark';
    if (this.state[finished]) return 'bg-success text-light';
    if (this.state[errored])  return 'bg-danger text-light';

    return 'bg-secondary text-light';
  }

  hudText({ loading, finished, errored, otherwise }) {
    const [loadingState, loadingText]   = loading   || [];
    const [finishedState, finishedText] = finished  || [];
    const [erroredState, erroredText]   = errored   || [];

    if (this.state[loadingState])  return loadingText  || this.loadingText();
    if (this.state[finishedState]) return finishedText || this.okText();
    if (this.state[erroredState])  return erroredText  || this.errorText();

    return otherwise ? otherwise : this.unknownText();
  }

  okText(text = "Ready") {
    return (<span>
      <FontAwesomeIcon icon={faCheck} />&nbsp;{text}
    </span>);
  }

  loadingText(text = "Loading") {
    return (<span>
      <FontAwesomeIcon icon={faSpinner} spin />&nbsp;{text}
    </span>);
  }

  errorText(text = "Errored") {
    return (<span>
      <FontAwesomeIcon icon={faCross} />&nbsp;{text}
    </span>);
  }

  unknownText(text = "N/A") {
    return (<span>
      <FontAwesomeIcon icon={faQuestionCircle} />&nbsp;{text}
    </span>);
  }

  render() {
    return (<div>
      <h1 className="display-2 ml-5 mt-5">
        <FontAwesomeIcon icon={faTable} />&nbsp;Dashboard
      </h1>

      <hr/>

      <Container style={{
        maxWidth: '95%'
      }}>
        <Row>
          <Col>
            <h2>Current Status</h2>
          </Col>
        </Row>

        <Row>
          <Col>
            <Card className={this.hudClass({
              loading:  'assignmentsLoading',
              finished: 'assignmentsReady'
            })}>
              <Card.Body>
                <Card.Title>
                  Instrument Assignments
                </Card.Title>

                <Card.Text className="display-3">
                  {this.hudText({
                    loading:  ['assignmentsLoading'],
                    finished: ['assignmentsReady', this.okText('Assigned')],
                    otherwise: this.unknownText()
                  })}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col>
            <Card className={this.hudClass({
              loading:  'songLoading',
              finished: 'songReady'
            })}>
              <Card.Body>
                <Card.Title>
                  Song Loaded
                </Card.Title>

                <Card.Text className="display-3">
                  {this.hudText({
                    loading:  ['songLoading'],
                    finished: ['songReady']
                  })}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col>
            <Card className={this.hudClass({
              finished: 'isPlaying',
              errored:  'isStopped',
            })}>
              <Card.Body>
                <Card.Title>
                  Song Status
                </Card.Title>

                <Card.Text className="display-3">
                  {this.hudText({
                    finished:  ['isPlaying', 'Playing'],
                    errored:   ['isStopped', 'Stopped'],
                    otherwise: 'Waiting'
                  })}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Spacer Row */}
        <Row>
          <Col>&nbsp;</Col>
        </Row>

        <Row>
          <Col>
            <h2>Client Information</h2>
          </Col>
        </Row>

        <Row>
          <Col>
            <Card className="bg-primary text-light">
              <Card.Body>
                <Card.Title>
                  Clients Connected
                </Card.Title>

                <Card.Text className="display-3">
                  {this.state.clientsConnected}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col>
            <Card>
              <Card.Body className="bg-primary text-light">
                <Card.Title>
                  Clients Assigned
                </Card.Title>

                <Card.Text className="display-3">
                  {Object.keys(this.state.assignments).length}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col>
            <Card>
              <Card.Body className="bg-primary text-light">
                <Card.Title>
                  Clients Ready
                </Card.Title>

                <Card.Text className="display-3">
                  {this.state.clientsReady}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Spacer Row */}
        <Row>
          <Col>&nbsp;</Col>
        </Row>

        <Row>
          <Col>
            <h2>Client Latency</h2>
          </Col>
        </Row>

        <Row>
          <Col>
            <Card>
              <Card.Body className="bg-primary text-light">
                <Card.Title>
                  Client Latency Max
                </Card.Title>

                <Card.Text className="display-3">
                  {this.state.clientsMaxLag}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col>
            <Card>
              <Card.Body className="bg-primary text-light">
                <Card.Title>
                  Client Latency Min
                </Card.Title>

                <Card.Text className="display-3">
                  {this.state.clientsMinLag}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col>
            <Card>
              <Card.Body className="bg-primary text-light">
                <Card.Title>
                  Client Latency Avg
                </Card.Title>

                <Card.Text className="display-3">
                  {this.state.clientsAvgLag}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Spacer Row */}
        <Row>
          <Col>&nbsp;</Col>
        </Row>

        {!isEmpty(this.state.assignments) && <Row>
          <Col>
            <h2>Instrument Distribution</h2>
          </Col>
        </Row>}

        {!isEmpty(this.state.assignments) && <Row>
          <Col>
            {this.instrumentCounts()}
          </Col>
        </Row>}

        {!isEmpty(this.state.assignments) && <Row>
          <Col>&nbsp;</Col>
        </Row>}

        {/* <Row>
          <Col>
            <h2>TODO</h2>
          </Col>
        </Row> */}
      </Container>
    </div>);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <Dashboard name="React" />,
    document.body.appendChild(document.createElement('div')),
  )
})
