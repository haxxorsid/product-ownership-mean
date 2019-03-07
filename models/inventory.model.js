const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let InventorySchema = new Schema({
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    company_prefix: { type: String, required: [true, 'Company prefix is required'] },
    item_ref: { type: Number, required: [true, 'Item reference is required'] },
    unique_serial: { type: Number, required: [true, 'Unique serial number is required'] },
    deleted_at: { type: Date },
    created_at: { type: Date, required: true, default: Date.now }
});

module.exports = mongoose.model('Inventory', InventorySchema);