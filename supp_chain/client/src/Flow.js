import { useEffect, useState, useCallback } from 'react';
import ReactFlow, { Controls, Background, applyEdgeChanges, applyNodeChanges } from 'reactflow';
import 'reactflow/dist/style.css';
import { get_composable_structure } from './Composable.js'


// const nodes = [
//     {
//       id: '1',
//       position: { x: 0, y: 0 },
//       data: { label: 'Hello' },
//       type: 'input',
//     },
//     {
//       id: '2',
//       position: { x: 100, y: 100 },
//       data: { label: 'World' },
//     },
// ];

// const edges = [{ id: '1-2', source: '1', target: '2', label: 'to the', type: 'default', animated: true }];


function getNodes() {
    var nodes = [];
    var node = {};
    var composable = get_composable_structure();
   
    // get tokenID and contract address of each token, and add tokenID as id and label
    // i and j increments for position shift
    var i = 0;
    for (var contract_address in composable) {
        var j = 0;
        for (var tokenID in composable[contract_address]) {
            node = {};
            node.id = tokenID;
            node.position = {};
            node.position = { x: 100+(i*50), y: 100+(i*50)+(j*50) };
            node.data = {"label": tokenID};
            nodes.push(node);
            j++;
        }
        i++;
    }

    //console.log("Nodes: ", nodes);
    //setTimeout(getNodes, 50000);

    //setTimeout(Flow, 50000);
    return nodes;

}

// get children of each tokenID from composable and add to edges
function getEdges() {
    var edges = [];
    var edge = {};
    var composable = get_composable_structure();
    for (var contract_address in composable) {
        for (var token in composable[contract_address]) {
            for (var child_array in composable[contract_address][token]["children"]) {
                edge = {};
                edge.id = token + "-" + composable[contract_address][token]["children"][child_array][1];
                //console.log("Edge ID added: ", edge.id);
                edge.source = token;
                edge.target = composable[contract_address][token]["children"][child_array][1];
                edge.label = "owns";
                edge.type = "default";
                edge.animated = true;
                edges.push(edge);
            }
        }
    }

    //console.log("Edges: ", edges);
    //setTimeout(getEdges, 50000);
    //setTimeout(Flow, 50000);
    return edges;
}

    const edgeOptions = {
        animated: true,
        style: {
        stroke: 'black',
        },
    };

    const connectionLineStyle = { stroke: 'black' };

    function Flow() {

        return (
            <div style={{padding: '10px', height:'80%', width:'80%'}}>
            <ReactFlow
                defaultNodes={getNodes()}
                defaultEdges={getEdges()}
                defaultEdgeOptions={edgeOptions}
                fitView
                style={{
                    backgroundColor: '#fff',
                }}
                connectionLineStyle={connectionLineStyle}
            />
            </div>
        
        );
    }

export default Flow;

// <div style={{padding: '10px', height:'80%', width:'80%'}}>
// style={{
//     backgroundColor: '#000',
//     }}
