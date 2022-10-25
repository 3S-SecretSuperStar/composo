import React, { memo } from 'react';
import { get_composable_contract, get_token_metadata } from './Composable';

function CustomNode({ id }) {

    var acc = get_composable_contract(id);
    var metadata = get_token_metadata(acc ,id);
    console.log("name: ", metadata.name);

  return (
    <>
        <div className="custom-node__header">
            Token Id: <strong>{id}</strong>.
            Token Name: <strong>{metadata.name}</strong>.
        </div>
        <div className="custom-node__body">
            Insert metadata about token.
        </div>
    
    </>
  );
}

export default memo(CustomNode);