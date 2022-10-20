import gateways from './cacher/gateways.json';
import $ from 'jquery';
import { NFTStorage } from "nft.storage";
const nftStorage = new NFTStorage({token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGNEYTZDMTE0QzkwMUY1RmEyNEYwOTc0ZWM4ZGJlY0I0YzdEQkUxZjciLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2MzU5Mjk5MTUwNywibmFtZSI6InRlc3QifQ._LYiNUkFKxwYCFzO06X6zGAxDrTz6EKp25JvA5J1IE0'});

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

const delay = ms => new Promise(res => setTimeout(res, ms));

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

// ---------------------- IPFS export functions ----------------------

export function get_ipfs_link(acc, tokenID) {
    return composable[acc][tokenID]["metadata"];
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
    var nftstorage_ipfs_link = ipfs_link.replace("ipfs://", "https://nftstorage.link/ipfs/");
    if (!composable[owner_addr]) composable[owner_addr] = {};
    if (!composable[owner_addr][tokenID]) composable[owner_addr][tokenID] = {};
    if (!composable[owner_addr][tokenID]["metadata"]) composable[owner_addr][tokenID]["metadata"] = {};
    composable[owner_addr][tokenID]["metadata"] = nftstorage_ipfs_link;

    console.log("generated/updated token's ipfs.");

}

//given account token id and ipfs, update the ipfs link of the token
export function update_ipfs_link(acc, tokenID, ipfsLink) {
    if (!composable[acc]) composable[acc] = {};
    if (!composable[acc][tokenID]) composable[acc][tokenID] = {};
    if (!composable[acc][tokenID]["metadata"]) composable[acc][tokenID]["metadata"] = {};
    composable[acc][tokenID]["metadata"] = ipfsLink;
}


// update parent ipfs link to include child token
// update ipfs dictionary mapping
export async function add_parent_ipfs(parentAcc, parentTokenID, childAcc, childTokenID, childTokens) {

    console.log("updating parent token's ipfs data...");
    
    
    var metadata = await get_token_metadata(parentAcc, parentTokenID);

    // update metadata to include child token
    metadata["properties"]["child_tokens"].push({"contract_address": childAcc, "token_id": childTokenID, "num_tokens": childTokens});

    console.log ("generating updated parent token's ipfs...");
    var updated = await updateNFT(metadata);
    await validateNFTupload(get_ipfs_link(parentAcc, parentTokenID));
    console.log ("updated parent ipfs.");

    update_ipfs(parentAcc, parentTokenID, updated.url);
}


export async function remove_parent_ipfs(parentAcc, parentTokenID, childAcc, childTokenID) {

    console.log("updating parent token's ipfs data...");
    
    var metadata = await get_token_metadata(parentAcc, parentTokenID);

    // update metadata to remove child token
    var child_tokens = metadata["properties"]["child_tokens"];
    var index = child_tokens.findIndex(x => x.contract_address === childAcc && x.token_id === childTokenID);
    child_tokens.splice(index, 1);
    

    console.log ("generating updated parent token's ipfs...");
    var updated = await updateNFT(metadata);
    await validateNFTupload(get_ipfs_link(parentAcc, parentTokenID));
    console.log ("updated parent ipfs.");

    update_ipfs(parentAcc, parentTokenID, updated.url);
}


// update child ipfs link to remove parent token 2
// update child ipfs link to include parent token 2
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

    console.log ("generating updated child token's ipfs...");
    var updated = await updateNFT(metadata);
    await validateNFTupload(get_ipfs_link(parentAcc, parentTokenID));
    console.log ("updated child ipfs.");

    update_ipfs(childAcc, childTokenID, updated.url);
}



// ---------------------- MAPPING export functions ----------------------

// update parents of a token
export function add_parent_mapping(owner_addr, tokenID, parent_addr, parent_tokenID) {
    if (!composable[owner_addr]) composable[owner_addr] = {};
    if (!composable[owner_addr][tokenID]) composable[owner_addr][tokenID] = {};
    if (!composable[owner_addr][tokenID]["parents"]) composable[owner_addr][tokenID]["parents"] = [];
    composable[owner_addr][tokenID]["parents"].push([parent_addr, parent_tokenID]);

    console.log("updated token's parents.");

}

export function remove_parent_mapping(owner_addr, tokenID, parent_addr, parent_tokenID) {
    try {
        composable[owner_addr][tokenID]["parents"].splice([parent_addr, parent_tokenID], 1);
    }
    catch {
        console.error("error removing parent mapping.");
    }
}

// update children of a token
export function add_children_mapping(owner_addr, tokenID, child_addr, child_tokenID, child_tokens) {
    if (!composable[owner_addr]) composable[owner_addr] = {};
    if (!composable[owner_addr][tokenID]) composable[owner_addr][tokenID] = {};
    if (!composable[owner_addr][tokenID]["children"]) composable[owner_addr][tokenID]["children"] = [];
    composable[owner_addr][tokenID]["children"].push([child_addr, child_tokenID, child_tokens]);

    console.log("updated token's children.");

}

export function remove_children_mapping(owner_addr, tokenID, child_addr, child_tokenID) {
    try {
        var index = composable[owner_addr][tokenID]["children"].indexOf([child_addr, child_tokenID]);
        composable[owner_addr][tokenID]["children"].splice(index, 1);
        console.log("removed token's children.");
    }
    catch {
        console.error("error removing child mapping.");
    }
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

    return true;
}

// update child ipfs and dictionary mapping
export async function update_transferred_child(parentAcc, parentTokenID, parentAcc2, parentTokenID2, childAcc, childTokenID) {
    
    child_to_update();
    await update_child_ipfs_transfer(parentAcc, parentTokenID, parentAcc2, parentTokenID2, childAcc, childTokenID);
    remove_parent_mapping(childAcc, childTokenID, parentAcc, parentTokenID);
    add_parent_mapping(childAcc, childTokenID, parentAcc2, parentTokenID2);

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
                description: "description about the NFT.",
                image: blob,
                properties: {
                    ownership_stage: "composable asset supply chain stage",
                    contract_address: "owner contract address", 
                    recycled: "boolean - true/false",
                    parent_tokens: metadata["properties"]["parent_tokens"],
                    child_tokens: metadata["properties"]["child_tokens"],
                }
            });

            return updated_metadata;

        } catch (error) {
            console.error(error);
        }
}


// ---------------------- VALIDATION AND CACHING OPTIMIZATION export functions ----------------------


export async function validateNFTupload(metadata) {

    var cid = metadata.replace("ipfs://", "")
    cid = cid.replace("/metadata.json", "")
    console.log("CID: ", cid);
    const check = await nftStorage.check(cid);
    console.log("Upload check: ", check);
    if (check) {
        const status = await nftStorage.status(cid);
        console.log("NFT status check: ", status);
    }
}

// upload to ipfs button in: https://natoboram.gitlab.io/public-gateway-cacher/

// cache a specific IPFS hash to a bunch of public gateways, for faster retrieval
export async function cache_cid(cid) {

    // var ipfsLink = "";
    // function set_url(url) {
    //     console.log("INSIDE: ", url)
    //     ipfsLink = url;
    // }
    let res = "";
    let l = cid.replace("/metadata.json", "");
    // console.

    console.log("Attempting to cache CID on some public gatways...", cid);;
    // loop through gateways
    for (var i = 0; i < gateways.length ; i++) {
        
        console.log("Trying to cache link: ", gateways[i] + "ipfs/"+ cid);
        res = fetch(
            "https://" + l + ".ipfs.nftstorage.link/metadata.json", {
            method: "GET",
            headers: {
            "Content-Type": "text/plain",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "en-US,en;q=0.5"
            },
        }).then((response, flag) => {
            if (response.status === 200) {
                console.log("Successfully cached CID on gateway: ", response.url);
                console.log('response.status: ', response.status); 
                // set_url(response.url);
                return response.url;
            }
        });
        // .then((url) => {
        //     const error = new Error("BBB");
        //     throw error;
        // }).then((url) => {
        //     console.log("");
        // }).catch((error) => {
        //     console.log("");
        // });
        
    }

    // return ipfsLink;
    // return r;
    return res;


}


// --------------------------- REACT FLOW RENDERING FUNCTIONS ---------------------------------------------

export var nodes = [];
export var edges = [];

export async function getNodes() {
    nodes = [];
    var node = {};
    var composable = get_composable_structure();
   
    // get tokenID and contract address of each token, and add tokenID as id and label
    // i and j increments for position shift
    var i = 0;
    for (var contractAddress in composable) {
        var j = 0;
        for (var tokenID in composable[contractAddress]) {
            // var metadata = await get_token_metadata(contractAddress, tokenID);
            node = {};
            node.id = tokenID;
            node.position = {};
            node.position = { x: 100+(i*50), y: 100+(i*50)+(j*100) };
            node.data = {"label": tokenID};
            nodes.push(node);
            j++;
        }
        i++;
    }

    return nodes;

}

// get children of each tokenID from composable and add to edges
export function getEdges() {
    edges = [];
    var edge = {};
    var composable = get_composable_structure();
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
                edge.labelShowBG = false;
                edge.animated = true;
                edges.push(edge);
            }
        }
    }
    return edges;
}


export function updateFlow() {
    getNodes();
    getEdges();
    return [nodes, edges];
}

// -------------------------------------------------------------------------------