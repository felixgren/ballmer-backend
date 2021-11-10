import { Server } from './server';

const server = new Server();

server.listen((port) => {
  if (process.env.NODE_ENV === 'production') {
    console.log(
      `Server listening on port ${port} in ${process.env.NODE_ENV} mode`
    );
  } else {
    console.log(`Server is listening on http://localhost:${port}`);
  }
});
