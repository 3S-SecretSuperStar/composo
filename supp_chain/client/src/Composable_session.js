import gateways from './cacher/gateways.json';
import $ from 'jquery';
import { NFTStorage } from "nft.storage";

//composable dict structure
// var composable = {
//     [owner_addr]: {
//         [tokenID]: {
//                "metadata": ipns_link, 
//                "parents": [(parent_addr, parent_token)], 
//                "children": [(child_addr, child_token, num_of_child_tokens)])]   
//          }
//     }
// };

// *** how to show minted tokens on Metamask account? ***

// owner can be either an eth address or a contract address:
// 1. the owner of the token - an ethereum account address
// 2. the owner of the token - an ERC-998 token


// token onwership states:
// 1. minted, and no child and parent is an eth account 
    // root token: 
        // generate + save token ipfs in dict
// 2. minted, and transferred as a child to another token 
    // child token: 
        // generate + save child ipfs with corr. parent addr and token
        // generate new parent ipfs with corr. child addr and token
        // update parent ipfs in dict


export var composable = {};

export var parent_update = 0;
export var child_update = 0;
export var parent2_update = 0;

export function parent_to_update() {
    parent_update = 1;
}

export function child_to_update() {
    child_update = 1;
}

export function parent2_to_update() {
    parent2_update = 1;
}

export function null_parent() {
    parent_update = 0;
}

export function null_child() {
    child_update = 0;
}

export function null_parent2() {
    parent2_update = 0;
}

export var parentContractAddr = 0
export var parentContractAddr2 = 0
export var childContractAddr = 0
export var numTokens = 0

export function setParentContractAddr(addr) {
    parentContractAddr = addr;
}

export function setParentContractAddr2(addr) {
    parentContractAddr2 = addr; 
}

export function setChildContractAddr(addr) {
    childContractAddr = addr;
}

export function setNumTokens(num) {
    numTokens = num;
}

export function get_composable_structure() {
    return composable;
}

export function get_composable_session() {
    return JSON.parse(sessionStorage.getItem('composable'));
}

export function set_composable_session() {
    // if session storage is empty, set it to the new composable
    // else merge the new composable with the old one

    if (sessionStorage.getItem('composable') == null) {
        sessionStorage.setItem('composable', JSON.stringify(composable));
    }

    // else merge the new composable with the old one, but if a token is already in the old composable, update it with the new one and don't add it again
    else {
        var old_composable = JSON.parse(sessionStorage.getItem('composable'));
        var new_composable = composable;

        for (var owner_addr in new_composable) {
            if (owner_addr in old_composable) {
                for (var tokenID in new_composable[owner_addr]) {
                    if (tokenID in old_composable[owner_addr]) {
                        old_composable[owner_addr][tokenID] = new_composable[owner_addr][tokenID];
                    }
                    else {
                        old_composable[owner_addr][tokenID] = new_composable[owner_addr][tokenID];
                        // continue;
                    }
                }
            }
            else {
                old_composable[owner_addr] = new_composable[owner_addr];
            }
        }
        sessionStorage.setItem('composable', JSON.stringify(old_composable));
    }
    
}



// ---------------------- IPFS export functions ----------------------

export function get_ipfs_link(acc, tokenID) {
    return JSON.parse(sessionStorage.getItem('composable'))[acc][tokenID]["metadata"];
}



export async function get_token_metadata(acc, tokenID) {
    var url = get_ipfs_link(acc, tokenID);

    // caching of data set to true
    try {
        var metadata = await $.ajax({
            url: url,
            dataType: 'json',
            timeout: 120000,  //120 second timeout
            cache: true
        });
    } catch (error) {
        console.log("Failed to fetch metdata from IPFS, Error ", error);
    }

    return metadata;
} 


// update ipfs link of token
export function update_ipfs(owner_addr, tokenID, ipfs_link) {

    // using nft.storage ipfs subdomain since we're using it's API for faster data retreival
    if (!composable[owner_addr]) composable[owner_addr] = {};
    console.log("Composable owner addr: ", composable[owner_addr]);
    if (!composable[owner_addr][tokenID]) composable[owner_addr][tokenID] = {};
    console.log("Composable owner addr and token ID: ", composable[owner_addr][tokenID]);
    if (!composable[owner_addr][tokenID]["metadata"]) composable[owner_addr][tokenID]["metadata"] = {};
    console.log("Composable owner addr and token ID and metadata: ", composable[owner_addr][tokenID]["metadata"]);
    composable[owner_addr][tokenID]["metadata"] = ipfs_link;
    console.log("Composable owner addr and token ID and metadata after updating: ", composable[owner_addr][tokenID]["metadata"]);

    console.log("generated/updated token's ipfs.");

    set_composable_session();

    
}


// update parent ipfs link to include child token
// update ipfs dictionary mapping
export async function add_parent_ipfs(parentAcc, parentTokenID, childAcc, childTokenID, childTokens) {

    console.log("updating parent token's ipfs data...");
    
    
    var metadata = await get_token_metadata(parentAcc, parentTokenID);

    // update metadata to include child token
    metadata["properties"]["child_tokens"].push({"contract_address": childAcc, "token_id": childTokenID, "num_tokens": childTokens});

    console.log ("generating updated parent token's ipfs...");
    var url = await updateNFT(metadata);

    console.log ("updated parent ipfs.");

    update_ipfs(parentAcc, parentTokenID, url);

    
}


export async function remove_parent_ipfs(parentAcc, parentTokenID, childAcc, childTokenID) {

    console.log("updating parent token's ipfs data...");
    
    var metadata = await get_token_metadata(parentAcc, parentTokenID);

    // update metadata to remove child token
    var child_tokens = metadata["properties"]["child_tokens"];
    var index = child_tokens.findIndex(x => x.contract_address === childAcc && x.token_id === childTokenID);
    child_tokens.splice(index, 1);
    

    console.log ("generating updated parent token's ipfs...");
    var url = await updateNFT(metadata);
    console.log ("updated parent ipfs.");

    update_ipfs(parentAcc, parentTokenID, url);

    
}


// update child ipfs link to remove parent token 2
// update child ipfs link to include parent token 2, and save owner address as owner address of parent token 2
export async function update_child_ipfs_transfer(parentAcc, parentTokenID, parentAcc2, parentTokenID2, childAcc, childTokenID) {
    console.log("updating child token's ipfs data...");
    var metadata = await get_token_metadata(childAcc, childTokenID);

    // update metadata to remove parent token 1
    try {
        metadata["properties"]["parent_tokens"].splice({"contract_address": parentAcc, "token_id": parentTokenID}, 1);
    } catch (error) {
        console.error("Error in trying to remove parentTokenID1 from child token ipfs metadata.");
    }

    // update metadata to include parent token 2
    metadata["properties"]["parent_tokens"].push({"contract_address": parentAcc2, "token_id": parentTokenID2});
    metadata["owner_address"] = parentAcc2;

    console.log ("generating updated child token's ipfs...");
    var url = await updateNFT(metadata);
    console.log ("updated child ipfs.");

    update_ipfs(childAcc, childTokenID, url);

    
}



// ---------------------- MAPPING export functions ----------------------

// update parents of a token
export function add_parent_mapping(owner_addr, tokenID, parent_addr, parent_tokenID) {
    if (!composable[owner_addr]) composable[owner_addr] = {};
    if (!composable[owner_addr][tokenID]) composable[owner_addr][tokenID] = {};
    if (!composable[owner_addr][tokenID]["parents"]) composable[owner_addr][tokenID]["parents"] = [];
    composable[owner_addr][tokenID]["parents"].push([parent_addr, parent_tokenID]);

    console.log("updated token's parents.");

    set_composable_session();

    
}

export async function replace_owner(owner_addr, new_owner_addr, tokenID){
    if(!composable[new_owner_addr]) composable[new_owner_addr] = {};
    if(!composable[new_owner_addr][tokenID]) composable[new_owner_addr][tokenID] = composable[owner_addr][tokenID];


    console.log("updating token owner....");
    var metadata = await get_token_metadata(owner_addr, tokenID);
    delete composable[owner_addr][tokenID];

    metadata["owner_address"] = new_owner_addr;
    
    console.log ("generating updated  token's ipfs...");
    var url = await updateNFT(metadata);
    console.log ("updated owner ipfs", url);

    update_ipfs(new_owner_addr, tokenID, url);

    return true;

}

export function remove_parent_mapping(owner_addr, tokenID, parent_addr, parent_tokenID) {
    
    try {
        var index = composable[owner_addr][tokenID]["parents"].findIndex(x => x[0] === parent_addr && x[1] === parent_tokenID);

        if (index > -1) {
            composable[owner_addr][tokenID]["parents"].splice(index, 1);
            console.log("removed token's parents.");
        }
    } catch {}
    
    set_composable_session();
    console.log("Presistent structure's parents after removing parent: ", sessionStorage.getItem('composable'));

    
}

// update children of a token
export function add_children_mapping(owner_addr, tokenID, child_addr, child_tokenID, child_tokens) {
    if (!composable[owner_addr]) composable[owner_addr] = {};
    if (!composable[owner_addr][tokenID]) composable[owner_addr][tokenID] = {};
    if (!composable[owner_addr][tokenID]["children"]) composable[owner_addr][tokenID]["children"] = [];
    composable[owner_addr][tokenID]["children"].push([child_addr, child_tokenID, child_tokens]);

    console.log("updated token's children.");

    set_composable_session();

    
}

export function remove_children_mapping(owner_addr, tokenID, child_addr, child_tokenID) {
    
    try {
        var index = composable[owner_addr][tokenID]["children"].findIndex(x => x[0] === child_addr && x[1] === child_tokenID);

        if (index > -1) {
            composable[owner_addr][tokenID]["children"].splice(index, 1);
            console.log("removed token's children.");
        }

    } catch {}



    set_composable_session();
    console.log("Presistent structure's children after removing children: ", sessionStorage.getItem('composable'));
    
}


// ---------------------- UPDATION export functions ----------------------


// update parent ipfs and dictionary mapping 
// 1+ child tokens -- add/update mapping
// 0 child tokens -- remove mapping
export async function update_parent(parentAcc, parentTokenID, childAcc, childTokenID, childTokens) {
        

    parent_to_update();
    if (childTokens) {
        await add_parent_ipfs(parentAcc, parentTokenID, childAcc, childTokenID, childTokens);
        add_children_mapping(parentAcc, parentTokenID, childAcc, childTokenID, childTokens);
    }

    else {
        await remove_parent_ipfs(parentAcc, parentTokenID, childAcc, childTokenID);
        remove_children_mapping(parentAcc, parentTokenID, childAcc, childTokenID);
    }

    set_composable_session();

    return true;
}

// update child ipfs and dictionary mapping
export async function update_transferred_child(parentAcc, parentTokenID, parentAcc2, parentTokenID2, childAcc, childTokenID) {
    
    child_to_update();

    await update_child_ipfs_transfer(parentAcc, parentTokenID, parentAcc2, parentTokenID2, childAcc, childTokenID);
    remove_parent_mapping(childAcc, childTokenID, parentAcc, parentTokenID);
    add_parent_mapping(childAcc, childTokenID, parentAcc2, parentTokenID2);

    set_composable_session();

    return true;
}


export async function updateNFT(metadata) {
    const nftStorage = new NFTStorage({token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGNEYTZDMTE0QzkwMUY1RmEyNEYwOTc0ZWM4ZGJlY0I0YzdEQkUxZjciLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2MzU5Mjk5MTUwNywibmFtZSI6InRlc3QifQ._LYiNUkFKxwYCFzO06X6zGAxDrTz6EKp25JvA5J1IE0'});
    var blob = new Blob();
        try {
            
            // Upload NFT to IPFS & Filecoin
            const updated_metadata = await nftStorage.store({
                token_id: metadata["token_id"],
                owner_address: metadata["owner_address"],
                name: metadata["name"], 
                description: metadata["description"],
                image: blob,
                properties: {
                    ownership_stage: metadata["properties"]["ownership_stage"],
                    recycled: metadata["properties"]["recycled"],
                    parent_tokens: metadata["properties"]["parent_tokens"],
                    child_tokens: metadata["properties"]["child_tokens"],
                }
            });

            var url = await cache_cid(updated_metadata.url.replace("ipfs://", ""));

            return url;

        } catch (error) {
            console.error(error);
        }
}


// ---------------------- CACHING OPTIMIZATION export functions ----------------------

// inspired by: https://natoboram.gitlab.io/public-gateway-cacher/

// cache a specific IPFS hash to a bunch of public gateways, for faster file retrieval
export async function cache_cid(cid) {

    let res = "";
    let l = cid.replace("/metadata.json", "");
 

    console.log("Attempting to cache CID on some public gatways...");
    // loop through gateways
    for (var i = 0; i < gateways.length ; i++) {
        
        //console.log("Trying to cache link: ", gateways[i] + "ipfs/"+ cid);
        res = fetch(
            "https://" + l + ".ipfs.nftstorage.link/metadata.json", {
            method: "GET",
            headers: {
            "Content-Type": "text/plain",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "en-US,en;q=0.5"
            },
        }).then((response) => {
            if (response.status === 200) {
                //console.log("Successfully cached CID on gateway: ", response.url);
                //console.log('response.status: ', response.status); 
                return response.url;
            }
        });
    }
    return res;


}


// --------------------------- REACT FLOW RENDERING FUNCTIONS ---------------------------------------------

export var nodes = [];
export var edges = [];


export async function getNodes() {
    var render_queue = []
    nodes = [];
    var node = {};
    var composable = get_composable_session();
    console.log("composable Session: ", composable)
    

    var down_push = 0;
    for (var contractAddress in composable) {
        var right_push = 0;
        for (var tokenID in composable[contractAddress]) {
            var pos_set = false;
            node = {};

            if (composable[contractAddress][tokenID]["children"] !== undefined) {
                if (composable[contractAddress][tokenID]["children"].length >= 0) {
                    node.position = {x: 25 + (275 * right_push) + (275 * down_push), y: 25};
                    console.log("parent pos set for: ", tokenID);
                    pos_set = true;
                }
            }

            if (composable[contractAddress][tokenID]["parents"] !== undefined) {
                if (composable[contractAddress][tokenID]["parents"].length > 0) {
                    // get position of parent node and set position of child node to be below parent node          
                    var parentTokenID = composable[contractAddress][tokenID]["parents"][0][1];
                    var parent_node = nodes.find(x => x.id === parentTokenID);
                    console.log("parent node: ", parent_node);

                    // *** parent node might not be rendered before child node        
    
                    if (parent_node !== undefined) {
                        var child_index = parent_node.data.child_tokens.findIndex(x => x["token_id"] === tokenID);
                        node.position = {x: parent_node.position.x + (225 * (child_index-1)), y: parent_node.position.y + 225};
                        console.log("child pos set for: ", tokenID);
                        pos_set = true;
                    }

                    else {
                        // add to a render queue and render after parent node is rendered
                        render_queue.push([contractAddress, tokenID]);
                        continue;
                    }
                }
            }

            if (!pos_set) {
                console.log("pos not set for: ", tokenID);
                node.position = {x: 25 + (275 * right_push) + (300 * down_push), y: 25};
            }

            var metadata = await get_token_metadata(contractAddress, tokenID);
            console.log("Nodes metadata: ", metadata);
            var link = get_ipfs_link(contractAddress, tokenID);

            node.id = tokenID;
            node.type = "custom";
            node.data = { label: tokenID,  name: metadata.name, ipfs_link: link, description: metadata.description,  owner_address: metadata.owner_address, recycled: metadata.properties.recycled, ownership_stage: metadata.properties.ownership_stage, position: node.position, parent_tokens: metadata.properties.parent_tokens, child_tokens: metadata.properties.child_tokens};
            nodes.push(node);
            right_push++;
        } 
        down_push++;
    }

    // render nodes in render queue
    for (var i = 0; i < render_queue.length; i++) {
        var contractAddress = render_queue[i][0];
        var tokenID = render_queue[i][1];
        node = {};

        var parentTokenID = composable[contractAddress][tokenID]["parents"][0][1];
        var parent_node = nodes.find(x => x.id === parentTokenID);
        console.log("parent node: ", parent_node);

        var child_index = parent_node.data.child_tokens.findIndex(x => x["token_id"] === tokenID);
        node.position = {x: parent_node.position.x + (225 * (child_index-1)), y: parent_node.position.y + 225};
        console.log("child queue pos set for: ", tokenID);

        var metadata = await get_token_metadata(contractAddress, tokenID);
        var link = get_ipfs_link(contractAddress, tokenID);

        node.id = tokenID;
        node.type = "custom";
        node.data = { label: tokenID,  name: metadata.name, ipfs_link: link, description: metadata.description,  owner_address: metadata.owner_address, recycled: metadata.properties.recycled, ownership_stage: metadata.properties.ownership_stage, position: node.position, parent_tokens: metadata.properties.parent_tokens, child_tokens: metadata.properties.child_tokens};
        nodes.push(node);

    }

    console.log("Nodes: ", nodes);

    window.sessionStorage.nodes = JSON.stringify(nodes);

    return nodes;

}

// get children of each tokenID from composable and add to edges
export function getEdges() {
    edges = [];
    var edge = {};
    var composable = get_composable_session();
    for (var contract_address in composable) {
        for (var token in composable[contract_address]) {
            for (var child_data in composable[contract_address][token]["children"]) {
                edge = {};
                edge.id = token + "-" + composable[contract_address][token]["children"][child_data][1];
                //console.log("Edge ID added: ", edge.id);
                edge.source = token;
                edge.target = composable[contract_address][token]["children"][child_data][1];
                edge.label = "owns";
                edge.type = "default";
                edge.sourceHandle = token;
                edge.labelShowBG = false;
                edge.animated = true;
                edges.push(edge);
            }
        }
    }

    console.log("Edges: ", edges);

    window.sessionStorage.edges = JSON.stringify(edges);


    return edges;
}


export function updateFlow() {
    getNodes();
    getEdges();
    return [nodes, edges];
}

// -------------------------------------------------------------------------------