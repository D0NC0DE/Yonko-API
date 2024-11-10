const Product = require('../models/product');
const Cart = require('../models/cart');
const { ErrorHandler } = require('../utils/errorHandler');

async function findExistingProductIndex(cartItems, productId, selectedVariantId, selectedOptionId) {
    return cartItems.findIndex(
        (item) =>
            item.productId.toString() === productId.toString() &&
            (item.selectedVariantId?.toString() === selectedVariantId?.toString() || (!item.selectedVariantId && !selectedVariantId)) &&
            (item.selectedOptionId?.toString() === selectedOptionId?.toString() || (!item.selectedOptionId && !selectedOptionId))
    );
}

async function calculateTotalPrice(product, quantity, selectedVariantId, selectedOptionId, selectedAddOns) {
    let totalPrice = product.basePrice * quantity;

    if (selectedVariantId && !selectedOptionId) {
        const variant = product.variants.variantValues.find(vv => vv._id.toString() === selectedVariantId.toString());
        if (!variant) {
            throw new ErrorHandler(400, 'Selected variant does not belong to the product.');
        }
        totalPrice = (variant.price ?? product.basePrice) * quantity;
    }

    if (selectedOptionId && selectedVariantId) {
        const variant = product.variants.variantValues.find(vv => vv._id.toString() === selectedVariantId.toString());
        if (!variant) {
            throw new ErrorHandler(400, 'Selected variant does not belong to the product.');
        }
        const option = variant.options.optionValues.find(o => o._id.toString() === selectedOptionId.toString());
        if (!option) {
            throw new ErrorHandler(400, 'Selected option does not belong to the variant.');
        }
        totalPrice = (option.price ?? totalPrice) * quantity;
    }

    if (selectedAddOns && selectedAddOns.length > 0) {
        selectedAddOns.forEach(addOn => {
            const productAddOn = product.addOns.find(pAddOn => pAddOn._id.toString() === addOn.addOnId.toString());
            if (!productAddOn) {
                throw new ErrorHandler(400, `Add-on with ID ${addOn.addOnId} does not belong to the product.`);
            }
            totalPrice += productAddOn.price * addOn.quantity;
        });
    }

    return totalPrice;
}

async function addItemToCart(userId, productId, quantity, selectedVariantId, selectedOptionId, selectedAddOns) {
    const product = await Product.findById(productId);
    if (!product) {
        throw new ErrorHandler(404, 'Product not found.');
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
        cart = new Cart({ userId, items: [], totalAmount: 0 });
    }

    const totalPrice = await calculateTotalPrice(product, quantity, selectedVariantId, selectedOptionId, selectedAddOns);
    const existingProductIndex = await findExistingProductIndex(cart.items, productId, selectedVariantId, selectedOptionId);

    if (existingProductIndex >= 0) {
        if (selectedAddOns && selectedAddOns.length > 0) {
            selectedAddOns.forEach(addOn => {
                const existingAddOnIndex = cart.items[existingProductIndex].selectedAddOns.findIndex(
                    existingAddOn => existingAddOn.addOnId.toString() === addOn.addOnId.toString()
                );

                if (existingAddOnIndex >= 0) {
                    cart.items[existingProductIndex].selectedAddOns[existingAddOnIndex].quantity += addOn.quantity;
                } else {
                    cart.items[existingProductIndex].selectedAddOns.push(addOn);
                }
            });
        }
        cart.items[existingProductIndex].quantity += quantity;
        cart.items[existingProductIndex].price += totalPrice;
    } else {
        cart.items.push({
            productId,
            quantity,
            price: totalPrice,
            selectedVariantId,
            selectedOptionId,
            selectedAddOns
        });
    }

    cart.totalAmount += totalPrice;

    await cart.save();

    return cart;
}

module.exports = {
    findExistingProductIndex,
    calculateTotalPrice,
    addItemToCart
};
