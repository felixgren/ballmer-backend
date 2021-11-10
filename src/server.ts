import express, { Application } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { createServer, Server as HTTPServer } from 'http';
export class Server {
  private httpServer: HTTPServer;
  private app: Application;
  private io: SocketIOServer;

  // Stores connected sockets
  private activeSockets: string[] = [];

  private readonly DEFAULT_PORT = 5000;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: '*',
        methods: 'GET, POST',
        // methods: 'GET, POST, PUT, DELETE, OPTIONS',
        // allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept',
        // credentials: true,
      },
    });

    this.configureApp();
    this.handleRoutes();
    this.handleSocketConnection();
  }

  // Tell express which static file to serve
  private configureApp(): void {
    const path = require('path');
    this.app.use(express.static(path.join(__dirname, '../public')));
  }

  private handleRoutes(): void {
    this.app.get('/', (req, res) => {
      res.sendFile('index.html');
    });
  }

  private handleSocketConnection(): void {
    this.io.on('connection', (socket) => {
      console.log(`Start connecting ID: ${socket.id}...`);

      // Check if connecting user exists in activeSockets[]
      const existingSocket = this.activeSockets.find(
        (existingSocket) => existingSocket === socket.id
      );

      if (!existingSocket) {
        this.activeSockets.push(socket.id);

        socket.emit('update-user-list', {
          users: this.activeSockets.filter(
            (existingSocket) => existingSocket !== socket.id
          ),
        });

        socket.broadcast.emit('update-user-list', {
          users: [socket.id],
        });
      }

      socket.on('call-user', (data: any) => {
        socket.to(data.to).emit('call-made', {
          offer: data.offer,
          socket: socket.id,
        });
      });

      // Respond to call
      socket.on('make-answer', (data) => {
        socket.to(data.to).emit('answer-made', {
          socket: socket.id,
          answer: data.answer,
        });
      });

      socket.on('reject-call', (data) => {
        socket.to(data.from).emit('call-rejected', {
          socket: socket.id,
        });
      });

      socket.on('disconnect', () => {
        console.log(`Disconnecting ${socket.id}`);
        this.activeSockets = this.activeSockets.filter(
          (existingSocket) => existingSocket !== socket.id
        );
        socket.broadcast.emit('remove-user', {
          socketId: socket.id,
        });
      });
    });
  }

  public listen(callback: (port: number) => void): void {
    this.httpServer.listen(this.DEFAULT_PORT, () =>
      callback(this.DEFAULT_PORT)
    );
  }
}
