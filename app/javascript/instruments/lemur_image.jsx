import React from 'react'
import { instrumentImages, instrumentCommonNames } from 'instruments/constants'
import { Colors } from "@blueprintjs/core";

import { Image, Container, Row, Col } from 'react-bootstrap';

export const LemurImage = ({ instrumentName }) => {
  const imageName = instrumentImages[instrumentName];
  const imagePath = `img/${imageName}`;
  const commonName = instrumentCommonNames[instrumentName];

  const maxWidth = 1536;
  const maxHeight = 2048;

  const totalWidth  = maxWidth / 2.5;
  const totalHeight = maxHeight / 2.5;

  // 1536 × 2048

  const imageStyle = {
    height: `${totalHeight}px`,
    width: `${totalWidth}px`
  };

  const imageTag = (<Image
    className="justify-content-center"
    src={imagePath}
    alt={commonName}
    style={imageStyle}
    fluid
  />);

  const emptyTag = (
    <div className="justify-content-center" style={{
      ...imageStyle,
      backgroundColor: Colors.LIGHT_GRAY5,
    }}>
    </div>
  );

  return (<div>{imageName ? imageTag : emptyTag}</div>);
}
