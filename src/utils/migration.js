const Product = require('../models/product');
// const OldProduct = require('../../bin/product_oldModel');
const connectDB = require('../config/database');
const mongoose = require('mongoose');

// Migration script
connectDB();

// async function migrateProducts() {
//     try {
//         const oldProducts = await OldProduct.find();

//         for (const oldProduct of oldProducts) {
//             const newProduct = new Product({
//                 id: oldProduct.id,
//                 name: oldProduct.name,
//                 description: oldProduct.description,
//                 shopId: oldProduct.shopId,
//                 images: oldProduct.images,
//                 status: oldProduct.status,
//                 category: oldProduct.category,
//                 specifications: oldProduct.specifications,
//                 variants: oldProduct.variants,
//                 addOns: oldProduct.addOns,
//                 basePrice: oldProduct.basePrice,
//                 baseQuantity: oldProduct.baseQuantity,
//                 createdAt: oldProduct.createdAt,
//                 updatedAt: oldProduct.updatedAt,
//             });

//             await newProduct.save();
//         }

//         console.log('Migration completed successfully.');
//     } catch (error) {
//         console.error('Migration failed:', error);
//     } finally {
//         mongoose.connection.close();
//     }
// }

//   migrateProducts();


