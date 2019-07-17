const uuid = require('uuid/v4')
const SignInPage = require('./pages/signIn')
const TodosPage = require('./pages/todos')

jest.setTimeout(20000);

describe('Logging In', () => {
    it('logs in with correct username and password', async() => {
        const signInPage = new SignInPage(page, "http://localhost:4444")
        await signInPage.signIn()
        await expect(page.content())
            .resolves
            .toContain(`Hello ${signInPage.user.username}`);
        await signInPage.signOut()
    });
});


describe('Managing TODOs', () => {
    const signInPage = new SignInPage(page, "http://localhost:4444")
    const todosPage = new TodosPage(page, "http://localhost:4444")

    beforeAll(async() => {
        await signInPage.signIn()
        await todosPage.goto()
    });

    afterAll(async() => {
        await signInPage.signOut()
    })

    it('creates and completes a TODO', async() => {
        const todoList = await todosPage.todosList()

        // Create a new TODO
        const todoText = uuid()
        await todosPage.createTodo(todoText)
        expect(await todoList.$$eval('li span.description', nodes => nodes.map(n => n.innerText))).toContain(todoText)

        // Find our new TODO item and it's completion button
        const targetTodoItem = await todosPage.getTodoItem(todoText)
        expect(targetTodoItem).toBeTruthy()
        
        // Complete the new TODO
        await todosPage.completeTodo(targetTodoItem)
        expect(await todoList.$$eval('li span.description', nodes => nodes.map(n => n.innerText))).not.toContain(todoText)
    });
});
