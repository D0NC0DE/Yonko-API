// const Product = require("../models/product");
// const ShopOrder = require("../models/shopOrder");
// const { sendNewOrderEmail } = require("../services/emailService");
// const Shop = require("../models/shop");

// const createShopOrders = async (order) => {
//     const shopOrders = {};

//     for (const item of order.items) {
//         const product = await Product.findById(item.productId);
//         if (!product || !product.shopId) {
//             continue; // Skip items if product or shop ID is missing
//         }

//         const shopId = product.shopId.toString();

//         // Group items by shop ID
//         if (!shopOrders[shopId]) {
//             shopOrders[shopId] = {
//                 shopId: product.shopId,
//                 orderId: order._id,
//                 items: [],
//                 totalAmount: 0,
//             };
//         }

//         shopOrders[shopId].items.push({
//             productId: item.productId,
//             quantity: item.quantity,
//             price: item.price,
//         });

//         shopOrders[shopId].totalAmount += item.price;
//     }

//     // Save each shop-specific order
//     for (const shopId in shopOrders) {
//         const shopOrderData = shopOrders[shopId];
//         const shopOrder = new ShopOrder({
//             shopId: shopOrderData.shopId,
//             orderId: shopOrderData.orderId,
//             items: shopOrderData.items,
//             totalAmount: shopOrderData.totalAmount,
//             status: 'PENDING',
//         });
//         await shopOrder.save();

//         const shop = await Shop.findById(shopId);
//         const orderDetails = {
//             shopName: shop.name,
//             orderItems: shopOrderData.items.map(item => ({
//                 name: item.productId.name,
//                 quantity: item.quantity,
//                 price: item.price,
//             })),
//             totalAmount: shopOrderData.totalAmount,
//             deliveryAddress: "Nigeria",  // TODO: Add delivery address to order
//             deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // TODO: Add delivery date to order
//         };

//         await sendNewOrderEmail(shop.email, orderDetails);
//     }
// };

// module.exports = createShopOrders;


const Product = require("../models/product");
const ShopOrder = require("../models/shopOrder");
const { sendNewOrderEmail } = require("../services/emailService");
const Shop = require("../models/shop");

const createShopOrders = async (order) => {
    const shopOrders = {};

    for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (!product || !product.shopId) {
            continue; // Skip items if product or shop ID is missing
        }

        const shopId = product.shopId.toString();

        // Group items by shop ID
        if (!shopOrders[shopId]) {
            shopOrders[shopId] = {
                shopId: product.shopId,
                orderId: order._id,
                items: [],
                totalAmount: 0,
            };
        }

        shopOrders[shopId].items.push({
            productId: item.productId,
            name: product.name, 
            quantity: item.quantity,
            price: item.price,
        });

        shopOrders[shopId].totalAmount += item.price;
    }

    for (const shopId in shopOrders) {
        const shopOrderData = shopOrders[shopId];
        const shopOrder = new ShopOrder({
            shopId: shopOrderData.shopId,
            orderId: shopOrderData.orderId,
            items: shopOrderData.items,
            totalAmount: shopOrderData.totalAmount,
            status: 'PENDING',
        });
        await shopOrder.save();

        const shop = await Shop.findById(shopId);
        if (shop && shop.email) { 
            const orderDetails = {
                shopName: shop.name,
                orderItems: shopOrderData.items,
                totalAmount: shopOrderData.totalAmount,
                deliveryAddress: "Nigeria", // TODO: Add delivery address to order
                deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // TODO: Add delivery date to order
            };

            await sendNewOrderEmail(shop.email, orderDetails);
        }
    }
};

module.exports = createShopOrders;
