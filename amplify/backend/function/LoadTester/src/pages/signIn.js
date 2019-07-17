function sleep(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
 }

 function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
 }

class SignInPage {
    constructor(page, baseUrl, user) {
        this.page = page
        this.baseUrl = baseUrl
        this.user = user || {
            username: 'gabe',
            password: 'P@ssw0rd'
        }
    }

    async signIn(user, backoffSecs=0) {
        const u = user || this.user
        await this.page.goto(this.baseUrl);
        await this.page.waitForSelector('input[name="username"]')
        await this.page.type('input[name="username"]', u.username)
        await this.page.type('input[name="password"]', u.password)
        await this.sleep(backoffSecs * 1000)
        await this.page.click('button[type="submit"]')
        const authError = await this.page.waitForSelector('div[data-test="authentication-error"', { timeout: 3000 })
        if (authError) {
            return await this.signIn(user, backoffSecs * 2 + getRandomInt(5))
        }
        else {
            await this.page.waitForSelector('button[data-test="sign-out-button"]')
        }
    }

    async signOut() {
        const signOutButton = await this.page.waitForSelector('button[data-test="sign-out-button"]')
        await signOutButton.click()
        await this.page.waitForSelector('input[name="username"]')
    }
}

module.exports = SignInPage