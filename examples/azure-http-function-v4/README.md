# Example - Azure Function HTTP v4

This example uses the local tools provided by Microsoft to simulate an Azure Function environment. This means there is no Azure Account required to run this example.

## Run local requirements

These prerequisites are required to run and debug your functions locally. 

- Visual Studio Code
- Visual Studio Code - Azure Functions extension
- Azure Functions Core Tools (`npm install -g azure-functions-core-tools@4 --unsafe-perm true`)
- Node.js

_For further information on how to run an Azure Function locally please check [Develop Azure Functions by using Visual Studio Code](https://docs.microsoft.com/en-us/azure/azure-functions/functions-develop-vs-code?tabs=nodejs)._


## Installation & Usage

After all requirements are fulfilled you can install all dependencies for the `azure-http-function-v4` with npm.

```bash
  cd examples/azure-http-function-v4
  npm install
  npm run start
```



After you run the last command you should see an output like this:

```bash
Azure Functions Core Tools
Core Tools Version:       4.0.4590
Function Runtime Version: 4.5.2.18383


Functions:

        HttpExample:  http://localhost:7071/api/{*segments}
```

Now you can navigate to `http://localhost:7071/api/` to display the `My Serverless Application` page.