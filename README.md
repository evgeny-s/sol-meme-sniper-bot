# Solana Pump.fun sniper bot

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
2. Update CI/CD scripts