import moogoose from 'mongoose';

const resourcesSchema = new moogoose.Schema(
    {
        projectId: {
            type: String,
            required: true
        },
        character: [
            {
                name: String,
                description: String,
                images: [
                    {
                        url: String,
                        description: String
                    }
                ]
            }
        ],
        background: [
            {
                name: String,
                description: String,
                images: [
                    {
                        url: String,
                        description: String
                    }
                ]
            }
        ],
        object: [
            {
                name: String,
                description: String,
                images: [
                    {
                        url: String,
                        description: String
                    }
                ]
            }
        ],
        others: [
            {
                name: String,
                description: String,
                images: [
                    {
                        url: String,
                        description: String
                    }
                ]
            }
        ],
    }
);

export default resourcesSchema;