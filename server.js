const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const helmet = require('helmet')
const user = require('./routes/user.route');
const product = require('./routes/product.route');
const inventory = require('./routes/inventory.route');
const transaction = require('./routes/transaction.route');

const app = express();
let dev_db_url = 'mongodb://localhost:27017/productapp';
const mongoDB = process.env.MONGODB_URI || dev_db_url;
mongoose.connect(mongoDB, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(helmet())
app.use(bodyParser.json());
app.use(function(err, req, res, next) {
    if (err instanceof SyntaxError && err.status === 400) {
      res.status(400).json({ status: 'error', msg: 'Invalid input', reason: ["Invalid JSON Format"] });
    }
});
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/user', user);
app.use('/product', product);
app.use('/inventory', inventory);
app.use('/transaction', transaction);

let port = 1234;

app.listen(port, () => {
    console.log('Server is up and running on port number ' + port);
});