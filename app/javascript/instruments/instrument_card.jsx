import React from 'react'

import { ClockDisplay } from 'timesync/clock_display';

import { instrumentCommonNames } from 'instruments/constants'

import { Colors, Card, Elevation } from "@blueprintjs/core";

import { LemurImage } from 'instruments/lemur_image';

export const InstrumentCard = ({ instrumentName, clock }) => {
  const commonName = instrumentCommonNames[instrumentName];

  return (
    <div style={{
      margin: '15px 0',
      backgroundColor: Colors.LIGHT_GRAY3
    }}>
      <div>
        <LemurImage instrumentName={instrumentName} />
      </div>

      {/* Bottom Bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        width: '100%'
      }}>
        <div style={{
          color: Colors.LIGHT_GRAY5,
          backgroundColor: Colors.GRAY1,
          fontSize: '2.5em',
          padding: '15px'
        }}>
          <strong>Instrument</strong>: {commonName || 'Awaiting Assignment'}
        </div>

        <ClockDisplay clock={clock} />
      </div>
    </div>
  )
}
