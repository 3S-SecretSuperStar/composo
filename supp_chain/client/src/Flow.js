import { useEffect } from 'react';
import ReactFlow, { ReactFlowProvider, useReactFlow, Controls, Background, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import { nodes, edges } from './Composable_session.js'
import CustomNode from './CustomNode';
import './nodeStyles.css';
  
  const nodeTypes = {
    custom: CustomNode,
  };

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

        //console.log("Persistent Structure: ", get_composable_structure());


        // call setNodes and setEdges with sessionStorage (to handle page reloads)
        if (sessionStorage.getItem('nodes') || sessionStorage.getItem('edges')) {
          ReactFlowInstance.setNodes(JSON.parse(sessionStorage.getItem('nodes')));
          ReactFlowInstance.setEdges(JSON.parse(sessionStorage.getItem('edges')));
        }

        else {
          ReactFlowInstance.setNodes(nodes);
          ReactFlowInstance.setEdges(edges);
        }
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
          backdropFilter: 'blur(20px)'
        }}
        nodeTypes={nodeTypes}
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