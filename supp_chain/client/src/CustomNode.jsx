import React, { memo } from 'react';
import { Handle, useReactFlow, useStoreApi } from 'reactflow';

const options = [
  {
    value: 'smoothstep',
    label: 'Smoothstep',
  },
  {
    value: 'step',
    label: 'Step',
  },
  {
    value: 'default',
    label: 'Bezier (default)',
  },
  {
    value: 'straight',
    label: 'Straight',
  },
];

function Select({ value, handleId, nodeId }) {
  const { setNodes } = useReactFlow();
  const store = useStoreApi();

  const onChange = (evt) => {
    const { nodeInternals } = store.getState();
    setNodes(
      Array.from(nodeInternals.values()).map((node) => {
        if (node.id === nodeId) {
          node.data = {
            ...node.data,
            selects: {
              ...node.data.selects,
              [handleId]: evt.target.value,
            },
          };
        }

        return node;
      })
    );
  };

}

function CustomNode({ id, data }) {
  return (
    <>
        <div className="custom-node__header">
            This is a <strong>custom node</strong>
        </div>
        <div className="custom-node__body">
            WooooHOOOOOO
        </div>
    
    </>
  );
}

export default memo(CustomNode);