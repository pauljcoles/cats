export const config: WebdriverIO.Config = {
  runner: 'local',
  tsConfigPath: './tsconfig.json',
  
  specs: [
    './test/specs/**/*.e2e.ts'
  ],
  
  exclude: [],
  
  maxInstances: 10,
  
  capabilities: [{
    browserName: 'chrome',
    acceptInsecureCerts: true
  }],
  
  logLevel: 'info',
  
  bail: 0,
  
  baseUrl: 'http://localhost:3000',
  
  waitforTimeout: 10000,
  
  connectionRetryTimeout: 120000,
  
  connectionRetryCount: 3,
  
  services: ['chromedriver'],
  
  framework: 'mocha',
  
  reporters: ['spec'],
  
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000
  },

  before: function (capabilities, specs) {
    require('ts-node').register({ files: true });
  },
};
