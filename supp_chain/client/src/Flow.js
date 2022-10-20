import { useEffect, Component, useState, useCallback } from 'react';
import ReactFlow, { Controls, Background, MiniMap, applyEdgeChanges, applyNodeChanges } from 'reactflow';
import 'reactflow/dist/style.css';
import { nodes as Nodes, edges as Edges, updateFlow } from './Composable.js'

  const edgeOptions = {
      animated: true,
      style: {
        stroke: 'black',
      },
    };

  const minimapStyle = {
    height: 120,
  };

  const connectionLineStyle = { stroke: 'black' };

  const Flow = () => {
    const [nodes, setNodes] = useState(Nodes);
    const [edges, setEdges] = useState(Edges);
  
    useEffect(() => {
      const interval = setInterval(() => {
        var res = updateFlow();
        setNodes(res[0]);
        setEdges(res[1]);
      }, 5000);
      return () => clearInterval(interval);
    }, []);
  
    return (
      <ReactFlow
        defaultNodes={nodes}
        defaultEdges={edges}
        defaultEdgeOptions={edgeOptions}
        fitView
        style={{
          backgroundColor: '#D3D2E5',
        }}
        connectionLineStyle={connectionLineStyle}
      >
        <MiniMap style={minimapStyle} />
        <Controls />
        <Background color="#aaa" gap={16} />
    </ReactFlow>
    );

  };

  export default Flow;