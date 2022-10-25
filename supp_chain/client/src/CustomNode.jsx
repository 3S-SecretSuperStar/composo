import React, { memo } from 'react';

function CustomNode({ id, data}) {

  return (
    <>
        <div className="custom-node__header">
            Token Id: <strong>{id}</strong>.
            Token Name: <strong>{data.name}</strong>.
        </div>
        <div className="custom-node__body">
            Insert metadata about token.
        </div>
    
    </>
  );
}

export default CustomNode;