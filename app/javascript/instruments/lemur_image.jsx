import React from 'react'
import { instrumentImages, instrumentCommonNames } from 'instruments/constants'
import { Colors } from "@blueprintjs/core";

export const LemurImage = ({ instrumentName }) => {
  const imageName = instrumentImages[instrumentName];
  const imagePath = `img/${imageName}`;
  const commonName = instrumentCommonNames[instrumentName];

  const maxWidth = 1536;
  const maxHeight = 2048;

  const totalWidth  = maxWidth / 3;
  const totalHeight = maxHeight / 3;

  // 1536 × 2048

  const imageStyle = {
    height: `${totalHeight}px`,
    width: `${totalWidth}px`
  };

  const imageTag = (<img
    id="current-instrument-image"
    src={imagePath}
    alt={commonName}
    style={imageStyle}
  />);

  const emptyTag = (
    <div style={{
      ...imageStyle,
      fontSize: '10em',
      color: Colors.LIGHT_GRAY3,
    }}>
      <h3>?</h3>
    </div>
  );

  return (<div style={{
  }}>{imageName ? imageTag : emptyTag}</div>);
}
