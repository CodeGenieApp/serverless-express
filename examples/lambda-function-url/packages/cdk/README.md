```
cdk bootstrap --profile todo_development
cdk bootstrap --profile todo_staging
cdk bootstrap --profile todo_production
```
If you get "Please confirm you intend to make the following modifications:" and you aren't prompted to approve, you can run `npm run deploy:dev -- --require-approval=never`.

Use `--context skipDeployWebApp=true` to skip building and deploying web app.