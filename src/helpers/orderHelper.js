const Product = require("../models/product");
const ShopOrder = require("../models/shopOrder");

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
            quantity: item.quantity,
            price: item.price,
        });

        shopOrders[shopId].totalAmount += item.price * item.quantity;
    }

    // Save each shop-specific order
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
    }
};

module.exports = createShopOrders;