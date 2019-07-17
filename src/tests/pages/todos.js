function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
 }

class TodosPage {
    constructor(page, baseUrl) {
        this.page = page
        this.baseUrl = baseUrl
        this.path = "/"
    }

    async goto() {
        this.page.goto(this.baseUrl + this.path, { waitUntil: 'networkidle0' })
    }
    
    async waitForLoadCompleted() {
        await this.page.waitForSelector('input[placeholder="Add TODO"]')
        await this.page.waitForSelector('div[data-test="todos-loading"]', { hidden: true })
    }
    
    async createTodo(todoText) {
        const todoInput = await this.page.$('input[placeholder="Add TODO"]')

        // Create a new TODO
        await todoInput.type(todoText)
        await todoInput.press('Enter')
        await this.getTodoItem(todoText)
    }

    async todosList() {
        return await this.page.waitForSelector('ul[data-test="todos-list"]')
    }

    async getTodoItem(todoText, opts = { hidden: false } ) {
        const targetTodoItem = await this.page.waitForXPath(`//ul[@data-test="todos-list"]/li[contains(., "${todoText}")]`, opts)
        return targetTodoItem
    }

    async getCompleteButtonForTodo(todoItem) {
        const targetCompleteButton = await todoItem.$('button[data-test="complete-todo"]')
        return targetCompleteButton
    }

    async completeTodo(todoItem) {
        const targetCompleteButton = await this.getCompleteButtonForTodo(todoItem)
        await targetCompleteButton.click()

        const todoDescription = await todoItem.$('span.description')
        const todoText = await this.page.evaluate(el => el.innerText, todoDescription);
        await this.getTodoItem(todoText, { hidden: true })
    }
}

module.exports = TodosPage