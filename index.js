// const core = require('@actions/core');

const { promisify } = require('util');
const { exec } = require('child_process');

const execAsyncInternal = promisify(exec);

const subscriptionId = "4f670563-09a7-43dd-a8f8-334946660e1e";
const resourceGroupName = "action-testing";
const location = "centralus";
const storageAccountName = "shactiontestingsa";
const storageContainerName = "shactioncontainer";
const functionAppName = "action-testing-app";

function fail(message, error) {
    console.log(message)
    core.setFailed(error.message);

    return;
}

async function run() {
    try {
        await execAsyncInternal(`az --version`);
    } catch (error) {
        fail("Unable to find Azure CLI", error);
        return;
    }

    try {
        console.log(`Creating resource group ${resourceGroupName}`);

        await execAsyncInternal(
            `az group create \
            --subscription ${subscriptionId} \
            --name ${resourceGroupName} \
            --location ${location}`
        );
    } catch (error) {
        fail("Unable to create resource groupo", error);
        return;
    }
    
    try {
        console.log(`Creating storage account ${storageAccountName}`);

        await execAsyncInternal(
            `az storage account create \
            --subscription ${subscriptionId} \
            --resource-group ${resourceGroupName} \
            --name ${storageAccountName} \
            --location ${location} \
            --sku Standard_LRS`
        );
    } catch (error) {
        fail("Unable to create storage account", error);
        return;
    }

    try {
        console.log(`Creating storage container ${storageContainerName}`);

        await execAsyncInternal(
            `az storage container create \
            --subscription ${subscriptionId} \
            --name ${storageContainerName} \
            --account-name ${storageAccountName}`
        );
    } catch (error) {
        fail("Unable to create storage container", error);
        return;
    }

    try {
        console.log(`Setting storage container permissions`);

        await execAsyncInternal(
            `az storage container set-permission \
            --public-access blob \
            --subscription ${subscriptionId} \
            --account-name ${storageAccountName} \
            --name ${storageContainerName}`
        );
    } catch (error) {
        fail("Unable to set storage container permissions", error);
        return;
    }

    try {
        console.log(`Creating function app ${functionAppName}`);

        await execAsyncInternal(
            `az functionapp create \
            --subscription ${subscriptionId} \
            --resource-group ${resourceGroupName} \
            --consumption-plan-location ${location} \
            --name ${functionAppName} \
            --storage-account ${storageAccountName} \
            --runtime node`
        );
    } catch (error) {
        fail("Unable to create function app", error);
        return;
    }

    try {
        console.log(`Enabling package deploy`);

        await execAsyncInternal(
            `az functionapp config appsettings set \
            --settings WEBSITE_RUN_FROM_PACKAGE=1 \
            --resource-group ${resourceGroupName} \
            --name ${functionAppName}`
        );
    } catch (error) {
        fail("Could not enable package deployment", error);
        return;
    }
}

run();
