import React, { useEffect, useState } from "react";
import { styled } from '@mui/material/styles';
import {blue, blueGrey,  teal, indigo} from '@mui/material/colors';
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
import * as Composable from './Composable_session.js'
import './buttonStyles.css';

const nftStorage = new NFTStorage({token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGNEYTZDMTE0QzkwMUY1RmEyNEYwOTc0ZWM4ZGJlY0I0YzdEQkUxZjciLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2MzU5Mjk5MTUwNywibmFtZSI6InRlc3QifQ._LYiNUkFKxwYCFzO06X6zGAxDrTz6EKp25JvA5J1IE0'});


function App() {

    const SUPP_DRIVERS = {
        RAW_MATERIALS: "Raw Materials",
        SUPPLIER: "Supplier",
        MANUFACTURER: "Manufacturer",
        DISTRIBUTER: "Distributer",
        RETAILER: "RETAILER",
        CONSUMER: "Consumer"
    };

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
    const [transferParentOpen, setTransferParentOpen] = useState(false);
    const [accTransferFrom, setAccTransferFrom] = useState("");
    const [accTransferTo, setAccTransferTo] = useState("");
    const [tokenName, setTokenName] = useState("");
    const [tokenSuppDeets, setTokenSuppDeets] = useState({
        stage: SUPP_DRIVERS.RAW_MATERIALS,
        recycled: "", 
        description: ""
    });


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
                owner_address = Composable.parentContractAddr;
                Composable.null_child();
            }

            // Upload NFT to IPFS & Filecoin
            const metadata = await nftStorage.store({
                token_id: token_id,
                owner_address: owner_address,
                name: tokenName, 
                description: tokenSuppDeets.description,
                image: blob,
                properties: {
                    ownership_stage: tokenSuppDeets.stage,
                    recycled: tokenSuppDeets.recycled,
              
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

            var url = await Composable.cache_cid(metadata.url.replace("ipfs://", ""));
            
            return url;
              
    
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
        console.log("Local Structure: ", Composable.get_composable_structure());
        // console.log("Persistent Structure: ", Composable.get_composable_session());

        
        setMintParentOpen(false);
        let result = await erc998Minter.methods.mint(accounts[0], tokenID).send({ 
            from: accounts[0] });  
        let x = erc998Minter.methods.setIsERC721(tokenID).call();
        console.log(result);
            
        var url = await uploadNFT();

        Composable.update_ipfs(accounts[0], tokenID, url);

        console.log("after minting...");
        console.log("Local Structure: ", Composable.get_composable_structure());
        // console.log("Persistent Structure: ", Composable.get_composable_session());
        Composable.updateFlow();
    }

    const mintChildToken = async () => {
        console.log("Minting 1155-child token...");
        setMintChildOpen(false);
        let result = await erc1155Minter.methods.mint(accounts[0], childTokenID, numChildTokens, "0x").send({ 
            from: accounts[0] });
        let x = erc998Minter.methods.setIsERC1155(tokenID).call();
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
        var url = await uploadNFT();
        Composable.setNumTokens(numChildTokens);

        // save ipfs link of child w parent addr + token mapping
        Composable.update_ipfs(childAcc, childTokenID, url);
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
        var parentAcc = await erc998Minter.methods.ownerOf(childTokenID).call();
        console.log("owner of child 998: ", parentAcc);
        var parentAcc2 = await erc998Minter.methods.ownerOf(parentTokenID2).call();
        console.log(erc998Minter.methods);
        let x = await erc998Minter.methods.getIsERC1155(childTokenID).call();
        console.log(x);
        if(x){
            let result = await erc998Minter.methods.safeTransferChildFrom(parentTokenID, addr_to, addr_from, childTokenID, 1, web3.utils.encodePacked(parentTokenID2)).send({ from: accounts[0]});
            console.log(result);
        } else {
            let t = await erc998Minter.methods.safeTransferFrom(parentAcc, accounts[0], childTokenID, web3.utils.encodePacked(parentTokenID)).send({ from: parentAcc });
            console.log(t);
        }
        
            
        
        
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
            console.log("Composable sessionz: ", Composable.get_composable_session());
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
        console.log("child 998 owner addr before transfer: ", accounts[0]);

        let c = await erc998Minter.methods.setApprovalForAll(addr_to, true).send({ from: accounts[0] });
        console.log("set approval call: ", c)
        let t = await erc998Minter.methods.safeTransferFrom(accounts[0], addr_to, childTokenID, web3.utils.encodePacked(parentTokenID)).send({ from: accounts[0] });
        console.log(t);
        console.log("child 998 owner addr after transfer: ", addr_to);

        // let o = await erc998Minter.methods.childBalance(parentTokenID, ERC998ERC1155TopDownPresetMinterPauser.networks[networkId].address, childTokenID).call();
        // console.log("child balance is:", o);

        var parentAcc = await erc998Minter.methods.ownerOf(parentTokenID).call();
        var childAcc = await erc998Minter.methods.getChildContract(parentTokenID, childTokenID).call();

        Composable.setParentContractAddr(parentAcc);
        Composable.setChildContractAddr(childAcc);

        // to save num of child tokens in parents' metadata instead of in child token metadata
        Composable.setNumTokens(0);
        Composable.child_to_update();
        console.log("Generating and uploading child token metadata...");
        var url = await uploadNFT();
        Composable.setNumTokens(1);

        // save ipfs link of child w parent addr + token mapping
        Composable.update_ipfs(childAcc, childTokenID, url);
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

    const transferParent = async () => {
        console.log("Transferring Parent 998 token to another account")
        setTransferParentOpen(false);
        var owner_addr = await erc998Minter.methods.ownerOf(tokenID).call()
        let res = await erc998Minter.methods.safeTransferFrom(accounts[0], accTransferTo, tokenID, web3.utils.encodePacked(tokenID)).send({ from: accounts[0] });
        console.log(res);
        
        console.log(owner_addr)
        let x = await Composable.replace_owner(owner_addr, accTransferTo, tokenID);

        if (x) {
            setNullState();
            console.log("IPFS mappings updated!");
            console.log("Composable structure: ", Composable.get_composable_structure());
            Composable.updateFlow();
        }

        else {
            console.error("Error updating mapping.");
        }
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

        if(name === "tokenSuppDeetsRecycle"){
            setTokenSuppDeets(prevState => ({
                ...prevState,
                recycled : value
            }))
        }

        if(name === "tokenSuppDeetsDesc"){
            setTokenSuppDeets(prevState => ({
                ...prevState,
                description : value
            }))
        }

        if(name === "accTransferFrom"){
            setAccTransferFrom(value)
        }

        if(name === "accTransferTo"){
            setAccTransferTo(value)
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

        if(val === "transferParent"){
            setTransferParentOpen(true);
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

        if(val === "transferParent"){
            setTransferParentOpen(false);
        }
    };

    const MintButton = styled(Button)(({ theme }) => ({
        color: theme.palette.getContrastText(blueGrey[500]),
        backgroundColor: blueGrey[500],
        '&:hover': {
          backgroundColor: teal[700],
        },
    }));

    const TransferButton = styled(Button)(({ theme }) => ({
        color: theme.palette.getContrastText(blue[500]),
        backgroundColor: blueGrey[500],
        '&:hover': {
          backgroundColor: indigo[600],
        },
    }));


    return (
        <div className="button-style-1">
            <MintButton variant="contained" onClick={handleClickOpen} value="parent" >Mint Parent</MintButton>
            <Dialog open={mintParentOpen} onClose={handleClose}> 
                <DialogTitle>Mint</DialogTitle>
                <DialogContent>
                <DialogContentText>
                    Please enter a name, tokenID and other product details for the creation of this NFT. This creates a new ERC-998 token, that can represent the highest level of a composable structure of a supply chain good/product.                
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
                <TextField
                    required
                    label="Recycle Status"
                    name="tokenSuppDeetsRecycle"
                    onChange={handleInputChange}
                />
                 <TextField
                    required
                    label="Product Description"
                    name="tokenSuppDeetsDesc"
                    onChange={handleInputChange}
                />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} value="parent">Cancel</Button>
                    <Button onClick={mintToken}>Mint</Button>
                </DialogActions>
            </Dialog>
            <span>     </span>

            <MintButton variant="contained" onClick={handleClickOpen} value="child">Mint Child</MintButton>
            <Dialog open={mintChildOpen} onClose={handleClose}>
                <DialogTitle>Mint</DialogTitle>
                <DialogContent>
                <DialogContentText>
                    Please enter a name, tokenId, amount of tokens and other product details for a child ERC-1155 NFT. The parent will be an ERC-998 token.
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
                <TextField
                    required
                    label="Recycle Status"
                    name="tokenSuppDeetsRecycle"
                    onChange={handleInputChange}
                />
                 <TextField
                    required
                    label="Product Description"
                    name="tokenSuppDeetsDesc"
                    onChange={handleInputChange}
                />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} value="child">Cancel</Button>
                    <Button onClick={mintChildToken}>Mint</Button>
                </DialogActions>
            </Dialog>
            <span>     </span>

            <TransferButton variant="contained" onClick={handleClickOpen} value="transfer">Transfer Child</TransferButton>
            <Dialog open={transferChild} onClose={handleClose}>
                <DialogTitle>Mint</DialogTitle>
                <DialogContent>
                <DialogContentText>
                    Please enter the parent and child token ID, and the parent token ID you want to transfer the child ERC-1155 token to.
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
            <span>     </span>

            <MintButton variant="contained" onClick={handleClickOpen} value="child998">Mint Child 998</MintButton>
            <Dialog open={mintChild998Open} onClose={handleClose}>
                <DialogTitle>Mint</DialogTitle>
                <DialogContent>
                <DialogContentText>
                    Mint a child ERC-998 token for a ERC-998 parent token. Allows for sub-composable structures to be created, for more complex prodcts or goods.
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
                    label="Recycle Status"
                    name="tokenSuppDeetsRecycle"
                    onChange={handleInputChange}
                />
                 <TextField
                    required
                    label="Product Description"
                    name="tokenSuppDeetsDesc"
                    onChange={handleInputChange}
                />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} value="child998">Cancel</Button>
                    <Button onClick={mintChild998}>Mint</Button>
                </DialogActions>
                
            </Dialog>
            <span>     </span>

            <TransferButton variant="contained" onClick={handleClickOpen} value="transferParent">Transfer Parent</TransferButton>
            <Dialog open={transferParentOpen} onClose={handleClose}>
                <DialogTitle>Mint</DialogTitle>
                <DialogContent>
                <DialogContentText>
                    Please enter owner account, account to transfer to and token ID
                </DialogContentText>
                <TextField
                    required
                    label="Owner"
                    name="accTransferFrom"
                    onChange={handleInputChange}
                />
                <TextField
                    required
                    label="New Owner"
                    name="accTransferTo"
                    onChange={handleInputChange}
                />
                <TextField
                    required
                    label="token ID"
                    name="tokenID"
                    onChange={handleInputChange}
                />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} value="transferParent">Cancel</Button>
                    <Button onClick={transferParent}>Transfer</Button>
                </DialogActions>
            </Dialog>

        </div>  
    ); 

};

export default App;



