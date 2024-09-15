const cartSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, 
        items: [
            {
                productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
                quantity: { type: Number, required: true },
                selectedVariant: {
                    variantName: { type: String, default: null },
                    variantValue: { type: String, default: null }
                },
                selectedOptions: [
                    {
                        optionName: { type: String, required: true },
                        optionValue: { type: String, required: true }
                    }
                ],
                selectedAddOns: [
                    {
                        addOnId: { type: Schema.Types.ObjectId, ref: 'AddOn', required: true },
                        quantity: { type: Number, required: true }
                    }
                ]
            }
        ]
    }, 
    { timestamps: true }
);
