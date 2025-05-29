const mongoose = require('mongoose');

// Simple in-memory storage as fallback if MongoDB is not available
let orders = [];
let payments = [];

// Database connection
async function connectDatabase() {
    try {
        if (process.env.MONGODB_URI) {
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('✅ Connected to MongoDB');
            return true;
        } else {
            console.log('⚠️  No MongoDB URI provided, using in-memory storage');
            return false;
        }
    } catch (error) {
        console.log('⚠️  MongoDB connection failed, using in-memory storage:', error.message);
        return false;
    }
}

// Order Schema (for MongoDB)
const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    items: [{ 
        name: String, 
        price: Number, 
        quantity: Number 
    }],
    total: { type: Number, required: true },
    customerEmail: String,
    paymentProvider: String,
    paymentId: String,
    status: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// Simple order management functions
const orderManager = {
    async create(orderData) {
        try {
            if (mongoose.connection.readyState === 1) {
                // Use MongoDB
                const order = new Order(orderData);
                return await order.save();
            } else {
                // Use in-memory storage
                const order = { ...orderData, _id: Date.now().toString() };
                orders.push(order);
                return order;
            }
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    },

    async findById(orderId) {
        try {
            if (mongoose.connection.readyState === 1) {
                return await Order.findOne({ orderId });
            } else {
                return orders.find(order => order.orderId === orderId);
            }
        } catch (error) {
            console.error('Error finding order:', error);
            return null;
        }
    },

    async updateStatus(orderId, status) {
        try {
            if (mongoose.connection.readyState === 1) {
                return await Order.findOneAndUpdate(
                    { orderId }, 
                    { status, updatedAt: new Date() }, 
                    { new: true }
                );
            } else {
                const order = orders.find(order => order.orderId === orderId);
                if (order) {
                    order.status = status;
                    order.updatedAt = new Date();
                }
                return order;
            }
        } catch (error) {
            console.error('Error updating order:', error);
            return null;
        }
    },

    async getAll() {
        try {
            if (mongoose.connection.readyState === 1) {
                return await Order.find().sort({ createdAt: -1 });
            } else {
                return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            }
        } catch (error) {
            console.error('Error getting orders:', error);
            return [];
        }
    }
};

module.exports = {
    connectDatabase,
    orderManager,
    Order
}; 