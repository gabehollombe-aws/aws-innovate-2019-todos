module.exports = {
    launch: {
        headless: true,
        // headless: false,
        // devtools: true
    },
    server: {
      command: `PORT=4444 BROWSER=none npm start`,
      port: 4444,
      launchTimeout: 10000,
      debug: true,
    },
  }