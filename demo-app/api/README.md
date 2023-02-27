#### Welcome to the Calendar API!

Run the app by doing the following:
1. `cd api`
1. `npm i`
1. `npm run serve`

Alternatively, to run the app with Docker you can run the following from the `api` folder:

```
docker build --build-arg GITHUB_TOKEN=<access-token> -t insightorchards/cal-api .
docker run --name calendar-api -p 4000:4000 insightorchards/cal-api
```

#### Deploying to Heroku

We run the backend on Heroku as a container. In order to deploy, cd to the `api` folder and run:

heroku container:login
heroku container:push web --app io-cal-backend
heroku container:release web --app io-cal-backend
