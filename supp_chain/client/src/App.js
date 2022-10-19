import React, { useEffect, useState, useCallback } from "react";
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  applyEdgeChanges,
  applyNodeChanges,
  ReactFlowProvider,
} from 'react-flow-renderer';
import 'reactflow/dist/style.css';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import ERC998ERC1155TopDownPresetMinterPauser from "./contracts/ERC998ERC1155TopDownPresetMinterPauser.json";
import ERC998ERC1155TopDown from "./contracts/ERC998ERC1155TopDown.json";
import ERC1155PresetMinterPauser from "./contracts/ERC1155PresetMinterPauser.json";
import getWeb3 from "./getWeb3"; 
import "./App.css";
import { nodes as initialNodes, edges as initialEdges } from './initial-elements';
import { NFTStorage } from "nft.storage";
import { integerPropType } from "@mui/utils";
import $ from 'jquery';

//composable dict structure
// var composable = {
//     [owner_addr]: {
//         [tokenID]: {
//                "metadata": ipns_link, 
//                "parents": [(parent_addr, parent_token)], 
//                "children": [(child_addr, child_token)]   
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




var composable = {};

var parent_update = 0;
var child_update = 0;
var parent2_update = 0;

function parent_to_update() {
    parent_update = 1;
}

function child_to_update() {
    child_update = 1;
}

function parent2_to_update() {
    parent2_update = 1;
}

function null_parent() {
    parent_update = 0;
}

function null_child() {
    child_update = 0;
}

function null_parent2() {
    parent2_update = 0;
}

var parentContractAddr = 0
var parentContractAddr2 = 0
var childContractAddr = 0
var numTokens = 0

function setParentContractAddr(addr) {
    parentContractAddr = addr;
}

function setParentContractAddr2(addr) {
    parentContractAddr2 = addr; 
}

function setChildContractAddr(addr) {
    childContractAddr = addr;
}

function setNumTokens(num) {
    numTokens = num;
}

function get_composable_structure() {
    return composable;
}

// ---------------------- IPFS functions ----------------------

function get_ipfs_link(acc, tokenID) {
    return composable[acc][tokenID]["metadata"];
}


// update ipfs link of token
function update_ipfs(owner_addr, tokenID, ipfs_link) {

    // using nft.storage ipfs subdomain since we're using it's API for faster data retreival
    var ipfs_link = ipfs_link.replace("ipfs://", "https://nftstorage.link/ipfs/");
    if (!composable[owner_addr]) composable[owner_addr] = {};
    if (!composable[owner_addr][tokenID]) composable[owner_addr][tokenID] = {};
    if (!composable[owner_addr][tokenID]["metadata"]) composable[owner_addr][tokenID]["metadata"] = {};
    composable[owner_addr][tokenID]["metadata"] = ipfs_link;

    console.log("updated token's ipfs.");

}


// update parent ipfs link to include child token
// update ipfs dictionary mapping
async function add_parent_ipfs(parentAcc, parentTokenID, childAcc, childTokenID, childTokens) {

    console.log("updating parent's ipfs data...");
    var url = get_ipfs_link(parentAcc, parentTokenID);
    
    var metadata = await $.getJSON(url)

    // update metadata to include child token
    metadata["properties"]["child_tokens"].push({"contract_address": childAcc, "token_id": childTokenID, "num_tokens": childTokens});

    console.log ("generating updated parent's ipfs...");
    var updated = await updateNFT(metadata);
    console.log ("updated parent ipfs.");

    update_ipfs(parentAcc, parentTokenID, updated.url);
}


async function remove_parent_ipfs(parentAcc, parentTokenID, childAcc, childTokenID) {

    console.log("updating parent's ipfs data...");
    var url = get_ipfs_link(parentAcc, parentTokenID);
    
    var metadata = await $.getJSON(url)

    // update metadata to remove child token
    var child_tokens = metadata["properties"]["child_tokens"];
    var index = child_tokens.findIndex(x => x.contract_address === childAcc && x.token_id === childTokenID);
    child_tokens.splice(index, 1);
    

    console.log ("generating updated parent's ipfs...");
    var updated = await updateNFT(metadata);
    console.log ("updated parent ipfs.");

    update_ipfs(parentAcc, parentTokenID, updated.url);
}


// update child ipfs link to remove parent token 2
// update child ipfs link to include parent token 2
async function update_child_ipfs_transfer(parentAcc, parentTokenID, parentAcc2, parentTokenID2, childAcc, childTokenID) {

    console.log("updating child's ipfs data...");
    var url = get_ipfs_link(childAcc, childTokenID);

    var metadata = await $.getJSON(url)

    // update metadata to remove parent token 1
    try {
        metadata["properties"]["parent_tokens"].splice({"contract_address": parentAcc, "token_id": parentTokenID}, 1);
    } catch (error) {
        console.error("Error in trying to remove parentTokenID1 from child token ipfs metadata.");
    }

    // update metadata to include parent token 2
    metadata["properties"]["parent_tokens"].push({"contract_address": parentAcc2, "token_id": parentTokenID2});

    console.log ("generating updated child's ipfs...");
    var updated = await updateNFT(metadata);
    console.log ("updated child ipfs.");

    update_ipfs(childAcc, childTokenID, updated.url);
}



// ---------------------- MAPPING functions ----------------------

// update parents of a token
function add_parent_mapping(owner_addr, tokenID, parent_addr, parent_tokenID) {
    if (!composable[owner_addr]) composable[owner_addr] = {};
    if (!composable[owner_addr][tokenID]) composable[owner_addr][tokenID] = {};
    if (!composable[owner_addr][tokenID]["parents"]) composable[owner_addr][tokenID]["parents"] = [];
    composable[owner_addr][tokenID]["parents"].push([parent_addr, parent_tokenID]);

    console.log("updated token's parents.");

}

function remove_parent_mapping(owner_addr, tokenID, parent_addr, parent_tokenID) {
    try {
        composable[owner_addr][tokenID]["parents"].splice([parent_addr, parent_tokenID], 1);
    }
    catch {
        console.error("error removing parent mapping.");
    }
}

// update children of a token
function add_children_mapping(owner_addr, tokenID, child_addr, child_tokenID, child_tokens) {
    if (!composable[owner_addr]) composable[owner_addr] = {};
    if (!composable[owner_addr][tokenID]) composable[owner_addr][tokenID] = {};
    if (!composable[owner_addr][tokenID]["children"]) composable[owner_addr][tokenID]["children"] = [];
    composable[owner_addr][tokenID]["children"].push([child_addr, child_tokenID, child_tokens]);

    console.log("updated token's children.");

}

function remove_children_mapping(owner_addr, tokenID, child_addr, child_tokenID) {
    try {
        var index = composable[owner_addr][tokenID]["children"].indexOf([child_addr, child_tokenID]);
        composable[owner_addr][tokenID]["children"].splice(index, 1);
        console.log("removed token's children.");
    }
    catch {
        console.error("error removing child mapping.");
    }
}


// ---------------------- UPDATION functions ----------------------


// update parent ipfs and dictionary mapping 
// 1+ child tokens -- add/update mapping
// 0 child tokens -- remove mapping
async function update_parent(parentAcc, parentTokenID, childAcc, childTokenID, childTokens) {
        
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
async function update_transferred_child(parentAcc, parentTokenID, parentAcc2, parentTokenID2, childAcc, childTokenID) {
    
    child_to_update();
    await update_child_ipfs_transfer(parentAcc, parentTokenID, parentAcc2, parentTokenID2, childAcc, childTokenID);
    remove_parent_mapping(childAcc, childTokenID, parentAcc, parentTokenID);
    add_parent_mapping(childAcc, childTokenID, parentAcc2, parentTokenID2);

    return true;
}


async function updateNFT(metadata) {
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


// -------------------------------------------------------------------------------
    


function App() {
    const [tokenID, setTokenID] = useState(0);
    const [parentTokenID, setParentTokenID] = useState(0);
    const [parentTokenID2, setParentTokenID2] = useState(0);
    const [childTokenID, setChildTokenID] = useState(0);
    const [numChildTokens, setNumChildTokens] = useState(0);
    const [loaded, setLoaded] = useState(false);
    const [web3, setWeb3] = useState("undefined");
    const [accounts, setAccount] = useState("");
    const [networkId, setNetworkId] = useState("");
    const [erc998Minter, setERC998Minter] = useState("");
    const [erc998TD, setERC998TD] = useState("");
    const [erc1155Minter, setERC1155Minter] = useState("");
    const [mintParentOpen, setMintParentOpen] = useState(false);
    const [mintChildOpen, setMintChildOpen] = useState(false);
    const [mintChild998Open, setMintChild998Open] = useState(false);
    const [transferChild, setTransferChild] = useState(false);
    const [tokenName, setTokenName] = useState("");

    // *** does this even work? ***
    function setNullState() {
        setTokenID(0);
        setChildTokenID(0);
        setParentTokenID(0);
        setParentContractAddr(0)
        setParentContractAddr2(0);
        setChildContractAddr(0);
        setNumChildTokens(0);
        setNumTokens(0);
        null_parent();
        null_child();
        null_parent2();
    }

    async function uploadNFT() {
        const nftStorage = new NFTStorage({token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGNEYTZDMTE0QzkwMUY1RmEyNEYwOTc0ZWM4ZGJlY0I0YzdEQkUxZjciLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2MzU5Mjk5MTUwNywibmFtZSI6InRlc3QifQ._LYiNUkFKxwYCFzO06X6zGAxDrTz6EKp25JvA5J1IE0'});
        var blob = new Blob();
        var token_id = tokenID;
        var p_token_id = 0;
        var p_contract_addr = 0;
        var c_token_id = 0;
        var c_contract_addr = 0;
        var owner_address = accounts[0];

        try {

            if (parent_update) {
                token_id = parentTokenID;
                c_token_id = childTokenID;
                c_contract_addr = childContractAddr;
                parent_update = 0;
            }

            if (parent2_update) {
                token_id = parentTokenID2;
                c_token_id = childTokenID;
                c_contract_addr = childContractAddr;
                parent2_update = 0;
            }

            if (child_update) {
                token_id = childTokenID;
                p_token_id = parentTokenID;
                p_contract_addr = parentContractAddr;
                owner_address = childContractAddr;
                child_update = 0;
            }

            // Upload NFT to IPFS & Filecoin
            const metadata = await nftStorage.store({
                token_id: token_id,
                owner_address: owner_address,
                name: tokenName, 
                description: "description about the NFT.",
                image: blob,
                properties: {
                    ownership_stage: "composable asset supply chain stage",
                    contract_address: "owner contract address", 
                    recycled: "boolean - true/false",
              
                    parent_tokens: [
                      {
                        contract_address: p_contract_addr,
                        token_id: p_token_id,
                      }
                    ],
              
                    child_tokens: [
                      {
                        contract_address: c_contract_addr,
                        token_id: c_token_id,
                        num_tokens: numTokens,
                      }
                    ]
                }
            });

            return metadata;
              
    
        } catch (error) {
            console.error(error);
        }
    }

    // component mount
    useEffect(() => {
        
        async function componentDidMount() {
            await loadContracts();
        }
            
        componentDidMount();

    }, []);

    async function loadContracts() {
        try {
            const web3 = await getWeb3();
            setWeb3(web3);
            // Use web3 to get the user's accounts.
            const accounts = await web3.eth.getAccounts(); // Get the contract instance.
            setAccount(accounts);
            const networkId = await web3.eth.net.getId(); 
            setNetworkId(networkId);
            
            const thisERC998ERC1155TopDownPresetMinterPauser = new web3.eth.Contract(
                ERC998ERC1155TopDownPresetMinterPauser.abi, 
                ERC998ERC1155TopDownPresetMinterPauser.networks[networkId] && ERC998ERC1155TopDownPresetMinterPauser.networks[networkId].address,
            );
            setERC998Minter(thisERC998ERC1155TopDownPresetMinterPauser);

            const thisERC998ERC1155TopDown = new web3.eth.Contract(
                ERC998ERC1155TopDown.abi,
                ERC998ERC1155TopDown.networks[networkId] && ERC998ERC1155TopDown.networks[networkId].address,
            );
            setERC998TD(thisERC998ERC1155TopDown);

            const thisERC1155PresetMinterPauser = new web3.eth.Contract(
                ERC1155PresetMinterPauser.abi,
                ERC1155PresetMinterPauser.networks[networkId] && ERC1155PresetMinterPauser.networks[networkId].address,
            );
            setERC1155Minter(thisERC1155PresetMinterPauser);


            setLoaded(true);

        } catch (error) {
            alert(`Failed to load web3, accounts, or contract. Check console for details.`,);
            console.error(error);
        }

    }

    const mintToken = async () => {
        console.log("Minting 998-parent token...");
        setMintParentOpen(false);
        let result = await erc998Minter.methods.mint(accounts[0], tokenID).send({ 
            from: accounts[0] });  
        console.log(result);
            
        var metadata = await uploadNFT();
        update_ipfs(accounts[0], tokenID, metadata.url);

        console.log("composable after minting: ", get_composable_structure());
    }

    const mintChildToken = async () => {
        console.log("Minting 1155-child token...");
        setMintChildOpen(false);
        let result = await erc1155Minter.methods.mint(accounts[0], childTokenID, numChildTokens, "0x").send({ 
            from: accounts[0] });
        console.log(result);

        // child token transfer to 998 contract
        console.log("Transferring 1155-child token to 998 contract...");
        let addr_to = ERC998ERC1155TopDownPresetMinterPauser.networks[networkId].address;
        let transfer = await erc1155Minter.methods.safeTransferFrom(accounts[0], addr_to, childTokenID, numChildTokens, web3.utils.encodePacked(parentTokenID)).send({ from: accounts[0] });
        
        console.log(transfer);
      
        var parentAcc = await erc998Minter.methods.ownerOf(parentTokenID).call();
        var childAcc = await erc998Minter.methods.getChildContract(parentTokenID, childTokenID).call();

        setParentContractAddr(parentAcc);
        setChildContractAddr(childAcc);

        // to save num of child tokens in parents' metadata instead of in child token metadata
        numTokens = numChildTokens;
        setNumTokens(0);
        child_to_update();
        console.log("Generating and uploading child token metadata...");
        var metadata = await uploadNFT();
        setNumTokens(numChildTokens);

        // save ipfs link of child w parent addr + token mapping
        update_ipfs(childAcc, childTokenID, metadata.url);
        add_parent_mapping(childAcc, childTokenID, parentAcc, parentTokenID);
    
        // update parent token metadata
        var res = await update_parent(parentAcc, parentTokenID, childAcc, childTokenID, numTokens);

        if (res) {
            setNullState();
            console.log("IPFS mappings updated!");
            console.log("Composable structure: ", get_composable_structure());
        }

        else {
            console.error("Error updating mapping.");
        }
        
    }

    const transferChildToParent = async () => {
        console.log("Transferring 998/1155-child token from parentTokenID to parentTokenID2 in the 988 contract...");
        setTransferChild(false);
        let addr_from = ERC1155PresetMinterPauser.networks[networkId].address;
        let addr_to = ERC998ERC1155TopDownPresetMinterPauser.networks[networkId].address;
        let result = await erc998Minter.methods.safeTransferChildFrom(parentTokenID, addr_to, addr_from, childTokenID, 1, web3.utils.encodePacked(parentTokenID2)).send({ from: accounts[0]});
        console.log(result);
            
        var parentAcc = await erc998Minter.methods.ownerOf(parentTokenID).call();
        var parentAcc2 = await erc998Minter.methods.ownerOf(parentTokenID2).call();
        var childAcc = await erc998Minter.methods.getChildContract(parentTokenID2, childTokenID).call();
        console.log("childAcc in transfer: ", childAcc);
       
        var res1 = await update_parent(parentAcc, parentTokenID, childAcc, childTokenID, 0);

        parent2_to_update();
        // *** should get from user input for batch transfer ***
        setNumTokens(1);
        var res2 = await update_parent(parentAcc2, parentTokenID2, childAcc, childTokenID, 1);

        if (res1 && res2) {
            var res3 = await update_transferred_child(parentAcc, parentTokenID, parentAcc2, parentTokenID2, childAcc, childTokenID);
        }

        if (res3) {
            setNullState();
            console.log("IPFS mappings updated!");
            console.log("Composable structure: ", get_composable_structure());
        }

        else {
            console.error("Error updating mapping.");
        }
    }

    const mintChild998 = async () => {
        console.log("Minting 998-child token...");
        setMintChild998Open(false);
        let result = await erc998Minter.methods.mint(accounts[0], childTokenID).send({ 
            from: accounts[0] });
        console.log(result);
        let addr_to = ERC998ERC1155TopDownPresetMinterPauser.networks[networkId].address;
        let t = await erc998Minter.methods.safeTransferFrom(accounts[0], addr_to, childTokenID, web3.utils.encodePacked(parentTokenID)).send({ from: accounts[0] });
        console.log(t);

        let o = await erc998Minter.methods.childBalance(parentTokenID, ERC998ERC1155TopDownPresetMinterPauser.networks[networkId].address, childTokenID).call();
        console.log("child balance is:", o);

        
    }

    const handleInputChange = (event) => {
        const target = event.target;
        const value = target.value; 
        const name = target.name;
        
        if(name === "tokenID"){
            setTokenID(value);
        }

        if(name === "tokenName"){
            setTokenName(value);
        }

        if(name === "numTokens"){
            setNumChildTokens(value);
        }

        if(name === "parentTokenID"){
            setParentTokenID(value);
        }

        if(name === "parentTokenID2"){
            setParentTokenID2(value);
        }

        if(name === "childTokenID"){
            setChildTokenID(value);
        }
    }

    const handleClickOpen = (event) => {
        const target = event.target;
        const val = target.value;
        
        if(val === "parent"){
            setMintParentOpen(true);
        }

        if(val === "child"){
            setMintChildOpen(true);
        }
        
        if(val === "transfer"){
            setTransferChild(true);
        }

        if(val === "child998"){
            setMintChild998Open(true);
        }
    };

    const handleClose = (event) => {
        const target = event.target;
        const val = target.value;
        console.log(val)
        
        if(val === "parent"){
            setMintParentOpen(false);
        }

        if(val === "child"){
            setMintChildOpen(false);
        }

        if(val === "transfer"){
            setTransferChild(false);
        }

        if(val === "child998"){
            setMintChild998Open(false);
        }
    };
    return (
        <div>
            <Button variant="outlined" onClick={handleClickOpen} value="parent">Mint Parent</Button>
            <Dialog open={mintParentOpen} onClose={handleClose}>
                <DialogTitle>Mint</DialogTitle>
                <DialogContent>
                <DialogContentText>
                    Please enter a name and tokenId for the creation of this NFT.
                </DialogContentText>
                <TextField
                    required
                    label="Token name"
                    name="tokenName"
                    onChange={handleInputChange}
                />
                <TextField
                    required
                    label="Token ID"
                    name="tokenID"
                    onChange={handleInputChange}
                />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} value="parent">Cancel</Button>
                    <Button onClick={mintToken}>Mint</Button>
                </DialogActions>
            </Dialog>

            <Button variant="outlined" onClick={handleClickOpen} value="child">Mint Child</Button>
            <Dialog open={mintChildOpen} onClose={handleClose}>
                <DialogTitle>Mint</DialogTitle>
                <DialogContent>
                <DialogContentText>
                    Please enter a name, tokenId and amount of tokens for the child NFT.
                </DialogContentText>
                <TextField
                    required
                    label="Token name"
                    name="tokenName"
                    onChange={handleInputChange}
                />
                <TextField
                    required
                    label="Token ID"
                    name="childTokenID"
                    onChange={handleInputChange}
                />
                <TextField
                    required
                    label="Parent token ID"
                    name="parentTokenID"
                    onChange={handleInputChange}
                />
                <TextField
                    required
                    label="Amount of tokens"
                    name="numTokens"
                    onChange={handleInputChange}
                />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} value="child">Cancel</Button>
                    <Button onClick={mintChildToken}>Mint</Button>
                </DialogActions>
            </Dialog>

            <Button variant="outlined" onClick={handleClickOpen} value="transfer">Transfer Child</Button>
            <Dialog open={transferChild} onClose={handleClose}>
                <DialogTitle>Mint</DialogTitle>
                <DialogContent>
                <DialogContentText>
                    Please enter parent token ID you want to transfer the child to.
                </DialogContentText>
                <TextField
                    required
                    label="Parent token ID"
                    name="parentTokenID"
                    onChange={handleInputChange}
                />
                <TextField
                    required
                    label="Child ID"
                    name="childTokenID"
                    onChange={handleInputChange}
                />
                <TextField
                    required
                    label="Parent ID to transfer to"
                    name="parentTokenID2"
                    onChange={handleInputChange}
                />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} value="transfer">Cancel</Button>
                    <Button onClick={transferChildToParent}>Transfer</Button>
                </DialogActions>
            </Dialog>

            <Button variant="outlined" onClick={handleClickOpen} value="child998">Mint Child 998</Button>
            <Dialog open={mintChild998Open} onClose={handleClose}>
                <DialogTitle>Mint</DialogTitle>
                <DialogContent>
                <DialogContentText>
                    Mint Child 998 Token
                </DialogContentText>
                <TextField
                    required
                    label="Token name"
                    name="tokenName"
                    onChange={handleInputChange}
                />
                <TextField
                    required
                    label="Parent token ID"
                    name="parentTokenID"
                    onChange={handleInputChange}
                />
                <TextField
                    required
                    label="Child token ID"
                    name="childTokenID"
                    onChange={handleInputChange}
                />
                <TextField
                    required
                    label="Amount of tokens"
                    name="numTokens"
                    onChange={handleInputChange}
                />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} value="child998">Cancel</Button>
                    <Button onClick={mintChild998}>Mint</Button>
                </DialogActions>
            </Dialog>
        </div>  
    ); 

};

export default App;



