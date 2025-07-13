import { NextRequest, NextResponse } from 'next/server';
import { getPayloadHMR } from '@payloadcms/next/utilities';
import configPromise from '@payload-config';

export async function POST(request: NextRequest) {
    try {
        const payload = await getPayloadHMR({ config: configPromise });
        const { documentId, collection, workflowId } = await request.json();

        // Validate required fields
        if (!documentId || !collection || !workflowId) {
            return NextResponse.json(
                { error: 'Missing required fields: documentId, collection, workflowId' },
                { status: 400 }
            );
        }

        // Check if workflow exists and is active
        const workflow = await payload.findByID({
            collection: 'workflows',
            id: workflowId,
        });

        if (!workflow || !workflow.isActive) {
            return NextResponse.json({ error: 'Workflow not found or inactive' }, { status: 404 });
        }

        // Check if workflow already exists for this document
        const existingWorkflow = await payload.find({
            collection: 'document-workflows',
            where: {
                and: [
                    { documentId: { equals: documentId } },
                    { collection: { equals: collection } },
                    { workflowId: { equals: workflowId } }
                ]
            }
        });

        if (existingWorkflow.docs.length > 0) {
            return NextResponse.json({ error: 'Workflow already exists for this document' }, { status: 409 });
        }

        // Create new document workflow
        const documentWorkflow = await payload.create({
            collection: 'document-workflows',
            data: {
                documentId,
                collection,
                workflowId,
                currentStep: 0,
                status: 'pending',
            }
        });

        return NextResponse.json({
            success: true,
            documentWorkflow,
            message: 'Workflow triggered successfully'
        });

    } catch (error) {
        console.error('Error triggering workflow:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}