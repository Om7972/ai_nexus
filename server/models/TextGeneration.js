import mongoose from 'mongoose';

const textGenerationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
        },
        prompt: {
            type: String,
            required: [true, 'Prompt is required'],
        },
        tone: {
            type: String,
            required: true,
        },
        model: {
            type: String,
            required: true,
        },
        length: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        tokensUsed: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

const TextGeneration = mongoose.model('TextGeneration', textGenerationSchema);

export default TextGeneration;
