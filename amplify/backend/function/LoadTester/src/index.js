/*
Invoke with event like: 
{
  "mode": "master",
  "workers": { count: 10 }
}
*/

const uuid = require('uuid/v4');

// Installed via Lambda Layer
const chromium = require('chrome-aws-lambda');

var AWS = require('aws-sdk');
const lambda = new AWS.Lambda();

const SignInPage = require('./pages/signIn')
const TodosPage = require('./pages/todos')


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


function invokeLambda(event, context) {
  return lambda.invoke({
    FunctionName: context.functionName,
    LogType: "Tail",
    InvocationType: "RequestResponse",
    Payload: JSON.stringify({
      mode: 'worker',
      workers: event.workers
    })
  }).promise()
}


const dispatchWorkers = async (event, context) => {
  console.log(`Dispatching ${event.workers.count} workers`)

  let invocations = []
  for (let i=0; i<event.workers.count; i++) {
    invocations.push(invokeLambda(event, context))
  }

  const results = await Promise.all(invocations)
  const logs = results.map(r => Buffer.from(r.LogResult, 'base64').toString())
  logs.forEach(l => console.log(l))
  
  console.log(`All workers finished.`)
}


const doWork = async (event, context) => {
  let browser = null;
  const baseURL = process.env.LOAD_TEST_BASE_URL

  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    let page = await browser.newPage();

    page.on('console', msg => {
      for (let i = 0; i < msg.args().length; ++i)
        console.log(`${i}: ${msg.args()[i]}`);
    });

    page.on('pagerror', msg => {
        console.log(`PageError: ${msg}`)
    });
  
    const signInPage = new SignInPage(page, baseURL)
    const todosPage = new TodosPage(page, baseURL)

    const numSessionsToRepeat = 1
    const numTodosPerSession = 100

    const doSession = async (numTodos) => {
      // Sign In
      console.log('Signing In')
      await signInPage.signIn()

      await todosPage.goto()
      await todosPage.waitForLoadCompleted()

      for (let i=0; i<numTodos; i++) {
        // Create a new TODO
        let todoText = uuid()
        console.log('Creating TODO ', todoText)
        await todosPage.createTodo(todoText)

        // Complete the new TODO
        const targetTodoItem = await todosPage.getTodoItem(todoText)
        console.log('Completing TODO ', todoText)
        await todosPage.completeTodo(targetTodoItem)
      }
      
      console.log('Signing Out')
      await signInPage.signOut()
      
      console.log('Done')
    }

    for (let i=0; i<numSessionsToRepeat; i++) {
      await doSession(numTodosPerSession)
    }
  } 
  catch (error) {
    console.log('Error during worker execution: ', error)
    await sleep(1000) // make sure this error msg gets logged before lambda shuts down
  } 
  finally {
    if (browser !== null) {
      await browser.close();
    }
  }
  return true
}


exports.handler = async (event, context) => {
  let result = null;

  try {
    if (event.mode === 'master') {
      result = await dispatchWorkers(event, context)
    }

    if (event.mode === 'worker') {
      result = await doWork(event, context)
    }
  } 
  catch (error) {
    return context.fail(error);
  } 

  return context.succeed(result);
};