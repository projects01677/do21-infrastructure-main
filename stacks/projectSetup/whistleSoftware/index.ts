import { cloudWatchLogsFullAccessPolicy } from "../../../utility/projectSetup/iamPolicies/cloudWatchLogsFullAccessPolicy"
import { safeS3FullAccessPolicy } from "../../../utility/projectSetup/iamPolicies/safeS3FullAccessPolicy"
import { snsFullAccessPolicy } from "../../../utility/projectSetup/iamPolicies/snsFullAccessPolicy"
import { airbuddiesCicdIam } from "./src/airbuddies"
import { logfilesProject } from "./src/logfiles"
import { lolaProject } from "./src/lola"
import { serverProject } from "./src/server"
import { newrelicStatsProject } from "./src/newrelic-stats"
import { serverDataProcessorProject } from "./src/server-data-processor"
import { pearlProject } from "./src/pearl"
import { hankProject } from "./src/hank"
import { ramboProject } from "./src/rambo"
import { deviceDataWarehouseProject } from "./src/device-data-warehouse"
airbuddiesCicdIam
logfilesProject
lolaProject
serverProject
newrelicStatsProject
serverDataProcessorProject
pearlProject
hankProject
ramboProject
deviceDataWarehouseProject
export const cloudWatchLogsFullAccessPolicyArn = cloudWatchLogsFullAccessPolicy.arn
export const logfilesCicdIamArn = logfilesProject.cicdUser.arn
export const lolaCicdIamArn = lolaProject.cicdUser.arn
export const safeS3FullAccessPolicyArn = safeS3FullAccessPolicy.arn
export const serverCicdIamArn = serverProject.cicdUser.arn
export const newrelicStatsCicdIamArn = newrelicStatsProject.cicdUser.arn
export const serverDataProcessorCicdIamArn = serverDataProcessorProject.cicdUser.arn
export const snsFullAccessPolicyArn = snsFullAccessPolicy.arn
export const pearlCicdIamArn = pearlProject.cicdUser.arn
export const hankCicdIamArn = hankProject.cicdUser.arn
export const ramboCicdIamArn = ramboProject.cicdUser.arn
export const deviceDataWarehouseCicdIamArn = deviceDataWarehouseProject.cicdUser.arn
