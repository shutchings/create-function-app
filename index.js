// const core = require('@actions/core');

const { promisify } = require('util');
const { exec } = require('child_process');

const execAsyncInternal = promisify(exec);

const subscriptionId = "4f670563-09a7-43dd-a8f8-334946660e1e";
const resourceGroupName = "action-testing";
const location = "centralus";
const storageAccountName = "shactiontestingsa";
const storageContainerName = "shactioncontainer";
const functionAppname = "action-testing-app";

function fail(error, message) {
    console.log(message)
    core.setFailed(error.message);

    return;
}

async function run() {
    try {
        await execAsyncInternal(`az --version`);
        console.log("Azure CLI is available.");
    } catch (error) {
        fail("Unable to find Azure CLI");
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
        fail("Unable to create resource groupo");
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
        fail("Unable to create storage account");
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
        fail("Unable to create storage container");
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
        fail("Unable to set storage container permissions");
        return;
    }

    try {
        console.log(`Creating function app ${functionAppName}`);

        await execAsyncInternal(
            `az functionapp create \
            --subscription ${subscriptionId} \
            --resource-group ${resourceGroupName} \
            --consumption-plan-location ${location} \
            --name ${functionAppname} \
            --storage-account ${storageAccount} --runtime node`
        );
    } catch (error) {
        fail("Unable to create function app");
        return;
    }

    try {
        console.log(`Enabling package deploy`);

        await execAsyncInternal(
            `az functionapp config appsettings set \
            --settings WEBSITE_RUN_FROM_PACKAGE=1 \
            --resource-groupo ${resourceGroup} \
            --name ${name}`
        );
    } catch (error) {
        fail("Could not enable package deployment");
        return;
    }
}

run();
