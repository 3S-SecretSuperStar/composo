import React, { Component } from "react";
import ERC998ERC1155TopDownPresetMinterPauser from "./contracts/ERC998ERC1155TopDownPresetMinterPauser.json";
// import Item from "./contracts/Item.json";
import getWeb3 from "./getWeb3"; 
import "./App.css";


class App extends Component {
    state = {cost: 0, itemName: "exampleItem1", loaded:false};

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

handleSubmit = async () => {
        
    // console.log("Account 0: ", this.accounts[0]);
    const { cost, itemName } = this.state;
    // console.log("ItemManager", this.ItemManager);
    // console.log(itemName, cost, this.ItemManager);
    // let a = await this.ERC998ERC1155TopDownPresetMinterPauser.new("erc998", "ERC998", "https://ERC998.com/{id}", { from: this.accounts[0] });
    let result = await this.ERC998ERC1155TopDownPresetMinterPauser.methods.mint(this.accounts[0], 1).send({ 
        from: this.accounts[0] });
    // console.log(a);
    console.log(result);
    
    // alert("Send "+cost+" Wei to "+result.events.SupplyChainStep.returnValues._address);
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
            Cost: <input type="text" name="cost" value={this.state.cost} onChange={this.handleInputChange} />
            Item Name: <input type="text" name="itemName" value={this.state.itemName} onChange={this.handleInputChange} />
            <button type="button" onClick={this.handleSubmit}>Create new Item</button>
        </div>
    ); 
}

}


export default App;