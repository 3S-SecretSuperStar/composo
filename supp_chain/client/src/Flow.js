import { useEffect} from 'react';
import ReactFlow, { ReactFlowProvider, useReactFlow, Controls, Background, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import { nodes, edges } from './Composable.js'

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

    const ReactFlowInstance = useReactFlow();
  
    useEffect(() => {
      console.log(ReactFlowInstance);
      const interval = setInterval(() => {
        ReactFlowInstance.setNodes(nodes);
        ReactFlowInstance.setEdges(edges);
      }, 2000);
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

  function FlowWithProvider(props) {
    return (
      <ReactFlowProvider>
        <Flow {...props} />
      </ReactFlowProvider>
    );
  }
  
  export default FlowWithProvider;