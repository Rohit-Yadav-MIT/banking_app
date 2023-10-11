const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB using your srv URL
const mongoURI = 'mongodb+srv://yadavr66752:pass12323@cluster0.th7a4ln.mongodb.net/bank-app';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

// Create a schema for the customer
const customerSchema = new mongoose.Schema({
    name: String,
    email: String,
    balance: Number,
});

const Customer = mongoose.model('Customer', customerSchema);

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' folder
app.use(express.static(__dirname + '/public'));

// View All Customers
app.get('/customers', async (req, res) => {
    const customers = await Customer.find();
    res.json(customers);
});

// View One Customer
app.get('/customers/:id', async (req, res) => {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
});

// Create a New Customer
app.post('/customers', async (req, res) => {
    const { name, email, balance } = req.body;

    if (!name || !email || balance === undefined) {
        return res.status(400).json({ error: 'Missing information for customer creation' });
    }

    const newCustomer = new Customer({
        name,
        email,
        balance,
    });

    try {
        await newCustomer.save();
        res.json(newCustomer);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create a new customer' });
    }
});

// // Transfer Money (Updated with error handling)
// app.post('/transfer', async (req, res) => {
//     const senderId = req.body.sender;
//     const receiverId = req.body.receiver;
//     const amount = parseFloat(req.body.amount);

//     if (!senderId || !receiverId || isNaN(amount) || amount <= 0) {
//         return res.status(400).json({ error: 'Invalid transaction data' });
//     }

//     const sender = await Customer.findById(senderId);
//     const receiver = await Customer.findById(receiverId);

//     if (!sender || !receiver) {
//         return res.status(404).json({ error: 'Sender or receiver not found' });
//     }

//     if (sender.balance < amount) {
//         return res.status(400).json({ error: 'Insufficient funds' });
//     }

//     // Update sender and receiver balances
//     sender.balance -= amount;
//     receiver.balance += amount;

//     // Save the updated balances to the database
//     try {
//         await sender.save();
//         await receiver.save();
//         res.json({ message: 'Transaction successful' });
//     } catch (error) {
//         return res.status(500).json({ error: 'Transaction failed' });
//     }
// });

// Import a library for generating unique IDs
const { v4: uuidv4 } = require('uuid');

// ...

// Transfer Money
app.post('/transfer', async (req, res) => {
    const senderId = req.body.sender;
    const receiverId = req.body.receiver;
    const amount = parseFloat(req.body.amount);

    if (!senderId || !receiverId || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: 'Invalid transaction data' });
    }

    try {
        const sender = await Customer.findById(senderId);
        const receiver = await Customer.findById(receiverId);

        if (!sender) {
            return res.status(404).json({ error: 'Sender not found' });
        }

        if (!receiver) {
            return res.status(404).json({ error: 'Receiver not found' });
        }

        if (sender.balance < amount) {
            return res.status(400).json({ error: 'Insufficient funds' });
        }

        // Update sender and receiver balances
        sender.balance -= amount;
        receiver.balance += amount;

        // Save the updated balances to the database
        await sender.save();
        await receiver.save();

        // Generate a unique transaction ID using uuidv4
        const transactionId = uuidv4();

        // Store transaction details, including the status (e.g., 'success')
        const transaction = {
            id: transactionId,
            sender: senderId,
            receiver: receiverId,
            amount: amount,
            status: 'success', // You can set this to 'failed' if the transaction fails
        };

        // You may want to store transaction details in a database for future reference

        res.json({ message: 'Transaction successful', transaction: transaction });
    } catch (error) {
        console.error('Transaction failed:', error);
    }
});



// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
