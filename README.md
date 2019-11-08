Requires two secrets...

- AZURE_CREDENTIALS: See [Azure/login](https://github.com/Azure/login) for example.
- AZURE_CONFIGURATION: JSON object that has these properties:
```
{
	"subscriptionId": "YOUR-SUBSCRIPTION-ID",
	"resourceGroupName": "YOUR-RESOURCE-GROUP",
	"location": "REGION-TO-DEPLOY",
	"storageAccountName": "UNIQUE-STORAGE-ACCOUNT-NAME",
	"storageContainerName": "CONTAINER-TO-PUT-ASSETS",
	"functionAppName": "NAME-OF-FUNCTION-APP"
}
```