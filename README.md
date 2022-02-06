
install all server dependencies
  npm install

install client dependencies
  npm run client-install

 


create an .env file inside root folder and populate with

    DATABASE_ATLAS   = your atlas database
    publishable_key  = your stripe publishable key.
    stripe_secretKey = your stripe project secret.

    pusherAppId  = pusher app Id
    pusherClient = pusher app key
    pusherSecret = pusher app secret


create an .env inside the client folder and populate with

    REACT_APP_PUSHER_CLIENTID = your pusher app key.

    REACT_APP_GOOGLECLIENTID  = your google

make sure you have created a google login api key - https://developers.google.com/identity/sign-in/web/sign-in

to run server and react front-end:
      npm run dev
