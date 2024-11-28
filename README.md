# Solana Pump.fun sniper bot

### Description
Poll the pump.fun website and check if the token is about to complete the bounding period. 
Once the bounding is finished, it swap the token and check the status and prices. 
Based on the configured strategies can book the profit (or loss). 

### How to start

1. Copy the ENV file and update all the ENV params
```shell
cp .env.example .env
```

2. Install packages
```shell
nvm exec npm i
```

3. Start the app
```shell
nvm exec npm run start:dev
```


### How to run tests
```shell
nvm exec npm run test:e2e
```

### Run the docker for local development:
```shell
docker-compose --env-file=.env up -d
```

### How to deploy to Heroku:
1. Create app in Heroku
2. Update Github secrets with params from CI/CD workflows