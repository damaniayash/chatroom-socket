# Chatroom

This is a multi-user chatroom where users can sign up, send messages with upvote and downvote functionality for the users. 

The backend is written in Python using Flask. SocketIO is used handle commuication between client and server. Frontend is developed using React. Postgres is used as the database.

## Backend

- We use SQLAlchemy to represent the tables as classes and perform operations.

- We have a data channel that publishes the message recieved from the client to the database as well as emit it to all other clients.

- For upvote and downvote button, we see which message is being upvoted or downvoted and update the corresponding messages in the database and then emit all the changes to the all the connecte clients.

- We have a get_previous_messages channel that fetches all the previous messages when a client joins the chat and emit the old messages to the new client.

## Database

- We use postgres for storing users and messages.

- Tables can be loaded via make_table.py or make_table.sql (used with docker). Schema evident from the SQL.

## Frontend

- Users can sign up, log in. Couple of validations in place to not let registed users to sign in again. Checks to ensure proper password and email id.

- Login fails if the user email or password is incorrect.

- Users can see the messages from the people who were already in the chatroom.


## Run Locally

### Backend

- Install dependencies via

    `pip install -r requirements.txt`

- Run server using 

    `python3 server.py`

### Frontend

- Install dependencies

    `npm install`

- Run client

    `npm start`

### Database

- You will need to install Postgres on your system. For mac use

    `brew install postgresql`

    `brew services start postgresql`

    `psql postgres`

    `create database chat_db`

- Now you can run python script or provided sql file to create tables and insert some sample data in to them.

## Deployment

- You will need to have docker and minikube installed.

- you can spin up all docker containers using 

    `docker-compose up`

- This will spin up server and client docker containers.

- It will also spin up the database container and create the table and fill in some same data using the provided SQL.

- I converted docker compose isntructions to kubectl deployment config using Kompose.

    `kompose convert`

- Apply the server deployment and service configurations:

    `kubectl apply -f postgres-deployment.yaml`

    `kubectl apply -f backend-deployment.yaml`

    `kubectl apply -f frontend-deployment.yaml`

    `kubectl apply -f postgres-service.yaml`

    `kubectl apply -f backend-service.yaml`

    `kubectl apply -f frontend-service.yaml`





