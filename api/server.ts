import { app } from './app';

const port = process.env.NODE_ENV === 'test' ? 4001 : 4000;

app.listen(port, () => {
  console.log(`Calendar application is running on port ${port}.`);
});
