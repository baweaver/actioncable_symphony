import React from 'react'
import moment from 'moment';
import { cond, always, is, equals, T } from 'ramda';

const absBetween = (x, y) => (n) => {
  if (!is(Number)) return false;

  const a = Math.abs(n);

  return a >= x && a <= y;
};

const offsetColor = cond([
  [absBetween(0, 0.5),   always('green')],
  [absBetween(0.5, 1.5), always('yellow')],

  // Nothing assigned yet
  [equals('n/a'), always('light grey')],

  [T, always('red')]
])

export class ClockDisplay extends React.Component {
  constructor({ clock }) {
    super();
    this.clock = clock;

    this.state = {
      now:    'n/a',
      offset: 'n/a'
    }

    console.log('Clock up');
  }

  componentDidMount() {
    console.log('Clock mounted');

    setInterval(() => {
      if (!this.clock.active) return;

      this.setState({
        now:    moment(this.clock.now()).format('hh:mm:ss.SSSS'),
        offset: this.clock.currentOffset().toFixed(4)
      });
    }, 1000);
  }

  render() {
    const backgroundColor = offsetColor(this.state.offset);

    console.log(backgroundColor)

    return (
      <table border="1" style={{ backgroundColor }}>
        <thead>
          <tr>
            <td width="75%">Current Time</td>
            <td width="25%">Current Offset</td>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>{this.state.now}</td>
            <td>{this.state.offset} ms</td>
          </tr>
        </tbody>
      </table>
    );
  }
}
