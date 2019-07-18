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
        await sleep(backoffSecs * 1000)
        await this.page.click('button[type="submit"]')
        
        try {
            console.log('Looking for successful sign in...')
            await this.page.waitForSelector('button[data-test="sign-out-button"]', { timeout: 5000 })
        }
        catch(ex) {
            console.log('Error during log in. Looking for auth error on page to be sure...')
            await this.page.waitForSelector('div[data-test="authenticator-error"]', { timeout: 20000 })
            const sleepSecs = backoffSecs + 1 + getRandomInt(10)
            console.log(`Detected auth error. Retrying in ${sleepSecs} secs...`)
            return await this.signIn(user, sleepSecs)
        }
    }

    async signOut() {
        const signOutButton = await this.page.waitForSelector('button[data-test="sign-out-button"]')
        await signOutButton.click()
        await this.page.waitForSelector('input[name="username"]')
    }
}

module.exports = SignInPage