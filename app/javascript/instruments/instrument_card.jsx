import React from 'react'

import { ClockDisplay } from 'timesync/clock_display';

import { instrumentCommonNames } from 'instruments/constants'

import { Colors } from "@blueprintjs/core";

import { LemurImage } from 'instruments/lemur_image';

import { Button, Card, Container, Row, Column } from 'react-bootstrap';

class CountdownToPlaying extends React.Component {
  constructor({ clock, firstNoteTime, beginTime }) {
    super();

    this.clock = clock;
    this.state = {
      firstNoteTime,
      beginTime,
      timeRemaining:  beginTime + firstNoteTime,
      alreadyPlaying: false
    };
  }

  startsPlayingAt() {
    return this.state.beginTime + this.state.firstNoteTime;
  }

  timeUntilStart() {
    return this.startsPlayingAt() - this.clock.now();
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      const alreadyPlaying = this.clock.now() >= this.startsPlayingAt();

      this.setState({
        alreadyPlaying,
        timeRemaining: (this.timeUntilStart() / 1000).toFixed(2)
      });

      if (alreadyPlaying) clearInterval(this.interval);
    }, 500);
  }

  render() {
    if (this.state.alreadyPlaying) return (<span></span>);

    return (
      <span> | {this.state.timeRemaining}s until first note</span>
    );
  }
}

export const InstrumentCard = ({ instrumentName, clock, firstNoteTime, beginTime}) => {
  const commonName = instrumentCommonNames[instrumentName];

  return (
    <div style={{ margin: 'auto' }}>
      <LemurImage instrumentName={instrumentName} />

      <div className="fixed-bottom" style={{width: '100%'}}>
        <div className="display-4 py-5 px-3" style={{
          color: Colors.LIGHT_GRAY5,
          backgroundColor: Colors.GRAY1,
          padding: '15px',
          width: '100%'
        }}>
          <strong>Instrument</strong>: {commonName || instrumentName || 'Awaiting Assignment'}

          {beginTime &&
            <CountdownToPlaying
              clock={clock}
              firstNoteTime={firstNoteTime}
              beginTime={beginTime}
            />}
        </div>

        <ClockDisplay clock={clock} style={{width: '100%'}}/>
      </div>
    </div>
  )
}
