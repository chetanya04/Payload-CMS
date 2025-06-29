export const evaluateConditions = (doc: any, conditions: string): boolean => {
    if (!conditions) return true;

    // Simple condition check (e.g., "amount > 10000")
    if (conditions.includes('amount >')) {
        const threshold = parseInt(conditions.split('>')[1].trim());
        return doc.amount > threshold;
    }

    return true;
};

export const getNextStep = async (workflowId: string, currentStep: number, payload: any) => {
    const steps = await payload.find({
        collection: 'workflow-steps',
        where: { workflowId: { equals: workflowId } },
        sort: 'order'
    });

    return steps.docs[currentStep + 1] || null;
};

export const checkPermissions = (user: any, requiredRole: string): boolean => {
    return user.role === requiredRole;
};

export const updateWorkflowStatus = async (docWorkflowId: string, status: string, payload: any) => {
    await payload.update({
        collection: 'document-workflows',
        id: docWorkflowId,
        data: { status }
    });
};

export const sendNotification = (message: string) => {
    console.log(`📧 NOTIFICATION: ${message}`);
};

export const processWorkflow = async (docId: string, doc: any, payload: any) => {
    // Find workflow instance
    const instance = await payload.find({
        collection: 'document-workflows',
        where: { documentId: { equals: docId } }
    });

    if (!instance.docs[0]) return;

    const workflowInstance = instance.docs[0];
    const nextStep = await getNextStep(workflowInstance.workflowId, workflowInstance.currentStep, payload);

    if (!nextStep) {
        await updateWorkflowStatus(workflowInstance.id, 'completed', payload);
        sendNotification(`Workflow completed for document ${docId}`);
        return;
    }

    // Evaluate conditions
    if (evaluateConditions(doc, nextStep.conditions)) {
        sendNotification(`Step ${nextStep.stepName} needs approval for document ${docId}`);
    }
};