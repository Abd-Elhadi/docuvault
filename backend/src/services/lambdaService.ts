import {LambdaClient, InvokeCommand} from "@aws-sdk/client-lambda";
import {env} from "../config/env.js";

const lambdaClient = new LambdaClient({
    region: env.AWS_REGION,
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY as string,
    },
});

export const triggerTextExtraction = async (
    bucket: string,
    key: string,
): Promise<void> => {
    const payload = {
        Records: [
            {
                s3: {
                    bucket: {name: bucket},
                    object: {key},
                },
            },
        ],
    };

    const command = new InvokeCommand({
        FunctionName: env.AWS_LAMBDA_TEXT_EXTRACTOR_ARN,
        InvocationType: "Event",
        Payload: JSON.stringify(payload),
    });

    await lambdaClient.send(command);
};
