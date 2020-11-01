# Project Setup

This is a chat for multiple users, using react, node, mongodb and rabbitmq

# 1) Configure the Database URI

```
Unzip /server/config/default.rar
```

# 2) Start Server

```sh
$ cd server
$ npm
$ npm start
```

# 3) Start Client

```sh
$ cd client
$ npm
$ npm start
```

# 4) Start Stock API

```
$ worker
$ npm
$ npm start
```

# Start RabbitMq inside a docker container

```
RABBITMQ_DEFAULT_USER=admin -e RABBITMQ_DEFAULT_PASS=12345 -p 4369:4369 -p 5671:5671 -p 5672:5672 -p 25672:25672 -p 15672:15672 -d rabbitmq:3.7-management
```

---

The application will start on [http://localhost:3000]

# Type the follow string in the chat to get the stocks

```
/stock=aapl.us
```
