import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    name: String,
    description: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    chapters: [
        {
            name: {
                type: String,
                required: true,
                default: 'Chapter 1'
            },
            shots: [
                {
                    name: {
                        type: String,
                        required: true,
                        default: 'Shot 1'
                    },
                    imageUrl: {
                        character: [
                            {
                                name: String,
                                resourceDescription: String,
                                images: [
                                    {
                                        url: String,
                                        description: String
                                    }
                                ],
                                description: [String],
                                url: [String]
                            }
                        ],
                        background: [
                            {
                                name: String,
                                resourceDescription: String,
                                images: [
                                    {
                                        url: String,
                                        description: String
                                    }
                                ],
                                description: [String],
                                url: [String]
                            }
                        ],
                        object: [
                            {
                                name: String,
                                resourceDescription: String,
                                images: [
                                    {
                                        url: String,
                                        description: String
                                    }
                                ],
                                description: [String],
                                url: [String]
                            }
                        ],
                        others: [
                            {
                                name: String,
                                resourceDescription: String,
                                images: [
                                    {
                                        url: String,
                                        description: String
                                    }
                                ],
                                description: [String],
                                url: [String]
                            }
                        ]
                    },
                    prompt: String,
                    temperature: { type: Number, default: 1 },
                    aspectRatio: { type: String, default: "1:1" },
                    imageSize: { type: String, default: "1k" },
                    outputPath: [String],
                    selectedImagePath: String,
                    generationStatus: {
                        type: String,
                        enum: ['idle', 'generating', 'completed', 'failed'],
                        default: 'idle'
                    },
                    generationError: { type: String, default: '' },
                    generationStartedAt: Date,
                    generationFinishedAt: Date,
                    createdAt: {
                        type: Date,
                        default: Date.now
                    }
                }
            ],
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
});

export default projectSchema;