import React from 'react'
import { Connector } from './connector';

export const Connection = ({ requirements, onConnect }) => {
  const connector = new Connector(...requirements);

  function handleClickConnect() {
    if (connector.isConnecting || connector.isConnected) return;

    // const connectPromised = Promise.all([
      // directConductorChannel.connect({ uuid: myUuid }),
      // universalConductorChannel.connect({ uuid: null, universal: true })
    // ]);

    connector.connect(onConnect);
  }

  const connected = connection => connection ?
    (<span style="color: green;">Connected</span>) :
    (<span style="color: gold;">Not Connected</span>);

  const connectButton = () => (
    <button
      className="button is-success"
      onClick={handleClickConnect}
    >
      Connect
    </button>
  );

  return (
    <div>
      <h2>Client: {connected(isConnected)}</h2>

      {isConnected || connectButton}
    </div>
  )
}
