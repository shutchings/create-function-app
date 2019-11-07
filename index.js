// const core = require('@actions/core');

const { promisify } = require('util');
const { exec } = require('child_process');

const execAsyncInternal = promisify(exec);

const subscriptionId = "4f670563-09a7-43dd-a8f8-334946660e1e";
const resourceGroupName = "action-testing";
const location = "centralus";

async function run() {
    try {
        console.log("Starting action.");
        
        try {
            await execAsyncInternal(`az --version`);
            console.log("Azure CLI is available.");
        } catch (error) {
            console.log("Unable to find Azure CLI");
            core.setFailed(error.message);
            return;
        }

        await createResourceGroup();

    //     const appSecretsJSON = core.getInput('app_secrets');
    //     const functionName = core.getInput('az_func_name');
    //     const functionResourceGroup = core.getInput('az_func_resource_group');
    //     if (!appSecretsJSON
    //         || !functionName
    //         || !functionResourceGroup) {
    //         core.setFailed("Either of the input value is null or empty.");
    //         return;
    //     }

    //     const secrets = JSON.parse(appSecretsJSON);
    //     for (var key in secrets) {
    //         if (secrets.hasOwnProperty(key)) {
    //             try {
    //                 await execAsyncInternal(`az functionapp config appsettings set --settings ${key}=${secrets[key]} --resource-group ${functionResourceGroup} --name ${functionName}`);
    //                 console.log("Added the secret to app setting.");
    //             } catch (error) {
    //                 console.log("Failed to add secrets to app setting.");
    //                 core.setFailed(error.message);
    //                 return;
    //             }
    //         }
    //     }
    } catch (error) {
        console.log("Failed");
    }
}

async function createResourceGroup() {
    try {
        await execAsyncInternal(
          `az group exists --subscription ${subscriptionId} --name ${resourceGroupName}`
        ).then(exists => {
            console.log(`Exists: ${exists}`);
        });
        console.log(`Creating resource group ${resourceGroupName}`);
        await execAsyncInternal(
          `az group create --subscription ${subscriptionId} --name ${resourceGroupName} --location ${location}`
        );
    } catch (e) {
        console.log("Could not create resource group")
        console.log(e);
    }
}

run();
