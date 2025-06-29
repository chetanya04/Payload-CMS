import { CollectionConfig } from "payload";

const WorkflowLogs: CollectionConfig = {
  slug: 'workflow-logs',
  access: {
    update: () => false,
    create: ({ req }) => !!req.user, // ✅ THIS LINE IS REQUIRED
  },
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
      name: 'stepId',
      type: 'text',
      required: true,
    },
    {
      name: 'action',
      type: 'select',
      options: [
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Commented', value: 'commented' },
      ],
      required: true,
    },
    {
      name: 'userId',
      type: 'text',
      required: true,
    },
    {
      name: 'comment',
      type: 'textarea',
    },
  ],
};

export default WorkflowLogs;
