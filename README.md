# Solana Pump.fun sniper bot ( -_•)▄︻テحكـ━一💥

### Description
How it works:
- Pull the the pump.fun website coins 
- Check if the token is about to complete the bounding period 
- Once the bounding is finished, the Bot purchase the token and add it to the watching list 
- After the token is pumped, it book the profit

### How to start locally 👨🏼‍💻

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