import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

// sourceStyle to display at the bottom of the node
const sourceStyle = { width: 8, height: 8, borderRadius: 5, top: 90};
const targetStyle = { top: -5,  background: '#555', width: 5, height: 5};

function CustomNode({ id, data}) {

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
            <div>Ownership Stage: <strong>{data.ownership_stage}</strong></div>
            <div>Description: <strong>{data.description}</strong></div>
            <div>Recycled: <strong>{data.recycled}</strong></div>
            <div>Metadata: <strong><a href={data.ipfs_link}>IPFS data</a></strong></div>
        </div>
    
    </>
  );
}

export default memo(CustomNode);