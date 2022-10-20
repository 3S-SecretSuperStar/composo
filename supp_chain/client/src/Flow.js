import { useEffect, useState} from 'react';
import ReactFlow, { ReactFlowProvider, useReactFlow, Controls, Background, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import { nodes, edges, updateFlow } from './Composable.js'

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



/*
  NodeChange:

    type NodeRemoveChange = {
    id: string;
    type: 'remove';
    };

    type NodeAddChange<NodeData = any> = {
      item: Node<NodeData>;
      type: 'add';
    };

    type NodeResetChange<NodeData = any> = {
      item: Node<NodeData>;
      type: 'reset';
    };


  EdgeChange:

    type EdgeSelectionChange = NodeSelectionChange;
    type EdgeRemoveChange = NodeRemoveChange;
    type EdgeAddChange<EdgeData = any> = {
      item: Edge<EdgeData>;
      type: 'add';
    };
    type EdgeResetChange<EdgeData = any> = {
      item: Edge<EdgeData>;
      type: 'reset';
    };
    type EdgeChange = EdgeSelectionChange | EdgeRemoveChange | EdgeAddChange | EdgeResetChange;


  onNodesChange​:

    Description:
    Called on drag, select and remove - handler for adding interactivity for a controlled flow
    Type:
    (nodeChanges: NodeChange[]) => void
    Default:
    undefined
    onEdgesChange​

  onEdgesChange: 
    Description:
    Called on select and remove - handler for adding interactivity for a controlled flow
    Type:
    (edgeChanges: EdgeChange[]) => void
    Default:
    undefined
*/