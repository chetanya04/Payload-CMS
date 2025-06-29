import { processWorkflow } from "@/utils/workflowEngine";
import WorkflowStatus from "@/components/WorkflowStatus"; // Adjust path as needed
import { CollectionConfig } from 'payload';
const Blog: CollectionConfig = {
  slug: 'blog',
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation === 'create') {
          try {
            // Find workflow
            const workflows = await req.payload.find({
              collection: 'workflows',
              where: { name: { equals: 'Blog Approval' } }
            });
            if (workflows.docs.length > 0) {
              // Create document workflow
              await req.payload.create({
                collection: 'document-workflows',
                data: {
                  documentId: doc.id,
                  collection: 'blog',
                  workflowId: workflows.docs[0].id,
                  currentStep: 0,
                  status: 'pending'
                }
              });
              // Create workflow log
              await req.payload.create({
                collection: 'workflow-logs',
                data: {
                  documentId: doc.id,
                  collection: 'blog',
                  stepId: '1',
                  action: 'commented',
                  userId: req.user?.id || 'system',
                  comment: 'Workflow started'
                }
              });
              // Process workflow
              await processWorkflow(doc.id, doc, req.payload);
            }
          } catch (error) {
            console.error('Workflow creation failed:', error);
          }
        }
      }
    ]
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      defaultValue: 'draft',
    },
    // Add a custom UI field to display the workflow component
    {
      name: 'workflowStatus',
      type: 'ui',
      admin: {
        components: {
          Field: WorkflowStatus as any,
        },
        condition: (data: any) => {
          return Boolean(data?.id);
        }
      }
    }
  ],
};
export default Blog;