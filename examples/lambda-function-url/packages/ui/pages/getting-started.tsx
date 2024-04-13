import React from 'react'
import { Divider, Typography } from 'antd'
import UnauthenticatedPage from '../components/layouts/UnauthenticatedPage'
import Link from 'next/link'

export default function GettingStarted() {
  return <>
    <UnauthenticatedPage pageTitle='Getting Started'>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          fontSize: '18px',
        }}>
        <Typography.Title>Welcome to Todo! 🎉</Typography.Title>
        <p>
          Your project has successfully been generated and deployed to AWS. Here&apos;s what you should do next:
        </p>

        <ol style={{width: '100%'}}>
          <li>
            <a href='#visit-the-deployed-app'>Visit the deployed app</a>
          </li>
          <li>
            <a href='#open-the-project-source-code-in-your-favorite-IDE'>Open the project source code in your favorite IDE</a>
          </li>
          <li>
            <a href='#run-the-app-for-local-development'>Run the app for local development</a>
          </li>
          <li>
            <a href='#read-the-project-walkthrough'>Read the Project Walkthrough</a>
          </li>
          <li>
            <a href='#modify-the-app-definition-and-regenerate'>Modify the App Definition and regenerate</a>
          </li>
          <li>
            <a href='#deploy-a-production-environment'>Deploy a production environment</a>
          </li>
          <li>
            <a href='#set-up-custom-domains'>Set up custom domains</a>
          </li>
          <li>
            <a href='#set-up-custom-emails'>Set up custom emails</a>
          </li>
          <li>
            <a href='#join-the-code-genie-community'>Join the Code Genie community</a>
          </li>
          <li>
            <a href='#explore-premium-features'>Explore premium features</a>
          </li>
          <li>
            <a href='#delete-this-page'>Delete this page</a>
          </li>
        </ol>
        <Divider />
        <Typography.Title level={3} id='visit-the-deployed-app'>Visit the deployed app</Typography.Title>
        <p>
          Your project has been deployed to your AWS account. In fact, you&apos;re looking at it right now! Visit the <Link href='/'>Login Page</Link> to register, sign in, and start exploring your app. You can always get back to this page by visiting the /getting-started route.
        </p>
        <Divider />
        <Typography.Title level={3} id='open-the-project-source-code-in-your-favorite-IDE'>Open the project source code in your favorite IDE</Typography.Title>
        <p>
          Your project source code has been downloaded to a directory called `todo` within the directory that you ran the `@codegenie/cli generate` command. From the same terminal, you can try running `code todo`, or you can simply open your favorite IDE (e.g. VS Code) and open the project folder.
        </p>
        <Divider />
        <Typography.Title level={3} id='run-the-app-for-local-development'>Run the app for local development</Typography.Title>
        <p>
          Your project comes with several commands to run the app locally under different conditions. Start by running `npm run start-ui:dev` to run the web app locally. Read more about <a href='https://codegenie.codes/docs/guides/local-development/' target='_blank' rel='noreferrer'>local development</a> in the Code Genie documentation to learn how to run the API locally as well. To deploy your changes, run `npm run deploy:dev`.
        </p>
        <Divider />
        <Typography.Title level={3} id='read-the-project-walkthrough'>Read the Project Walkthrough</Typography.Title>
        <p>
          If you want to familiarize yourself further with your project&apos;s source code and folder structure, check out the <a href='https://codegenie.codes/docs/project-walkthrough/overview/' target='_blank' rel='noreferrer'>Project Walkthrough</a>.
        </p>
        <Divider />
        <Typography.Title level={3} id='modify-the-app-definition-and-regenerate'>Modify the App Definition and regenerate</Typography.Title>
        <p>
          If you used the Code Genie CLI to generate your application based on a description, there&apos;s a good chance the <strong><span style={{textDecoration: 'line-through'}}>AI</span> Genie</strong> didn&apos;t get your wish exactly right. Hopefully it at least gave you a useful starting point.
        </p>
        
        <p>
          After signing in and exploring the app in its current state, head over to the Code Genie docs to learn more about <a href='https://codegenie.codes/docs/guides/define-an-application/' target='_blank' rel='noreferrer'>App Definitions</a>. Then, modify the existing data model inside your project&apos;s `.codegenie` directory and run `npx @codegenie/cli generate` (without the `--description` flag) from within your project directory to regenerate the project based on your changes.
        </p>

        {/* <p>
          Note that the generate command will overwrite existing files within the project directory. If you&apos;ve made changes to generated files, be sure to first stage/commit them and then merge the changes as necessary (ignoring anything that overwrites your changes).
        </p>

        <p>
          If your changes to the data model include major changes such as deleting or renaming entities or relationships, changing ID properties, etc. then you will end up with unused/orphaned files. <strong>Coming Soon:</strong> To prevent this, Code Genie will soon let you run the generate command with the `--cleanup` flag: `npx @codegenie/cli generate --cleanup`.
        </p> */}
        <Divider />
        <Typography.Title level={3} id='deploy-a-production-environment'>Deploy a production environment</Typography.Title>
        <p>
          When you&apos;re ready to deploy a production instance, run `npm run init:prod`. Note that all of the `:dev`-suffixed commands have sibling `:prod` commands also (e.g. `npm run start-ui:prod`, `npm run deploy:prod`). Commands and configuration also exist for a staging environment.
        </p>
        <Divider />
        <Typography.Title level={3} id='set-up-custom-domains'>Set up custom domains</Typography.Title>
        <p>
          Custom domains for the Web App and API can be specified in `packages/cdk/cdk.json`. We recommend leaving the dev environment without a custom domain for simplicity, but you can add one if necessary.
        </p>

        <p>
          It&apos;s a good idea to leave your root domain for your marketing/content website (e.g. example.com) and use subdomains such as `app.example.com` for your Web App, and `api.example.com` for your API. Consider prefixing the staging environment with `staging.` (e.g. staging.app.example.com and staging.api.example.com).
        </p>

        <p>
          After updating `cdk.json`, run `npm run deploy:prod` from within your project directory and wait for deployment to complete.
        </p>

        <p>
          To complete setting up a custom domain for your Web App, follow the instructions in the <a href='https://docs.aws.amazon.com/amplify/latest/userguide/to-add-a-custom-domain-managed-by-a-third-party-dns-provider.html' target='_blank' rel='noreferrer'>Amplify docs for third-party DNS providers</a> beginning at the <strong>View DNS records</strong> step. If your domain is managed by Route53, you don&apos;t need to follow these steps.
        </p>

        <p>
          To complete setting up a custom domain for your API, open the `packages/cdk/cdk-outputs.dev|staging|prod.json` file and copy the value of the `RegionalDomainName`. Create a CNAME record in your DNS settings and enter your domain in the Host (e.g. api.example.com), and paste the `RegionalDomainName` value as the Answer/Value.
        </p>

        <p>Remember, DNS can take several minutes to propagate.</p>
        <Divider />
        <Typography.Title level={3} id='set-up-custom-emails'>Set up custom emails</Typography.Title>
        <p>
          Once you have custom domains set up, you may want emails to also come from those domains. Out of the box, the main types of emails that Code Genie apps send are verification emails (upon registering) and forgot password emails. If you&apos;re using the Organization permission model, emails are also sent when inviting other users to join an organization.
        </p>
        <p>
          Navigate to the <a href='https://console.aws.amazon.com/ses/home/get-set-up' target='_blank' rel='noreferrer'>AWS SES console&apos;s &quot;Get set up&quot; page</a> and follow the steps to get your AWS account out of sandbox. This primarily consists of verifying ownership of your domain name via DNS settings and making a support request. See Code Genie&apos;s guide on <a href='https://codegenie.codes/docs/guides/send-emails-from-custom-domain/' target='_blank' rel='noreferrer'>getting out of the AWS SES sandbox</a> for tips on how to pre-emptively answer the support team&apos;s questions.
        </p>
        <p>
          After your AWS account has been granted production SES access you can update the `email` property of `packages/cdk/cdk.json` for the environment(s) that you want to use custom emails: `&#123; &quot;production&quot;: &#123; &quot;email&quot;: &#123; &quot;verifiedDomain&quot;: &quot;example.com&quot;, &quot;verifyUserEmail&quot;: &quot;verify@example.com&quot; &#125; &#125; &#125;`
        </p>
        <Divider />
        <Typography.Title level={3} id='join-the-code-genie-community'>Join the Code Genie community</Typography.Title>
        <p>
          Join us on <a href='https://discord.gg/YJ9gQhheyn' target='_blank' rel='noreferrer'>Discord</a> for help and meet people with similar interests. And don&apos;t forget to follow us on <a href='https://twitter.com/CodeGenieCodes' target='_blank' rel='noreferrer'>Twitter</a>!
        </p>
        <Divider />
        <Typography.Title level={3} id='explore-premium-features'>Explore premium features</Typography.Title>
        <p>
          Coming soon...
        </p>
        <Divider />
        <Typography.Title level={3} id='delete-this-page'>Delete this page</Typography.Title>
        <p>When you&apos;re ready, delete this page so it&apos;s not accessible to others and then redeploy with `npm run deploy:dev|staging|prod`. You&apos;ll find this page under `packages/ui/pages/getting-started.tsx`.</p>
      </div>
    </UnauthenticatedPage>
    <style jsx global>
      {`
      .layout-container {
        width: auto !important;
        max-width: 800px;
        margin: 1rem;
      }
      `}
    </style>
  </>
}