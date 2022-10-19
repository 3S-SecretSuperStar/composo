import ReactFlow, { Controls, Background } from 'reactflow';
import 'reactflow/dist/style.css';


const nodes = [
    {
        id: '1',
        position: { x: 0, y: 0 },
    },
];
  
function Flow() {
    return (
        <div style={{padding: '50px', height:'80%', width:'80%', position:'relative'}}>
        <ReactFlow nodes={nodes}>
            <Background />
            <Controls />
        </ReactFlow>
        </div>
    );
}


export default Flow;