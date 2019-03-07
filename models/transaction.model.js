const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shortid = require('shortid');

let TransactionSchema = new Schema({
    id: {type: String, required: [true, 'ID is required'], default: shortid.generate, index: {unique: true}},
    sender: {type: Schema.Types.ObjectId, ref: 'User'},
    receiver: {type: Schema.Types.ObjectId, ref: 'User'},
    list: [{type: Schema.Types.ObjectId, ref: 'Inventory'}],
    status: {type: String, enum: ['Done', 'Pending', 'Cancelled By Sender', 'Cancelled By Receiver'], required: true, default: 'Pending'},
    created_at: {type: Date, required: true, default: Date.now},
    deleted_at: {type: Date}
});

module.exports = mongoose.model('Transaction', TransactionSchema);