import { useEffect, Component, useState, useCallback } from 'react';
import ReactFlow, { ReactFlowProvider, useReactFlow, ReactFlowProps, Controls, Background, MiniMap, applyEdgeChanges, applyNodeChanges } from 'reactflow';
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
    const [nodes, set_Nodes] = useState(Nodes);
    const [edges, set_Edges] = useState(Edges);

    const ReactFlowInstance = useReactFlow();
  
    useEffect(() => {
      console.log(ReactFlowInstance);
      const interval = setInterval(() => {
        var res = updateFlow();
        set_Nodes(res[0]);
        ReactFlowInstance.setNodes(res[0]);
        ReactFlowInstance.setEdges(res[1]);
        set_Edges(res[1]);
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