import { useEffect } from 'react';
import ReactFlow, { ReactFlowProvider, useReactFlow, Controls, Background, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import { nodes, edges } from './Composable.js'

  const edgeOptions = {
      animated: true,
      style: {
        stroke: 'white',
      },
    };

  const minimapStyle = {
    height: 120,
  };

  const connectionLineStyle = { stroke: 'white' };

  const Flow = () => {

  const ReactFlowInstance = useReactFlow();
  
    useEffect(() => {
      const interval = setInterval(() => {
        ReactFlowInstance.setNodes(nodes);
        ReactFlowInstance.setEdges(edges);
        //console.log("Flow structure: ", updateFlow())
      }, 2000);
      return () => clearInterval(interval);
    }, [ReactFlowInstance]);
  
    return (
      <ReactFlow
        defaultNodes={nodes}
        defaultEdges={edges}
        defaultEdgeOptions={edgeOptions}
        fitView
        style={{
          backgroundColor: '#0F2027',
          backdropFilter: 'blur(20px)',
        }}
        connectionLineStyle={connectionLineStyle}
      >
        <MiniMap style={minimapStyle} />
        <Controls />
        <Background color="#aaa"
          gap={16} />
    </ReactFlow>
    );

  };

  function FlowWithProvider(props) {
    return (
      <ReactFlowProvider>
        <Flow {...props} />
      </ReactFlowProvider>
    );
  }
  
  export default FlowWithProvider;