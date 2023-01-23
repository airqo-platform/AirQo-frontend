# Netmanager Application

This application is used for monitoring, device registration, location registration. Can be accessed here: https://staging-platform.airqo.net/ and https://platform.airqo.net/

## Local Setup

npm is our package manager of choice here. Check out setup instructions [here](https://nodejs.org/dist/) if you don't have it installed already. <br/><br/>
**Note: This project is currently using node version 14.**

To run the app, enter the project directory <br/>

**a) Add the `.env` file**

You need to fill actual values to the environment variables while creating the respective `.env` file from [.env.sample](./.env.sample) file.
Note that the variables with no (dummy)values are not required to get the app up and running.

**b) Install all the needed dependencies**

    npm install

**c) Run in Development mode**

    npm run dev

**d) Run in Staging mode**

    npm run stage

**e) Run in Production mode**

    npm run prod

Now, the application should be running on `http://localhost:5000`.
