// importing mongoose
const mongoose = require("mongoose");

const AtrribiuteSchema = new mongoose.Schema({
    token_attributesList: [Object]
})

const ChildTokenSchema = new mongoose.Schema({
    token_id: Number,
    token_contract_addr: String,
    token_attributes: AtrribiuteSchema
})

const TokenIdSchema = new mongoose.Schema({
    token_id: Number,
    child_tokens: [ChildTokenSchema],
    token_attributes: AtrribiuteSchema
}, { _id: true });


const RootAddrSchema = new mongoose.Schema({
    token_contract_addr: String,
    token_ids: [TokenIdSchema]
}, { _id: true });



const ParentSchema = mongoose.Schema({
    parent_deets: RootAddrSchema,
}, { _id: true });

// exporting module for external usage 
module.exports = mongoose.model("ParentSchema", ParentSchema);