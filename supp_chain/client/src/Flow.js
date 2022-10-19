import ReactFlow, { Controls, Background } from 'reactflow';
import 'reactflow/dist/style.css';


const nodes = [
    {
      id: '1',
      position: { x: 0, y: 0 },
      data: { label: 'Hello' },
      type: 'input',
    },
    {
      id: '2',
      position: { x: 100, y: 100 },
      data: { label: 'World' },
    },
];

  const edges = [{ id: '1-2', source: '1', target: '2', label: 'to the', type: 'bezier', animated: true }];
  
function Flow() {
    return (
        <div style={{padding: '50px', height:'80%', width:'80%', position:'relative'}}>
        <ReactFlow nodes={nodes} edges={edges}>
            <Background />
            <Controls />
        </ReactFlow>
        </div>
    );
}


export default Flow;