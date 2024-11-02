const Cart = require('../../models/cart');
const Product = require('../../models/product');
const { ErrorHandler } = require('../../utils/errorHandler');

exports.addToCart = async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!userId) {
            throw new ErrorHandler(403, 'User not authenticated');
        }

        const { productId, quantity, selectedVariant, selectedOption, selectedAddOns } = req.body;

        // Validate the required fields
        if (!productId || !quantity) {
            throw new ErrorHandler(400, 'Product ID and quantity are required.');
        }

        // Find the product by its ID to ensure it exists
        const product = await Product.findById(productId);
        if (!product) {
            throw new ErrorHandler(404, 'Product not found.');
        }

        let totalPrice = product.basePrice * quantity;

        if (selectedVariant) {
            const variant = product.variants.variantValues.find(vv => vv.value === selectedVariant);
            if (variant) {
                totalPrice = (variant.price || product.basePrice) * quantity;
            }
        }

        if (selectedOption) {
            const variant = product.variants.variantValues.find(vv => vv.value === selectedVariant);
            if (variant) {
                const option = variant.options.optionValues.find(o => o.value === selectedOption);
                if (option) {
                    totalPrice = (option.price || totalPrice) * quantity;
                }
            }
        }

        if (selectedAddOns && selectedAddOns.length > 0) {
            selectedAddOns.forEach(addOn => {
                const productAddOn = product.addOns.find(pAddOn => pAddOn.name === addOn.name);
                if (productAddOn) {
                    totalPrice += productAddOn.price * addOn.quantity;
                }
            });
        }

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        const existingProductIndex = cart.items.findIndex(
            (item) =>
                item.productId.toString() === productId &&
                (item.selectedVariant === selectedVariant || (!item.selectedVariant && !selectedVariant)) &&
                (item.selectedOption === selectedOption || (!item.selectedOption && !selectedOption))
        );

        if (existingProductIndex >= 0) {
            cart.items[existingProductIndex].quantity += quantity;
            cart.items[existingProductIndex].price += totalPrice;

            if (selectedAddOns && selectedAddOns.length > 0) {
                selectedAddOns.forEach(addOn => {
                    const existingAddOnIndex = cart.items[existingProductIndex].selectedAddOns.findIndex(
                        existingAddOn => existingAddOn.name === addOn.name
                    );

                    if (existingAddOnIndex >= 0) {
                        cart.items[existingProductIndex].selectedAddOns[existingAddOnIndex].quantity += addOn.quantity;
                    } else {
                        cart.items[existingProductIndex].selectedAddOns.push(addOn);
                    }
                });
            }
        } else {
            cart.items.push({
                productId,
                quantity,
                price: totalPrice,
                selectedVariant: selectedVariant,
                selectedOption: selectedOption,
                selectedAddOns: selectedAddOns
            });
        }

        // Save the cart
        await cart.save();

        res.status(200).json({
            message: 'Product added to cart successfully',
            cart
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.removeFromCart = async (req, res, next) => {
    try {
        const userId = req.userId; // Assuming you get userId from token or session
        if (!userId) {
            throw new ErrorHandler(403, 'User not authenticated');
        }

        const { productId, selectedVariant, selectedOption } = req.body;

        // Validate the required fields
        if (!productId) {
            throw new ErrorHandler(400, 'Product ID is required.');
        }

        // Find the cart for the user
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            throw new ErrorHandler(404, 'Cart not found for this user.');
        }

        // Find the index of the product in the cart
        const productIndex = cart.items.findIndex(
            (item) =>
                item.productId.toString() === productId &&
                (item.selectedVariant === selectedVariant || (!item.selectedVariant && !selectedVariant)) &&
                (item.selectedOption === selectedOption || (!item.selectedOption && !selectedOption))
        );

        if (productIndex < 0) {
            throw new ErrorHandler(404, 'Product not found in cart.');
        }

        // Remove the product from the cart
        cart.items.splice(productIndex, 1);

        // Save the updated cart
        await cart.save();

        res.status(200).json({
            message: 'Product removed from cart successfully',
            cart
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.reduceQuantity = async (req, res, next) => {
    try {
        const userId = req.userId; // Assuming you get userId from token or session
        if (!userId) {
            throw new ErrorHandler(403, 'User not authenticated');
        }

        const { productId, selectedVariant, selectedOption } = req.body;
        // Validate the required fields
        if (!productId) {
            throw new ErrorHandler(400, 'Product ID is required.');
        }

        // Find the cart for the user
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            throw new ErrorHandler(404, 'Cart not found for this user.');
        }

        // Find the index of the product in the cart
        const productIndex = cart.items.findIndex(
            (item) =>
                item.productId.toString() === productId &&
                item.selectedVariant === selectedVariant &&
                item.selectedOption === selectedOption
        );

        if (productIndex < 0) {
            throw new ErrorHandler(404, 'Product not found in cart.');
        }

        // Reduce the quantity of the product by 1
        if (cart.items[productIndex].quantity > 1) {
            cart.items[productIndex].quantity -= 1;
        } else {
            // If quantity is 1, remove the product from the cart
            cart.items.splice(productIndex, 1);
        }

        // Save the updated cart
        await cart.save();

        res.status(200).json({
            message: 'Product quantity reduced successfully',
            cart
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.clearCart = async (req, res, next) => {
    try {
        const userId = req.userId; // Assuming you get userId from token or session
        if (!userId) {
            throw new ErrorHandler(403, 'User not authenticated');
        }

        // Find the user's cart
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            throw new ErrorHandler(404, 'Cart not found for this user.');
        }

        // Clear all items from the cart
        cart.items = [];

        // Save the updated cart
        await cart.save();

        res.status(200).json({
            message: 'Cart cleared successfully',
            cart
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};


exports.getCart = async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!userId) {
            throw new ErrorHandler(403, 'User not authenticated');
        }

        // Find the user's cart
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            throw new ErrorHandler(404, 'Cart not found for this user.');
        }

        res.status(200).json({
            cart
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};



