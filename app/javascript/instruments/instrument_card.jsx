import React from 'react'
import { instrumentCommonNames } from 'instruments/constants'

import { LemurImage } from 'instruments/lemur_image';

export const InstrumentCard = ({ instrumentName }) => {
  const commonName = instrumentCommonNames[instrumentName];

  return (
    <div className="instrument-card">
      <h3>Instrument: {commonName || 'Unassigned'}</h3>

      <LemurImage instrumentName={instrumentName} />
    </div>
  )
}
