const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let ProductSchema = new Schema({
    item_ref: { type: Number, required: true, index: { unique: true } },
    title: { type: String, required: [true, 'Product name is required'] },
    last_unique_serial: { type: Number, required: true, default: 0 },
    deleted_at: { type: Date },
    created_at: { type: Date, required: true, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);