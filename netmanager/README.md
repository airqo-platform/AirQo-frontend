# Netmanager Application
This application is used for monitoring, device registration, location registration. Can be accessed here: https://staging-platform.airqo.net/ and https://platform.airqo.net/

## Local Setup
npm is our package manager of choice here. Check out setup instructions [here](https://nodejs.org/dist/) if you don't have it installed already. <br/><br/>
**Note: This project is currently using node version 14.**

To run the app, enter the project directory <br/>
**a) Add the `.env` file to the root folder.** You can find it [here](https://drive.google.com/drive/folders/1RYuukiTYgVxMBlSa4K8miLYiM_W4T86o)<br/>

**b) Install all the needed dependencies**
    
    
    npm install
**c) Run in Development mode**
 

    npm run dev

**d) Run in Staging mode**
 

    npm run stage

**e) Run in Production mode**
 

    npm run prod

Now, the application should be running on `http://localhost:5000`.