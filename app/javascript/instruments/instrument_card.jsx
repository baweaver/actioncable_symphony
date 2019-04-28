import React from 'react'

import { ClockDisplay } from 'timesync/clock_display';

import { instrumentCommonNames } from 'instruments/constants'

import { Colors } from "@blueprintjs/core";

import { LemurImage } from 'instruments/lemur_image';

import { Button, Card, Container, Row, Column } from 'react-bootstrap';

export const InstrumentCard = ({ instrumentName, clock }) => {
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
        </div>

        <ClockDisplay clock={clock} style={{width: '100%'}}/>
      </div>
    </div>
  )
}
