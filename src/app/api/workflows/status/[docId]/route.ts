import { NextRequest, NextResponse } from 'next/server';
import { getPayloadHMR } from '@payloadcms/next/utilities';
import configPromise from '@payload-config';

export async function GET(
    request: NextRequest,
    { params }: { params: { docId: string } }
) {
    try {
        const payload = await getPayloadHMR({ config: configPromise });
        const { docId } = params;

        if (!docId) {
            return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
        }

        // Get document workflows
        const documentWorkflows = await payload.find({
            collection: 'document-workflows',
            where: { documentId: { equals: docId } }
        });

        if (documentWorkflows.docs.length === 0) {
            return NextResponse.json({ error: 'No workflows found' }, { status: 404 });
        }

        // Get workflow details for each document workflow
        const workflows = await Promise.all(
            documentWorkflows.docs.map(async (docWorkflow) => {
                const workflow = await payload.findByID({
                    collection: 'workflows',
                    id: docWorkflow.workflowId,
                });

                const steps = await payload.find({
                    collection: 'workflow-steps',
                    where: { workflowId: { equals: docWorkflow.workflowId } },
                    sort: 'order'
                });

                return {
                    workflowDetails: workflow,
                    steps: steps.docs,
                    currentStep: docWorkflow.currentStep,
                    status: docWorkflow.status
                };
            })
        );

        return NextResponse.json({
            success: true,
            documentId: docId,
            workflows
        });

    } catch (error) {
        console.error('Error fetching workflow status:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}