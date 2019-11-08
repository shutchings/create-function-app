const core = require('@actions/core');
const { promisify } = require('util');
const { exec } = require('child_process');
const execAsyncInternal = promisify(exec);
const ActionsSecretParser = require('actions-secret-parser');

async function run() {

    try {
        await checkAzureCliIsAvailable();
        const configuration = await parseConfiguration();

        await createResourceGroup(configuration);
        await createStorageAccount(configuration);
        await createStorageContainer(configuration);
        await setStorageContainerPermissions(configuration);
        await createFunctionApp(configuration);
        await enablePackageDeploy(configuration);
    } catch (error) {
        core.setFailed(error.message);
    }
}

async function checkAzureCliIsAvailable() {
    try {
        await execAsyncInternal(`az --version`);
    } catch (error) {
        console.log("Unable to find Azure CLI");
        throw new Error(error);
    }
}

async function parseConfiguration() {
    try {
        const rawConfiguration = new ActionsSecretParser.SecretParser(core.getInput("configuration", { required: true}), ActionsSecretParser.FormatType.JSON);
        const configuration = {
            subscriptionId: rawConfiguration.getSecret("$.subscriptionId", false),
            resourceGroupName: rawConfiguration.getSecret("$.resourceGroupName", false),
            location: rawConfiguration.getSecret("$.location", false),
            storageAccountName: rawConfiguration.getSecret("$.storageAccountName", false),
            storageContainerName: rawConfiguration.getSecret("$.storageContainerName", false),
            functionAppName: rawConfiguration.getSecret("$.functionAppName", false)
        };

        if (!configuration.subscriptionId || !configuration.resourceGroupName || !configuration.location || !configuration.storageAccountName || !configuration.storageContainerName || !configuration.functionAppName) {
            throw new Error("Not all values are presnet in the configuration object. Ensure subscriptionId, resourceGroupName, location, storageAccountName, storageContainerName, and functionAppName are present.");
        }

        return configuration;
    } catch (error) {
        console.log("Could not parse configuration");
        throw error;
    }
}

async function createResourceGroup(configuration) {
    try {
        console.log(`Creating resource group ${configuration.resourceGroupName}`);

        await execAsyncInternal(
            `az group create \
            --subscription ${configuration.subscriptionId} \
            --name ${configuration.resourceGroupName} \
            --location ${configuration.location}`
        );
    } catch (error) {
        console.log("Unable to create resource group");
        throw error;
    }
}

async function createStorageAccount(configuration) {
    try {
        console.log(`Creating storage account ${configuration.storageAccountName}`);

        await execAsyncInternal(
            `az storage account create \
            --subscription ${configuration.subscriptionId} \
            --resource-group ${configuration.resourceGroupName} \
            --name ${configuration.storageAccountName} \
            --location ${configuration.location} \
            --sku Standard_LRS`
        );
    } catch (error) {
        console.log("Unable to create storage account");
        throw error;
    }
}

async function createStorageContainer(configuration) {
    try {
        console.log(`Creating storage container ${configuration.storageContainerName}`);

        await execAsyncInternal(
            `az storage container create \
            --subscription ${configuration.subscriptionId} \
            --name ${configuration.storageContainerName} \
            --account-name ${configuration.storageAccountName}`
        );
    } catch (error) {
        console.log("Unable to create storage container");
        throw error;
    }
}

async function setStorageContainerPermissions(configuration) {
    try {
        console.log(`Setting storage container permissions`);

        await execAsyncInternal(
            `az storage container set-permission \
            --public-access blob \
            --subscription ${configuration.subscriptionId} \
            --account-name ${configuration.storageAccountName} \
            --name ${configuration.storageContainerName}`
        );
    } catch (error) {
        console.log("Unable to set storage container permissions");
        throw error;
    }
}

async function createFunctionApp(configuration) {
    try {
        console.log(`Creating function app ${configuration.functionAppName}`);

        await execAsyncInternal(
            `az functionapp create \
            --subscription ${configuration.subscriptionId} \
            --resource-group ${configuration.resourceGroupName} \
            --consumption-plan-location ${configuration.location} \
            --name ${configuration.functionAppName} \
            --storage-account ${configuration.storageAccountName} \
            --runtime node`
        );
    } catch (error) {
        console.log("Unable to create function app");
        throw error;
    }
}

async function enablePackageDeploy(configuration) {
    try {
        console.log(`Enabling package deploy`);

        await execAsyncInternal(
            `az functionapp config appsettings set \
            --settings WEBSITE_RUN_FROM_PACKAGE=1 \
            --resource-group ${configuration.resourceGroupName} \
            --name ${configuration.functionAppName}`
        );
    } catch (error) {
        console.log("Could not enable package deployment");
        throw error;
    }
}

run();
