import React from 'react'
import { instrumentImages, instrumentCommonNames } from 'instruments/constants'

export const LemurImage = ({ instrumentName }) => {
  const imageName = instrumentImages[instrumentName];
  const imagePath = `img/${imageName}`;
  const commonName = instrumentCommonNames[instrumentName];

  const imageTag = (<img
    id="current-instrument-image"
    src={imagePath}
    alt={commonName}
    height="25%"
    width="25%"
  />);

  const emptyTag = (
    <div style={{
      height: '512px',
      width: '258px',
      border: '1px solid black'
    }}></div>
  );

  return imageName ? imageTag : emptyTag;
}
