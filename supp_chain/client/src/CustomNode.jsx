import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

// sourceStyle to display at the bottom of the node
const sourceStyle = { width: 8, height: 8, borderRadius: 5, top: 100};
const targetStyle = { top: -5,  background: '#555', width: 5, height: 5};

function CustomNode({ id, data}) {

  // splice first 5 and last 4 characters from the data.owner_address
  var shortenedAddress = data.owner_address.slice(0, 5) + '...' + data.owner_address.slice(-4);

  return (
    <>
        <div className="custom-node__header">
        <Handle 
                type="target" 
                position={Position.Top}
                style={targetStyle} 
            />
            <div>Token Id: <strong>{id}</strong></div>
            <div>Token Name: <strong>{data.name}</strong></div>
        </div>
        <Handle 
            type="source" 
            position={Position.Bottom} 
            style={sourceStyle}
            id={id}
        />
        <div className="custom-node__body">
            <div>Owner Address: <strong>{shortenedAddress}</strong></div>
            <div>Description: <strong>{data.description}</strong></div>
            <div>Recycle Status: <strong>{data.recycled}</strong></div>
            <div>Metadata: <strong><a href={data.ipfs_link}>IPFS data</a></strong></div>
        </div>
    
    </>
  );
}

export default memo(CustomNode);