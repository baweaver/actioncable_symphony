import React from 'react'
import moment from 'moment';

import { Colors } from "@blueprintjs/core";

import { cond, always, is, equals, T } from 'ramda';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';

const absBetween = (x, y) => (n) => {
  if (!is(Number)) return false;

  const a = Math.abs(n);

  return a >= x && a <= y;
};

const offsetColor = cond([
  [absBetween(0, 0.5),   always(Colors.GREEN2)],
  [absBetween(0.5, 1.5), always(Colors.GOLD3)],

  // Nothing assigned yet
  [equals('n/a'), always(Colors.GRAY3)],

  [T, always(Colors.RED3)]
])

export class ClockDisplay extends React.Component {
  constructor({ clock }) {
    super();
    this.clock = clock;

    this.state = {
      realClock: 'n/a',
      now:    'n/a',
      offset: 'n/a'
    }
  }

  componentDidMount() {
    console.log('Clock mounted');

    setInterval(() => {
      if (!this.clock.active) return;

      this.setState({
        realClock: moment(Date.now()).format('hh:mm:ss'),
        now:       moment(this.clock.now()).format('hh:mm:ss'),
        offset:    this.clock.currentOffset().toFixed(2)
      });
    }, 1000);
  }

  clockDisplay() {
    return `${this.state.realClock} + ${this.state.offset} ms`
  }

  render() {
    const backgroundColor = offsetColor(this.state.offset);

    return (<div className="display-4 px-3 py-5" style={{
      color: Colors.LIGHT_GRAY5,
      backgroundColor: backgroundColor,
      width: '100%'
    }}>
      <FontAwesomeIcon icon={faClock} /> &nbsp;

      <strong>Clock</strong>: &nbsp;

      {!this.clock.active && 'Awaiting Assignment'}

      {this.clock.active && this.clockDisplay()}
    </div>);
  }
}
