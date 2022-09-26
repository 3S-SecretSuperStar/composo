import React, { useEffect, useState, useCallback } from "react";
// import ReactFlow, {
//   addEdge,
//   MiniMap,
//   Controls,
//   Background,
//   useNodesState,
//   useEdgesState,
// } from 'react-flow-renderer';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import ERC998ERC1155TopDownPresetMinterPauser from "./contracts/ERC998ERC1155TopDownPresetMinterPauser.json";
// import Item from "./contracts/Item.json";
import ERC998ERC1155TopDown from "./contracts/ERC998ERC1155TopDown.json";
import ERC1155PresetMinterPauser from "./contracts/ERC1155PresetMinterPauser.json";
import getWeb3 from "./getWeb3"; 
import "./App.css";
import { nodes as initialNodes, edges as initialEdges } from './initial-elements';
import { NFTStorage } from "nft.storage";


function App() {
    
    const [acc_address, setAccAddr] = useState(0);
    const [tokenID, setTokenID] = useState(0);
    const [loaded, setLoaded] = useState(false);
    const [web3, setWeb3] = useState("undefined");
    const [accounts, setAccount] = useState("");
    const [networkId, setNetworkId] = useState("");
    const [erc998Minter, setERC998Minter] = useState("");
    const [erc998TD, setERC998TD] = useState("");
    const [erc1155Minter, setERC1155Minter] = useState("");
    const [mintParentOpen, setMintParentOpen] = useState(false);
    const [mintChildOpen, setMintChildOpen] = useState(false);
    const [numChildTokens, setNumChildTokens] = useState(0);
    const [tokenName, setTokenName] = useState("");

    async function uploadNFT() {
        const nftStorage = new NFTStorage({token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGNEYTZDMTE0QzkwMUY1RmEyNEYwOTc0ZWM4ZGJlY0I0YzdEQkUxZjciLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2MzU5Mjk5MTUwNywibmFtZSI6InRlc3QifQ._LYiNUkFKxwYCFzO06X6zGAxDrTz6EKp25JvA5J1IE0'});
        var blob = new Blob();
        try {
            
            // Upload NFT to IPFS & Filecoin
            const metadata = await nftStorage.store({
                name: 'Harmony NFT collection',
                description: 'This is a Harmony NFT collenction stored on IPFS & Filecoin.',
                image: blob,
            });
            return metadata;
    
        } catch (error) {
            // setErrorMessage("Could not save NFT to NFT.Storage - Aborted minting.");
            console.log(error);
        }
    }

    // const res = await uploadNFT();

    // component mount
    useEffect(() => {
        
        async function componentDidMount() {
            await loadContracts();
            let res = await uploadNFT();
            console.log(res);
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
            
        let result = await erc998Minter.methods.mint(accounts[0], tokenID).send({ 
            from: accounts[0] });
        
        console.log(result);
        setMintParentOpen(false);
    }

    const mintChildToken = async () => {
        
        let result = await erc1155Minter.methods.mint(accounts[0], tokenID, 1, "0x").send({ 
            from: accounts[0] });
        
       
        console.log(result);
        setMintChildOpen(false);
    }

    const transferToken = async () => {
        
        const networkId = await this.web3.eth.net.getId(); 
        let addr_from = ERC1155PresetMinterPauser.networks[networkId].address;
        console.log(addr_from);
        let addr_to = ERC998ERC1155TopDownPresetMinterPauser.networks[networkId].address;
        // let result = await this.ERC1155PresetMinterPauser.methods.safeTransferFrom(this.accounts[0], addr_to, 2, 1, this.web3.utils.encodePacked(1)).send({ 
        //     from: this.accounts[0] });

        let cb = this.ERC998ERC1155TopDownPresetMinterPauser.methods._balances(3, addr_from, 2).call();
        console.log(cb);

        //let n = await this.ERC998ERC1155TopDownPresetMinterPauser.methods.safeTransferChildFrom(1, addr_to, addr_from, 2, 1, this.web3.utils.encodePacked(3)).send({ from: this.accounts[0]});
        //console.log(n);

        // 
        // console.log(result);
    }

    const handleInputChange = (event) => {
        const target = event.target;
        const value = target.value; 
        const name = target.name;
        
        // this.setState({
        //     [name]: value
        // });
        if(name == "acc_address"){
            setAccAddr(value);
        } 

        if(name == "tokenID"){
            setTokenID(value);
        }

        if(name == "tokenName"){
            setTokenName(value);
        }

        if(name == "numTokens"){
            setNumChildTokens(value);
        }
    }

    const handleClickOpen = (event) => {
        const target = event.target;
        const val = target.value;
        
        if(val == "parent"){
            setMintParentOpen(true);
        }

        if(val == "child"){
            setMintChildOpen(true);
        }   
    };

    const handleClose = (event) => {
        const target = event.target;
        const val = target.value;
        
        if(val == "parent"){
            setMintParentOpen(false);
        }

        if(val == "child"){
            setMintChildOpen(false);
        }
    };

    // listenToPaymentEvent = () => {
    //     let self = this;
    //     this.ItemManager.events.SupplyChainStep().on("data", async function(evt){
        
    //     if (evt.returnValues._step === "1") {
    //         let itemPaid = await self.ItemManager.methods.items(evt.returnValues._itemindex - 1).call();
    //         console.log(itemPaid);
    //         alert("item "+ itemPaid._identifier + " was paid, deliver it now!"); 
    //         console.log("item "+ itemPaid._identifier + " was paid, deliver it now!"); 
            
    //     };
            
    //     console.log(evt);
    //     });
    // }



    // render() {
    //     if (!this.state.loaded) {
    //         return <div>Loading Web3, accounts, and contract...</div>;
    //     } 

        
        
        
    // }

    // const onInit = (reactFlowInstance) => console.log('flow loaded:', reactFlowInstance);

    // const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    // const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    // const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

    return (
        // <div className="App" style={{ height: 800 }}>
        //     <h1>Simply Payment/Supply Chain Example</h1> 
        //     <h2>Items</h2>
        //     Account Address: <input type="text" name="acc_address" value={acc_address} onChange={handleInputChange} />
        //     Token ID: <input type="text" name="tokenID" value={tokenID} onChange={handleInputChange} />
        //     <button type="button" onClick={mintToken}>Mint</button><br></br>
        //     <button type="button" onClick={transferToken}>Transfer</button> 
            
        // </div>
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
                    label="name"
                    name="tokenName"
                    onChange={handleInputChange}
                />
                <TextField
                    required
                    label="id"
                    name="tokenID"
                    onChange={handleInputChange}
                />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
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
                    label="name"
                    name="tokenName"
                    onChange={handleInputChange}
                />
                <TextField
                    required
                    label="id"
                    name="tokenID"
                    onChange={handleInputChange}
                />
                <TextField
                    required
                    label="amount"
                    name="numTokens"
                    onChange={handleInputChange}
                />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={mintChildToken}>Mint</Button>
                </DialogActions>
            </Dialog>
        </div>
        
    ); 

};


export default App;