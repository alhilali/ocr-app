import { APIGatewayProxyResult, Context, DynamoDBStreamEvent } from 'aws-lambda';
import { lambdaHandler } from '../../app';
import 'jest';

describe('Unit test for app handler', function () {
    beforeAll(() => {
        jest.resetModules();
        process.env = { AWS_REGION: 'eu-central-1' };
    });
    it('verifies successful response', async () => {
        const event: DynamoDBStreamEvent = {
            Records: [
                {
                    eventID: 'c81e728d9d4c2f636f067f89cc14862c',
                    eventName: 'INSERT',
                    eventVersion: '1.1',
                    eventSource: 'aws:dynamodb',
                    awsRegion: 'us-east-1',
                    dynamodb: {
                        Keys: {
                            Id: {
                                N: '101',
                            },
                        },
                        NewImage: {
                            documentId: {
                                S: '2dd52892-1796-4251-89eb-a64698a3d3b0',
                            },
                            bucketName: {
                                S: 'ocr-app-docstoanalyze-u6cs9o64ms4y',
                            },
                            objectName: {
                                S: 'OoPdfFormExample.pdf',
                            },
                        },
                        OldImage: {
                            Message: {
                                S: 'New item!',
                            },
                            Id: {
                                N: '101',
                            },
                        },
                        ApproximateCreationDateTime: 1428537600,
                        SequenceNumber: '4421584500000000017450439092',
                        SizeBytes: 59,
                        StreamViewType: 'NEW_AND_OLD_IMAGES',
                    },
                    eventSourceARN:
                        'arn:aws:dynamodb:us-east-1:123456789012:table/ExampleTableWithStream/stream/2015-06-27T00:48:05.899',
                },
            ],
        };
        const result: APIGatewayProxyResult = await lambdaHandler(event);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(
            JSON.stringify({
                message: 'DynamoDB records processed successfully',
            }),
        );
    });
});
