#### Running the UI

The UI can be running using `npm start`. Alternatively, to run the app with Docker you can run the following from the `ui` folder:

```
docker build --build-arg GITHUB_TOKEN=<access-token> -t insightorchards/cal-ui .

docker run --name calendar-ui -p 3000:3000 insightorchards/cal-ui
```

#### Deploying to Heroku

We run the frontend on Heroku as a container. In order to deploy, cd to the `ui` folder and run:

heroku container:login
heroku container:push web --app io-cal-frontend
heroku container:release web --app io-cal-frontend
