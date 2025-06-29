import { CollectionConfig } from "payload";

const DocumentWorkflows: CollectionConfig = {
    slug: 'document-workflows',  // Make sure quotes are straight
    fields: [
        {
            name: 'documentId',
            type: 'text',
            required: true,
        },
        {
            name: 'collection',
            type: 'text',
            required: true,
        },
        {
            name: 'workflowId',
            type: 'text',
            required: true,
        },
        {
            name: 'currentStep',
            type: 'number',
            defaultValue: 0,
        },
        {
            name: 'status',
            type: 'select',
            options: [
                { label: 'Pending', value: 'pending' },
                { label: 'Completed', value: 'completed' },
                { label: 'Rejected', value: 'rejected' },
            ],
            defaultValue: 'pending',
        },
    ],
};

export default DocumentWorkflows;