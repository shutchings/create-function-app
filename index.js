const core = require('@actions/core');

const { promisify } = require('util');
const { exec } = require('child_process');

const execAsyncInternal = promisify(exec);

async function run() {
    try {

        try {
            await execAsyncInternal(`az --version`);
            console.log("Azure CLI is available.");
        } catch (error) {
            console.log("Unable to find Azure CLI");
            core.setFailed(error.message);
            return;
        }

        const appSecretsJSON = core.getInput('app_secrets');
        const functionName = core.getInput('az_func_name');
        const functionResourceGroup = core.getInput('az_func_resource_group');
        if (!appSecretsJSON
            || !functionName
            || !functionResourceGroup) {
            core.setFailed("Either of the input value is null or empty.");
            return;
        }

        const secrets = JSON.parse(appSecretsJSON);
        for (var key in secrets) {
            if (secrets.hasOwnProperty(key)) {
                try {
                    await execAsyncInternal(`az functionapp config appsettings set --settings ${key}=${secrets[key]} --resource-group ${functionResourceGroup} --name ${functionName}`);
                    console.log("Added the secret to app setting.");
                } catch (error) {
                    console.log("Failed to add secrets to app setting.");
                    core.setFailed(error.message);
                    return;
                }
            }
        }
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
