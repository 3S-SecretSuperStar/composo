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

// *** how to show minted tokens on Metamask account?

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

// update ipfs link of token
function update_ipfs(owner_addr, tokenID, ipfs_link) {

    // using nft.storage ipfs subdomain since we're using it's API for faster data retreival
    var ipfs_link = ipfs_link.replace("ipfs://", "https://nftstorage.link/ipfs/");
    if (!composable[owner_addr]) composable[owner_addr] = {};
    if (!composable[owner_addr][tokenID]) composable[owner_addr][tokenID] = {};
    if (!composable[owner_addr][tokenID]["metadata"]) composable[owner_addr][tokenID]["metadata"] = {};
    composable[owner_addr][tokenID]["metadata"] = ipfs_link;

    console.log("update_ipfs() called, updated structure: ", composable);

}

// update parents of a token
function update_parent_mapping(owner_addr, tokenID, parent_addr, parent_tokenID) {
    if (!composable[owner_addr]) composable[owner_addr] = {};
    if (!composable[owner_addr][tokenID]) composable[owner_addr][tokenID] = {};
    if (!composable[owner_addr][tokenID]["parents"]) composable[owner_addr][tokenID]["parents"] = [];
    composable[owner_addr][tokenID]["parents"].push([parent_addr, parent_tokenID]);

    console.log("update_parent_mapping() called, updated structure: ", composable);

}

// update children of a token
function update_children_mapping(owner_addr, tokenID, child_addr, child_tokenID) {
    if (!composable[owner_addr]) composable[owner_addr] = {};
    if (!composable[owner_addr][tokenID]) composable[owner_addr][tokenID] = {};
    if (!composable[owner_addr][tokenID]["children"]) composable[owner_addr][tokenID]["children"] = [];
    composable[owner_addr][tokenID]["children"].push([child_addr, child_tokenID]);

    console.log("update_children_mapping() called, updated structure: ", composable);

}


// update parent ipfs link to include child token
// update ipfs dictionary mapping
async function update_parent_ipfs(parentAcc, parentTokenID, childAcc, childTokenID) {

        console.log("updating parent ipfs with child acc & child token ID:  ", childAcc, childTokenID);
        var url = get_ipfs_link(parentAcc, parentTokenID);
        
        var metadata = await $.getJSON(url)

        // update metadata to include child token
        metadata["properties"]["child_tokens"].push({"contract_address": childAcc, "token_id": childTokenID});
        console.log("updated metadata: ", metadata);

        console.log ("updating parent ipfs...");
        var updated = await updateNFT(metadata);
        console.log ("updated parent ipfs: ", updated.url);

        update_ipfs(parentAcc, parentTokenID, updated.url);
}

// update child ipfs link to include parent token
// update ipfs dictionary mapping
async function update_child_ipfs(parentAcc, parentTokenID, childAcc, childTokenID) {

    console.log("updating child ipfs with parent acc & parent token ID:  ", parentAcc, parentTokenID);
    var url = get_ipfs_link(childAcc, childTokenID);
    
    var metadata = await $.getJSON(url)

    // update metadata to include parent token
    metadata["properties"]["parent_tokens"].push({"contract_address": parentAcc, "token_id": parentTokenID});
    console.log("updated metadata: ", metadata);

    console.log ("updating child ipfs...");
    var updated = await updateNFT(metadata);
    console.log ("updated child ipfs: ", updated.url);

    update_ipfs(childAcc, childTokenID, updated.url);
}

// update parent ipfs and dictionary mapping
async function update_parent(parentAcc, parentTokenID, childAcc, childTokenID) {
        update_parent_ipfs(parentAcc, parentTokenID, childAcc, childTokenID);
        update_children_mapping(parentAcc, parentTokenID, childAcc, childTokenID);

        return true;
}


// update child ipfs and dictionary mapping
async function update_child(parentAcc, parentTokenID, childAcc, childTokenID) {
    update_child_ipfs(parentAcc, parentTokenID, childAcc, childTokenID);
    update_parent_mapping(parentAcc, parentTokenID, childAcc, childTokenID);

    return true;
}

function get_ipfs_link(parentAcc, parentTokenID) {

    return composable[parentAcc][parentTokenID]["metadata"];
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
                image: blob, 
                description: "description about the NFT.",
                properties: {
                    num_child_tokens: metadata["properties"]["num_child_tokens"],
                    ownership_stage: "composable asset supply chain stage",
                    contract_address: "owner contract address", 
                    recycled: "boolean - true/false",
              
                    parent_tokens: [
                        metadata["properties"]["parent_tokens"]
                    ],
              
                    child_tokens: [
                        metadata["properties"]["child_tokens"]
                    ]
                }
            });

            return updated_metadata;

        } catch (error) {
            // setErrorMessage("Could not save NFT to NFT.Storage - Aborted minting.");
            console.log(error);
        }
}



function App() {
    
    const [accAddress, setAccAddr] = useState(0);
    const [tokenID, setTokenID] = useState(0);
    const [parentTokenID, setParentTokenID] = useState(0);
    const [parentTokenID2, setParentTokenID2] = useState(0);
    const [childTokenID, setChildTokenID] = useState(0);
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
    const [numChildTokens, setNumChildTokens] = useState(0);
    const [transferChild, setTransferChild] = useState(false);
    const [tokenName, setTokenName] = useState("");

    async function uploadNFT() {
        const nftStorage = new NFTStorage({token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGNEYTZDMTE0QzkwMUY1RmEyNEYwOTc0ZWM4ZGJlY0I0YzdEQkUxZjciLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2MzU5Mjk5MTUwNywibmFtZSI6InRlc3QifQ._LYiNUkFKxwYCFzO06X6zGAxDrTz6EKp25JvA5J1IE0'});
        var blob = new Blob();
        try {
            
            // Upload NFT to IPFS & Filecoin
            const metadata = await nftStorage.store({
                token_id: tokenID,
                owner_address: accounts[0],
                name: tokenName, 
                image: blob, 
                description: "description about the NFT.",
                properties: {
                    num_child_tokens: numChildTokens,
                    ownership_stage: "composable asset supply chain stage",
                    contract_address: "owner contract address", 
                    recycled: "boolean - true/false",
              
                    parent_tokens: [
                      {
                        contract_address: "parent contract address",
                        token_id: parentTokenID,
                      }
                    ],
              
                    child_tokens: [
                      {
                        contract_address: "child contract address",
                        token_id: childTokenID,
                      }
                    ]
                }
            });

            return metadata;
              
    
        } catch (error) {
            // setErrorMessage("Could not save NFT to NFT.Storage - Aborted minting.");
            console.log(error);
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

        //let o = await erc998Minter.methods.getOwner(tokenID).call();
        // console.log("owner of token is :", o);s
        // console.log("IPFS link: ", metadata.url);
        update_ipfs(accounts[0], tokenID, metadata.url);

        // setMintParentOpen(false);
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

        
        // let o = await erc998Minter.methods.childBalance(parentTokenID, ERC1155PresetMinterPauser.networks[networkId].address, childTokenID).call();
        // console.log("child balance is:", o);

        var metadata = await uploadNFT();    
        var parentAcc = await erc998Minter.methods.getOwner(parentTokenID).call();
        var childAcc = await erc998Minter.methods.getOwner(parentTokenID).call();

        // generate ipfs link of child w parent addr + token
        update_ipfs(addr_to, childTokenID, metadata.url);
        update_parent_mapping(addr_to, childTokenID, parentAcc, parentTokenID);
        
       
        var res = await update_parent(parentAcc, parentTokenID, childAcc, childTokenID);

        if (res) {
            console.log("IPFS of parent and mapping of child to parent updated.!");
        }
        
    }

    const transferChildToParent = async () => {
        console.log("Transferring 1155-child token to 988 ...");
        setTransferChild(false);
        let addr_from = ERC1155PresetMinterPauser.networks[networkId].address;
        // console.log(addr_from);
        let addr_to = ERC998ERC1155TopDownPresetMinterPauser.networks[networkId].address;
        // let result = await erc1155Minter.methods.safeTransferFrom(accounts[0], addr_to, childTokenID, parentTokenID, web3.utils.encodePacked(parentTokenID)).send({ 
        //     from: accounts[0] });

        // console.log(result);
        

        let n = await erc998Minter.methods.safeTransferChildFrom(parentTokenID, addr_to, addr_from, childTokenID, 1, web3.utils.encodePacked(parentTokenID2)).send({ from: accounts[0]});
        console.log(n);

        // let o = erc998Minter.methods.getOwner(1).call();
        // console.log("owner is :", o);

        // let m = erc998Minter.methods.getMsgSender().call();
        // console.log("msg sender is: ", m);

        // console.log(accounts[0]);

        //let cb = erc998Minter.methods._balances(1, addr_from, 2).call();
        // console.log(cb);

        // generate ipfs link of child w parent addr + token
            // update_ipfs(accounts[0], tokenID, metadata.url);
        // generate new ipfs link of parent w child addr + token, 
            // uploadnft()....
            // update_ipfs(parent_acc_addr, tokenID, metadata.url);
            // update_children_mapping(parent_acc_addr, parent_tokenID, child_addr, child_tokenID));

    }

    // *** which 998 is the parent to set as the parent of the child
    // rn child 998 is transferrred to 988 minter smart contract

    const mintChild998 = async () => {
        console.log("Minting 998-child token...");
        setMintChild998Open(false);
        let result = await erc998Minter.methods.mint(accounts[0], childTokenID,).send({ 
            from: accounts[0] });
        console.log(result);
        let addr_to = ERC998ERC1155TopDownPresetMinterPauser.networks[networkId].address;
        let t = await erc998Minter.methods.safeTransferFrom(accounts[0], addr_to, childTokenID, "0x").send({ from: accounts[0] });
        console.log(t);

        // generate ipfs link of child w parent addr + token
            // update_ipfs(accounts[0], tokenID, metadata.url);
        // generate new ipfs link of parent w child addr + token, 
            // uploadnft()....
            // update_ipfs(parent_acc_addr, tokenID, metadata.url);
            // update_children_mapping(parent_acc_addr, parent_tokenID, child_addr, child_tokenID));
    }

    const handleInputChange = (event) => {
        const target = event.target;
        const value = target.value; 
        const name = target.name;
        
        // this.setState({
        //     [name]: value
        // });
        if(name === "accAddress"){
            setAccAddr(value);
        } 

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

            <Button variant="outlined" onClick={handleClickOpen} value="child988">Mint Child 998</Button>
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
                    <Button onClick={handleClose} value="child">Cancel</Button>
                    <Button onClick={mintChild998}>Mint</Button>
                </DialogActions>
            </Dialog>
        </div>
        
        
    ); 

};


export default App;