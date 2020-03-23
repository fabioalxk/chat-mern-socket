# Real time chat application with MERN Stack

This is a project that I made based on web tutorial. It's a Real Time Chat, with the MERN stack (mongodb, express.js, react.js, node.js)

# How to run it

    Server
    > cd server
    > npm i
    > npm start

    Stock api
    > cd worker-stock
    > npm i
    > npm start

    Client
    > cd server/client
    > npm i
    > npm start

    RabbitMq inside a docker container
    Command to create a docker container
    > docker run --name rabbitmq3.7-server -e RABBITMQ_ERLANG_COOKIE='fabio alexandrino' -e RABBITMQ_DEFAULT_USER=admin -e RABBITMQ_DEFAULT_PASS=12345 -p 4369:4369 -p 5671:5671 -p 5672:5672 -p 25672:25672 -p 15672:15672 -d rabbitmq:3.7-management

Access the application through [http://localhost:3000/](http://localhost:3000/)
