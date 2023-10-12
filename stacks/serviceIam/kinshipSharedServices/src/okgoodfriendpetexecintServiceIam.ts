import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { awsAccountId } from "../../../../utility/awsAccountId"
import { environment } from "./environment"

const ok_goodfriend_user_name = `ok-goodfriend-service-${environment}`
const ok_goodfriend_user = new aws.iam.User(ok_goodfriend_user_name, { name: ok_goodfriend_user_name })

const ok_goodfriend_service_sqs_access = new aws.iam.UserPolicy(`${ok_goodfriend_user_name}-sqs-policy`, {
  name: `${ok_goodfriend_user_name}-sqs-policy`,
  user: ok_goodfriend_user.name,
  policy: pulumi.interpolate`{
        "Version": "2012-10-17",
        "Statement": [{
            "Sid": "manageQueueStatement",
            "Action": [
              "sqs:SendMessage",
              "sqs:ReceiveMessage",
              "sqs:DeleteMessage",
              "sqs:GetQueueAttributes",
              "sqs:ChangeMessageVisibility"
            ],
            "Effect": "Allow",
            "Resource": [
                "arn:aws:sqs:*:${awsAccountId()}:ok-*"
            ]
        }]
    }
`,
});

export const okgoodfriendpetexecintServiceIam = {
  ok_goodfriend_user,
  ok_goodfriend_service_sqs_access
}
