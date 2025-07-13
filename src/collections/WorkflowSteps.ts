import { CollectionConfig } from "payload";

const WorkflowSteps: CollectionConfig = {
  slug: 'workflow-steps',
  fields: [
    {
      name: 'workflowId',
      type: 'text',
      required: true,
    },
    {
      name: 'stepName',
      type: 'text',
      required: true,
    },
    {
      name: 'order',
      type: 'number',
      required: true,
    },
  ],
};

export default WorkflowSteps;