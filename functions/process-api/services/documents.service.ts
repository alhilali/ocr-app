import { Logger } from '@aws-lambda-powertools/logger';
import { v4 } from 'uuid';
import DynamoCustomClient from '/opt/nodejs/common/utils/dynamodb';

const logger = new Logger({ serviceName: 'DocumentsService' });

// DynamoDB
const docsTableName = String(process.env.DOCS_TABLE);
const outputTableName = String(process.env.OUTPUTS_TABLE);
const ddb = new DynamoCustomClient();

// Bucket Name
const documentBucket = String(process.env.DOCS_BUCKET);

export async function createDocument(keys: any[], department?: string) {
    const documents: any[] = [];
    for await (const element of keys) {
        const documentId = v4(); // Generate random uuid

        // Create new record in documents table in dynmodb
        const document = {
            documentId: documentId,
            bucketName: documentBucket,
            objectName: decodeURIComponent(element.key.replace(/\+/g, ' ')),
            department: department,
            documentStatus: 'IN_PROGRESS',
            documentCreatedOn: new Date().toISOString(),
        };
        const data = await ddb.write(docsTableName, document);
        logger.info(`Created document id ${documentId} for object ${element.key}`);
        documents.push(document);
    }
    return documents;
}

export async function getDocuments(department?: string) {
    let data;
    if (department) {
        const filterExp = 'department = :department';
        const ExpVal = { ':department': department };
        data = await ddb.readAll(docsTableName, filterExp, ExpVal);
    } else {
        data = await ddb.readAll(docsTableName);
    }
    return data;
}

export async function getDocumentById(id: string) {
    const data = await ddb.read(docsTableName, { documentId: id });
    return data;
}

export async function deleteDocument(id: string) {
    const data = await ddb.delete({ TableName: docsTableName, Key: { documentId: id } });
    return data;
}

export async function getOutputs(id: string) {
    const keyCndExp = 'documentId = :documentId';
    const expVal = { ':documentId': id };
    const data = await ddb.query(outputTableName, keyCndExp, expVal);
    return data;
}
