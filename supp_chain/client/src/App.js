import React, { useEffect, useState } from "react";
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import ERC998ERC1155TopDownPresetMinterPauser from "./contracts/ERC998ERC1155TopDownPresetMinterPauser.json";
import ERC1155PresetMinterPauser from "./contracts/ERC1155PresetMinterPauser.json";
import getWeb3 from "./getWeb3"; 
import "./App.css";
import { NFTStorage } from "nft.storage";
import * as Composable from './Composable.js'

const nftStorage = new NFTStorage({token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGNEYTZDMTE0QzkwMUY1RmEyNEYwOTc0ZWM4ZGJlY0I0YzdEQkUxZjciLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2MzU5Mjk5MTUwNywibmFtZSI6InRlc3QifQ._LYiNUkFKxwYCFzO06X6zGAxDrTz6EKp25JvA5J1IE0'});

function App() {
    const [tokenID, setTokenID] = useState(0);
    const [parentTokenID, setParentTokenID] = useState(0);
    const [parentTokenID2, setParentTokenID2] = useState(0);
    const [childTokenID, setChildTokenID] = useState(0);
    const [numChildTokens, setNumChildTokens] = useState(0);
    const [web3, setWeb3] = useState("undefined");
    const [accounts, setAccount] = useState("");
    const [networkId, setNetworkId] = useState("");
    const [erc998Minter, setERC998Minter] = useState("");
    const [erc1155Minter, setERC1155Minter] = useState("");
    const [mintParentOpen, setMintParentOpen] = useState(false);
    const [mintChildOpen, setMintChildOpen] = useState(false);
    const [mintChild998Open, setMintChild998Open] = useState(false);
    const [transferChild, setTransferChild] = useState(false);
    const [tokenName, setTokenName] = useState("");


    function setNullState() {
        setTokenID(0);
        setChildTokenID(0);
        setParentTokenID(0);
        Composable.setParentContractAddr(0)
        Composable.setParentContractAddr2(0);
        Composable.setChildContractAddr(0);
        setNumChildTokens(0);
        Composable.setNumTokens(0);
        Composable.null_parent();
        Composable.null_child();
        Composable.null_parent2();
    }

    async function uploadNFT() {
        var blob = new Blob();
        var token_id = tokenID;
        var p_token_id = 0;
        var p_contract_addr = 0;
        var c_token_id = 0;
        var c_contract_addr = 0;
        var owner_address = accounts[0];

        try {

            if (Composable.parent_update) {
                token_id = parentTokenID;
                c_token_id = childTokenID;
                c_contract_addr = Composable.childContractAddr;
                Composable.null_parent();
            }

            if (Composable.parent2_update) {
                token_id = parentTokenID2;
                c_token_id = childTokenID;
                c_contract_addr = Composable.childContractAddr;
                Composable.null_parent2();
            }

            if (Composable.child_update) {
                token_id = childTokenID;
                p_token_id = parentTokenID;
                p_contract_addr = Composable.parentContractAddr;
                owner_address = Composable.childContractAddr;
                Composable.null_child();
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
                        num_tokens: Composable.numTokens,
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

            const thisERC1155PresetMinterPauser = new web3.eth.Contract(
                ERC1155PresetMinterPauser.abi,
                ERC1155PresetMinterPauser.networks[networkId] && ERC1155PresetMinterPauser.networks[networkId].address,
            );
            setERC1155Minter(thisERC1155PresetMinterPauser);

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
        await Composable.validateNFTupload(metadata);
        Composable.update_ipfs(accounts[0], tokenID, metadata.url);

        console.log("composable after minting: ", Composable.get_composable_structure());
        Composable.updateFlow();
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

        Composable.setParentContractAddr(parentAcc);
        Composable.setChildContractAddr(childAcc);

        // to save num of child tokens in parents' metadata instead of in child token metadata
        Composable.setNumTokens(0);
        Composable.child_to_update();
        console.log("Generating and uploading child token metadata...");
        var metadata = await uploadNFT();
        await Composable.validateNFTupload(metadata);
        Composable.setNumTokens(numChildTokens);

        // save ipfs link of child w parent addr + token mapping
        Composable.update_ipfs(childAcc, childTokenID, metadata.url);
        Composable.add_parent_mapping(childAcc, childTokenID, parentAcc, parentTokenID);
    
        // update parent token metadata
        var res = await Composable.update_parent(parentAcc, parentTokenID, childAcc, childTokenID, Composable.numTokens);

        if (res) {
            setNullState();
            console.log("IPFS mappings updated!");
            console.log("Composable structure: ", Composable.get_composable_structure());
            Composable.updateFlow();
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
       
        var res1 = await Composable.update_parent(parentAcc, parentTokenID, childAcc, childTokenID, 0);

        Composable.parent2_to_update();
        // *** should get from user input for batch transfer ***
        Composable.setNumTokens(1);
        var res2 = await Composable.update_parent(parentAcc2, parentTokenID2, childAcc, childTokenID, 1);

        if (res1 && res2) {
            var res3 = await Composable.update_transferred_child(parentAcc, parentTokenID, parentAcc2, parentTokenID2, childAcc, childTokenID);
        }

        if (res3) {
            setNullState();
            console.log("IPFS mappings updated!");
            console.log("Composable structure: ", Composable.get_composable_structure());
            Composable.updateFlow();
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



