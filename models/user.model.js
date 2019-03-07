const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let UserSchema = new Schema({
    cin: { type: String, required: [true, 'CIN is required'], index: { unique: true } },
    company_prefix: { type: String, index: { unique: true }, sparse: true },
    email: { type: String, required: [true, 'Email is required'], index: { unique: true } },
    password: { type: String, required: [true, 'Password is required'] },
    role: { type: String, enum: ['Admin', 'Manufacturer', 'Other'], default: 'Other', required: true },
    last_item_ref: { type: Number, required: true, default: 0 },
    created_at: { type: Date, required: true, default: Date.now },
    deleted_at: { type: Date },
    list: [{ type: Schema.Types.ObjectId, ref: 'Product' }]
});

module.exports = mongoose.model('User', UserSchema);