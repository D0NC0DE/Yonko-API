const { addItemToCart, findExistingProductIndex } = require('../../helpers/cartHelper');
const Cart = require('../../models/cart');
const Product = require('../../models/product');
const { ErrorHandler } = require('../../utils/errorHandler');

// function findExistingProductIndex(cartItems, productId, selectedVariantId, selectedOptionId) {
//     return cartItems.findIndex(
//         (item) =>
//             item.productId.toString() === productId &&
//             (item.selectedVariantId?.toString() === selectedVariantId || (!item.selectedVariantId && !selectedVariantId)) &&
//             (item.selectedOptionId?.toString() === selectedOptionId || (!item.selectedOptionId && !selectedOptionId))
//     );
// }

exports.addToCart = async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!userId) {
            throw new ErrorHandler(403, 'User not authenticated');
        }

        const { productId, quantity, selectedVariantId, selectedOptionId, selectedAddOns } = req.body;
        if (!productId || !quantity) {
            throw new ErrorHandler(400, 'Product ID and quantity are required.');
        }

        const cart = await addItemToCart(userId, productId, quantity, selectedVariantId, selectedOptionId, selectedAddOns);

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

// exports.addToCart = async (req, res, next) => {
//     try {
//         const userId = req.userId;
//         if (!userId) {
//             throw new ErrorHandler(403, 'User not authenticated');
//         }

//         const { productId, quantity, selectedVariantId, selectedOptionId, selectedAddOns } = req.body;
//         if (!productId || !quantity) {
//             throw new ErrorHandler(400, 'Product ID and quantity are required.');
//         }

//         const product = await Product.findById(productId);
//         if (!product) {
//             throw new ErrorHandler(404, 'Product not found.');
//         }

//         let totalPrice = product.basePrice * quantity;

//         if (selectedVariantId && !selectedOptionId) {
//             const variant = product.variants.variantValues.find(vv => vv._id.toString() === selectedVariantId);
//             if (!variant) {
//                 throw new ErrorHandler(400, 'Selected variant does not belong to the product.');
//             }
//             totalPrice = (variant.price ?? product.basePrice) * quantity;
//         }

//         if (selectedOptionId && selectedVariantId) {
//             const variant = product.variants.variantValues.find(vv => vv._id.toString() === selectedVariantId);
//             if (!variant) {
//                 throw new ErrorHandler(400, 'Selected variant does not belong to the product.');
//             }
//             const option = variant.options.optionValues.find(o => o._id.toString() === selectedOptionId);
//             if (!option) {
//                 throw new ErrorHandler(400, 'Selected option does not belong to the variant.');
//             }
//             totalPrice = (option.price ?? totalPrice) * quantity;
//         }

//         if (selectedAddOns && selectedAddOns.length > 0) {
//             selectedAddOns.forEach(addOn => {
//                 const productAddOn = product.addOns.find(pAddOn => pAddOn._id.toString() === addOn.addOnId);
//                 if (!productAddOn) {
//                     throw new ErrorHandler(400, `Add-on with ID ${addOn.addOnId} does not belong to the product.`);
//                 }
//                 totalPrice += productAddOn.price * addOn.quantity;
//             });
//         }

//         let cart = await Cart.findOne({ userId });
//         if (!cart) {
//             cart = new Cart({ userId, items: [], totalAmount: 0 });
//         }

//         const existingProductIndex = findExistingProductIndex(cart.items, productId, selectedVariantId, selectedOptionId);

//         if (existingProductIndex >= 0) {
//             if (selectedAddOns && selectedAddOns.length > 0) {
//                 selectedAddOns.forEach(addOn => {
//                     const existingAddOnIndex = cart.items[existingProductIndex].selectedAddOns.findIndex(
//                         existingAddOn => existingAddOn.addOnId.toString() === addOn.addOnId
//                     );

//                     if (existingAddOnIndex >= 0) {
//                         cart.items[existingProductIndex].selectedAddOns[existingAddOnIndex].quantity += addOn.quantity;
//                     } else {
//                         cart.items[existingProductIndex].selectedAddOns.push(addOn);
//                     }
//                 });
//             }
//             cart.items[existingProductIndex].quantity += quantity;
//             cart.items[existingProductIndex].price += totalPrice;
//         } else {
//             cart.items.push({
//                 productId,
//                 quantity,
//                 price: totalPrice,
//                 selectedVariantId: selectedVariantId,
//                 selectedOptionId: selectedOptionId,
//                 selectedAddOns: selectedAddOns
//             });
//         }

//         cart.totalAmount += totalPrice;

//         // Save the cart
//         await cart.save();

//         res.status(200).json({
//             message: 'Product added to cart successfully',
//             cart
//         });
//     } catch (err) {
//         if (!err.statusCode) {
//             err.statusCode = 500;
//         }
//         next(err);
//     }
// };

exports.removeFromCart = async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!userId) {
            throw new ErrorHandler(403, 'User not authenticated');
        }

        const { productId, selectedVariantId, selectedOptionId } = req.body;
        if (!productId) {
            throw new ErrorHandler(400, 'Product ID is required.');
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            throw new ErrorHandler(404, 'Cart not found for this user.');
        }

        const productIndex = findExistingProductIndex(cart.items, productId, selectedVariantId, selectedOptionId);
        if (productIndex < 0) {
            throw new ErrorHandler(404, 'Product not found in cart.');
        }

        const removedItem = cart.items[productIndex];
        cart.totalAmount -= removedItem.price;
        cart.items.splice(productIndex, 1);
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
        const userId = req.userId;
        if (!userId) {
            throw new ErrorHandler(403, 'User not authenticated');
        }

        const { productId, selectedVariantId, selectedOptionId } = req.body;
        if (!productId) {
            throw new ErrorHandler(400, 'Product ID is required.');
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            throw new ErrorHandler(404, 'Cart not found for this user.');
        }

        const product = await Product.findById(productId);
        if (!product) {
            throw new ErrorHandler(404, 'Product not found.');
        }

        const productIndex = findExistingProductIndex(cart.items, productId, selectedVariantId, selectedOptionId);
        if (productIndex < 0) {
            throw new ErrorHandler(404, 'Product not found in cart.');
        }

        // Calculate the price to reduce
        let totalPrice = product.basePrice;

        if (selectedVariantId && !selectedOptionId) {
            const variant = product.variants.variantValues.find(v => v._id.toString() === selectedVariantId);
            if (!variant) {
                throw new ErrorHandler(400, 'Selected variant does not belong to the product.');
            }
            totalPrice = variant.price ?? product.basePrice;

        }

        if (selectedOptionId && selectedVariantId) {
            const variant = product.variants.variantValues.find(v => v._id.toString() === selectedVariantId);
            if (!variant) {
                throw new ErrorHandler(400, 'Selected variant does not belong to the product.');
            }
            const option = variant.options.optionValues.find(o => o._id.toString() === selectedOptionId);
            if (!option) {
                throw new ErrorHandler(400, 'Selected option does not belong to the variant.');
            }
            totalPrice = option.price ?? totalPrice;
        }

        if (cart.items[productIndex].quantity > 1) {
            cart.items[productIndex].quantity -= 1;
            cart.items[productIndex].price -= totalPrice;

            if (cart.items[productIndex].price < 0) {
                cart.items[productIndex].price = 0;
            }
        } else {
            cart.totalAmount -= cart.items[productIndex].price;
            cart.items.splice(productIndex, 1);
        }

        cart.totalAmount -= totalPrice;
        if (cart.totalAmount < 0) {
            cart.totalAmount = 0;
        }
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
};


exports.clearCart = async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!userId) {
            throw new ErrorHandler(403, 'User not authenticated');
        }

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            throw new ErrorHandler(404, 'Cart not found for this user.');
        }

        cart.items = [];
        cart.totalAmount = 0;
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

        // const cart = await Cart.findOne({ userId }).populate({
        //     path: 'items.productId',
        //     select: '_id name images'
        // });
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

//TODO: Remove Addon from Cart
// Max quantity of a product in cart
// Populate product details in cart
