import React, { memo } from 'react';

function CustomNode({ id, data}) {

  return (
    <>
        <div className="custom-node__header">
            <div>Token Id: <strong>{id}</strong></div>
            <div>Token Name: <strong>{data.name}</strong></div>
        </div>
        <div className="custom-node__body">
            <div>Owner Address: <strong>{data.owner_address}</strong></div>
            <div>Ownership Stage: <strong>{data.ownership_stage}</strong></div>
            <div>Description: <strong>{data.description}</strong></div>
            <div>Recycled: <strong>{data.recycled}</strong></div>
            <div>Metadata stored at: <strong><a href={data.ipfs_link}>IPFS data</a></strong></div>
        </div>
    
    </>
  );
}

export default CustomNode;