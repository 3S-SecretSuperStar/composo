import React, { Component } from "react";
import ERC998ERC1155TopDownPresetMinterPauser from "./contracts/ERC998ERC1155TopDownPresetMinterPauser.json";
// import Item from "./contracts/Item.json";
import ERC998ERC1155TopDown from "./contracts/ERC998ERC1155TopDown.json";
import ERC1155PresetMinterPauser from "./contracts/ERC1155PresetMinterPauser.json";
import getWeb3 from "./getWeb3"; 
import "./App.css";


class App extends Component {
    state = {acc_address: 0, tokenID: 0, loaded:false};
    child = "";

componentDidMount = async () => { 
    try {
        // Get network provider and web3 instance.
        this.web3 = await getWeb3();
        // Use web3 to get the user's accounts.
        this.accounts = await this.web3.eth.getAccounts(); // Get the contract instance.
        const networkId = await this.web3.eth.net.getId(); 
        
        this.ERC998ERC1155TopDownPresetMinterPauser = new this.web3.eth.Contract(
            ERC998ERC1155TopDownPresetMinterPauser.abi, 
            ERC998ERC1155TopDownPresetMinterPauser.networks[networkId] && ERC998ERC1155TopDownPresetMinterPauser.networks[networkId].address,
        );

        this.ERC998ERC1155TopDown = new this.web3.eth.Contract(
            ERC998ERC1155TopDown.abi,
            ERC998ERC1155TopDown.networks[networkId] && ERC998ERC1155TopDown.networks[networkId].address,
        );

        this.ERC1155PresetMinterPauser = new this.web3.eth.Contract(
            ERC1155PresetMinterPauser.abi,
            ERC1155PresetMinterPauser.networks[networkId] && ERC1155PresetMinterPauser.networks[networkId].address,
        );


            
        // this.Item = new this.web3.eth.Contract(
        //     Item.abi,
        //     Item.networks[networkId] && Item.networks[networkId].address,
        // );
        
        // this.listenToPaymentEvent();
        this.setState({loaded: true});

    } 
        
    catch (error) {
        // Catch any errors for any of the above operations.
        alert(`Failed to load web3, accounts, or contract. Check console for details.`,);
        console.error(error);
    }
};

mintToken = async () => {
        
    // console.log("Account 0: ", this.accounts[0]);
    const { acc_address, tokenID } = this.state;
    // console.log("ItemManager", this.ItemManager);
    // console.log(itemName, cost, this.ItemManager);
    // let a = await this.ERC998ERC1155TopDownPresetMinterPauser.new("erc998", "ERC998", "https://ERC998.com/{id}", { from: this.accounts[0] });
    // console.log(this.accounts);
    // console.log(this.ERC998ERC1155TopDownPresetMinterPauser.methods);
    const networkId = await this.web3.eth.net.getId(); 
    let a = ERC998ERC1155TopDownPresetMinterPauser.networks[networkId].address;
    console.log(a);
    let result = await this.ERC998ERC1155TopDownPresetMinterPauser.methods.mint(this.accounts[0], tokenID).send({ 
        from: this.accounts[0] });
    
    // let result = await this.ERC998ERC1155TopDown.methods.safeTransferChildFrom(3, "0xf0F0CE990F5ff84a54C3dbaBB51Dfe6DE151A85b", this.accounts[0], 4, 1, "").send({ 
    //     from: this.accounts[0] });
    // console.log(a);
    // let res2 = await this.ERC998ERC1155TopDown.methods.safeTransferChild
    console.log(result);
    this.mintChildToken();
    
    // alert("Send "+cost+" Wei to "+result.events.SupplyChainStep.returnValues._address);
    // console.log(result);
}

mintChildToken = async () => {
    const { acc_address, tokenID } = this.state;
    
    // console.log("ItemManager", this.ItemManager);
    // console.log(itemName, cost, this.ItemManager);
    // let a = await this.ERC998ERC1155TopDownPresetMinterPauser.new("erc998", "ERC998", "https://ERC998.com/{id}", { from: this.accounts[0] });
    // let a = await ERC1155("random", { from: this.accounts[0] });
   // let a = await ERC1155PresetMinterPauser.new("test", { from: this.accounts[0] });
    let a = parseInt(tokenID);
    console.log(a + 1);
    const networkId = await this.web3.eth.net.getId(); 
    let addr = ERC1155PresetMinterPauser.networks[networkId].address;
    let result = await this.ERC1155PresetMinterPauser.methods.mint(this.accounts[0], a + 1, 1, "0x").send({ 
        from: this.accounts[0] });
    
    // console.log(a);
    // let res2 = await this.ERC998ERC1155TopDown.methods.safeTransferChild
    console.log(result);
}

transferToken = async () => {
    // const { acc_address, tokenID } = this.state;
    // console.log(this.ERC1155PresetMinterPauser.address);
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

handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value; const name = target.name;
    
    this.setState({
        [name]: value
    });
}

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


render() {
    if (!this.state.loaded) {
        return <div>Loading Web3, accounts, and contract...</div>;
    } 
    
    return (
        <div className="App">
            <h1>Simply Payment/Supply Chain Example</h1> <h2>Items</h2>
            <h2>Items</h2>
            Account Address: <input type="text" name="acc_address" value={this.state.acc_address} onChange={this.handleInputChange} />
            Token ID: <input type="text" name="tokenID" value={this.state.tokenID} onChange={this.handleInputChange} />
            <button type="button" onClick={this.mintToken}>Mint</button><br></br>
            <button type="button" onClick={this.transferToken}>Transfer</button>
        </div>
    ); 
}

}


export default App;