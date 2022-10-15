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


var ownership_struct = {}

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
                owner_address: accAddress,
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
                        token_id: "parent token id"
                      }
                    ],
              
                    child_tokens: [
                      {
                        contract_address: "child contract address",
                        token_id: "child token id"
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
            
        setMintParentOpen(false);
        let result = await erc998Minter.methods.mint(accounts[0], tokenID).send({ 
            from: accounts[0] });
        
        console.log(result);
        // setMintParentOpen(false);
    }

    const mintChildToken = async () => {
        
        setMintChildOpen(false);
        let result = await erc1155Minter.methods.mint(accounts[0], childTokenID, numChildTokens, "0x").send({ 
            from: accounts[0] });
        console.log(result);
        let addr_to = ERC998ERC1155TopDownPresetMinterPauser.networks[networkId].address;
        let t = await erc1155Minter.methods.safeTransferFrom(accounts[0], addr_to, childTokenID, parentTokenID, web3.utils.encodePacked(parentTokenID)).send({ from: accounts[0] });
        console.log(t);
       
        
        // transferChildToParent();
        
    }

    const transferChildToParent = async () => {
        
        setTransferChild(false);
        let addr_from = ERC1155PresetMinterPauser.networks[networkId].address;
        console.log(addr_from);
        let addr_to = ERC998ERC1155TopDownPresetMinterPauser.networks[networkId].address;
        // let result = await erc1155Minter.methods.safeTransferFrom(accounts[0], addr_to, childTokenID, parentTokenID, web3.utils.encodePacked(parentTokenID)).send({ 
        //     from: accounts[0] });

        

        let n = await erc998Minter.methods.safeTransferChildFrom(parentTokenID, addr_to, addr_from, childTokenID, 1, web3.utils.encodePacked(parentTokenID2)).send({ from: accounts[0]});
        console.log(n);

        // let o = erc998Minter.methods.getOwner(1).call();
        // console.log("owner is :", o);

        // let m = erc998Minter.methods.getMsgSender().call();
        // console.log("msg sender is: ", m);

        // console.log(accounts[0]);

        let cb = erc998Minter.methods._balances(1, addr_from, 2).call();
        console.log(cb);

        // 
        // console.log(result);
    }

    const mintChild998 = async () => {
        setMintChildOpen(false);
        let result = await erc998Minter.methods.mint(accounts[0], childTokenID,).send({ 
            from: accounts[0] });
        console.log(result);
        let addr_to = ERC998ERC1155TopDownPresetMinterPauser.networks[networkId].address;
        let t = await erc998Minter.methods.safeTransferFrom(accounts[0], addr_to, childTokenID, "0x").send({ from: accounts[0] });
        console.log(t);
    }

    const handleInputChange = (event) => {
        const target = event.target;
        const value = target.value; 
        const name = target.name;
        
        // this.setState({
        //     [name]: value
        // });
        if(name == "accAddress"){
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


        if(name == "parentTokenID"){
            setParentTokenID(value);
        }

        if(name == "parentTokenID2"){
            setParentTokenID2(value);
        }

        if(name == "childTokenID"){
            setChildTokenID(value);
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
        
        if(val == "transfer"){
            setTransferChild(true);
        }
    };

    const handleClose = (event) => {
        const target = event.target;
        const val = target.value;
        console.log(val)
        
        if(val == "parent"){
            setMintParentOpen(false);
        }

        if(val == "child"){
            setMintChildOpen(false);
        }

        if(val == "transfer"){
            setTransferChild(false);
        }
    };

   



    

    const onInit = (reactFlowInstance) => console.log('flow loaded:', reactFlowInstance);

    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes]
    );
    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [setEdges]
    );
    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    return (
        
        // <div>
        
        <ReactFlowProvider>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={onInit}
                fitView
                attributionPosition="top-right"
            >
                <MiniMap
                nodeStrokeColor={(n) => {
                    if (n.style?.background) return n.style.background;
                    if (n.type === 'input') return '#0041d0';
                    if (n.type === 'output') return '#ff0072';
                    if (n.type === 'default') return '#1a192b';
        
                    return '#eee';
                }}
                nodeColor={(n) => {
                    if (n.style?.background) return n.style.background;
        
                    return '#fff';
                }}
                nodeBorderRadius={2}
                />
                <Controls />
                <Background color="#aaa" gap={16} />
            </ReactFlow>
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
                    label="name"
                    name="tokenName"
                    onChange={handleInputChange}
                />
                <TextField
                    required
                    label="parent ID"
                    name="parentTokenID"
                    onChange={handleInputChange}
                />
                <TextField
                    required
                    label="id"
                    name="childTokenID"
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
                    label="Parent ID"
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
                    label="Parent ID 2"
                    name="parentTokenID2"
                    onChange={handleInputChange}
                />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} value="transfer">Cancel</Button>
                    <Button onClick={transferChildToParent}>Transfer</Button>
                </DialogActions>
            </Dialog>

            <Button variant="outlined" onClick={handleClickOpen} value="child">Mint Child 998</Button>
            <Dialog open={mintChildOpen} onClose={handleClose}>
                <DialogTitle>Mint</DialogTitle>
                <DialogContent>
                <DialogContentText>
                    Mint Child 998 Token
                </DialogContentText>
                <TextField
                    required
                    label="name"
                    name="tokenName"
                    onChange={handleInputChange}
                />
                <TextField
                    required
                    label="parent ID"
                    name="parentTokenID"
                    onChange={handleInputChange}
                />
                <TextField
                    required
                    label="id"
                    name="childTokenID"
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
                    <Button onClick={handleClose} value="child">Cancel</Button>
                    <Button onClick={mintChild998}>Mint</Button>
                </DialogActions>
            </Dialog>
        </ReactFlowProvider>


        //</div>
        
        
    ); 

};


export default App;