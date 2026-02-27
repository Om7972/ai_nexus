import mongoose from 'mongoose';

const imageAssetSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
        },
        prompt: {
            type: String,
        },
        type: {
            type: String,
            enum: ['generation', 'processing'],
            required: true,
        },
        toolUsed: {
            type: String,
            required: true,
        },
        originalImageUrl: {
            type: String,
        },
        processedImageUrl: {
            type: String,
            required: true,
        },
        format: {
            type: String,
        },
        size: {
            type: Number,
        },
        resolution: {
            type: String,
        },
    },
    { timestamps: true }
);

const ImageAsset = mongoose.model('ImageAsset', imageAssetSchema);

export default ImageAsset;
