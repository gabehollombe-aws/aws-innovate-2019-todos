This is a simple TODO web app created with [Create React React App](https://github.com/facebook/create-react-app) and [AWS Amplify](https://aws-amplify.github.io/).

## Running this sample
1. `npm install`

1. `amplify init` (select `no` when prompted about existing environment, and enter your own desired environment name like `todos`)

```
➜  amplify-todos-example git:(master) amplify init
Note: It is recommended to run this command from the root of your app directory
? Do you want to use an existing environment? No
? Enter a name for the environment todos
```

1. `amplify push` (select `no` when asked about generating code for the GraphQL API)


1. `npm start`

1. Create an account, verify your code emailed to you during account creation, and log in.

1. Make some TODOs manually in the broweser or try out the Lambda load tester.


## Running end-to-end tests locally
`npm run test:integration`

Edit `jest-puppeteer.config.js` to toggle headless mode or to change the local dev server config.


