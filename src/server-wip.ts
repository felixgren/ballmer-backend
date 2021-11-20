// const express = require('express');
// const app = express();
// const http = require('http').Server(app);

// const io = require('socket.io')(http, {
//     cors: {
//         origin: '*',
//         methods: ['GET', 'POST'],
//     },
// });

// app.use(express.static('../dist/'));

// app.get('/', function (req, res) {
//     res.sendFile(__dirname + '../../dist/index.html');
// });

// let players = {};

// (() => {
//     setup();

//     // Update player position, roughly matches 120 refresh
//     setInterval(function () {
//         io.sockets.emit('playerPositions', players);
//     }, 8);
// })();

// function setup() {
//     io.on('connection', function (socket) {
//         // Client connect...
//         console.log(`User ${socket.id} connected`);

//         // Add to server players object
//         players[socket.id] = {
//             position: [0, 0, 0],
//             direction: [0, 0, 0],
//         };

//         // We give all clients notice of new player and their ID..
//         socket.broadcast.emit(
//             'player connect',
//             socket.id,
//             io.engine.clientsCount
//         );

//         // We give client their ID, playerCount and playerIDs
//         socket.emit(
//             'initPlayer',
//             { id: socket.id },
//             io.engine.clientsCount,
//             Object.keys(players)
//         );

//         // We give clients notice of disconnection and the their ID
//         socket.on('disconnect', function () {
//             console.log(`User ${socket.id} disconnected`);
//             socket.broadcast.emit(
//                 'player disconnect',
//                 socket.id,
//                 io.engine.clientsCount
//             );
//             // Delete from players object
//             delete players[socket.id];
//         });

//         // On chat message emit it to everyone
//         socket.on('chat message', function (username, message) {
//             io.emit('chat message', username, message);
//         });

//         socket.on('kill message', function (shooter, killed) {
//             io.emit('kill message', shooter, killed);
//         });

//         // Data every client uploads
//         socket.on('updateClientPos', (position, direction) => {
//             if (players[socket.id]) {
//                 players[socket.id].position = position;
//                 players[socket.id].direction = direction;
//             }
//         });

//         socket.on('triggerRemoteRocket', () => {
//             socket.broadcast.emit(
//                 'shootSyncRocket',
//                 players[socket.id],
//                 socket.id
//             );
//         });
//     });

//     let port = process.env.PORT;
//     if (port == null || port == '') {
//         port = 3000;
//     }

//     http.listen(port, function () {
//         console.log(`Listening on port ${port}`);
//     });
// }

// Code from above but written as class

import express, { Application } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { createServer, Server as HTTPServer } from 'http';

export class GameServer {
  private httpServer: HTTPServer;
  private app: Application;
  private io: SocketIOServer;

  private readonly dynamicPort = process.env.PORT || 5000;

  // Stores players
  //   private players: { [id: string]: Player } = {};
  private players: { [id: string]: any } = {};

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

    this.configApp();
    this.setupRoute();
    this.handleSocketEvents();
  }

  // Tell express which static file to serve
  private configApp(): void {
    const path = require('path');
    this.app.use(express.static(path.join(__dirname, '../public')));
  }

  private setupRoute(): void {
    this.app.get('/', (req, res) => {
      res.sendFile('index-game.html');
    });
  }

  private handleSocketEvents(): void {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.id} connected`);

      // Add to server players object
      this.players[socket.id] = {
        position: [0, 0, 0],
        direction: [0, 0, 0],
      };

      // We give all clients notice of new player and their ID..
      this.io.emit('player connect', socket.id, this.io.engine.clientsCount);

      // We give client their ID, playerCount and playerIDs
      socket.emit(
        'initPlayer',
        { id: socket.id },
        this.io.engine.clientsCount,
        Object.keys(this.players)
      );

      // We give clients notice of disconnection and the their ID
      socket.on('disconnect', () => {
        console.log(`User ${socket.id} disconnected`);
        this.io.emit(
          'player disconnect',
          socket.id,
          this.io.engine.clientsCount
        );
        // Delete from players object
        delete this.players[socket.id];
      });

      // On chat message emit it to everyone
      socket.on('chat message', (username, message) => {
        this.io.emit('chat message', username, message);
      });

      socket.on('kill message', (shooter, killed) => {
        this.io.emit('kill message', shooter, killed);
      });

      // Data every client uploads
      socket.on('updateClientPos', (position, direction) => {
        if (this.players[socket.id]) {
          this.players[socket.id].position = position;
          this.players[socket.id].direction = direction;
        }
      });

      socket.on('triggerRemoteRocket', () => {
        socket.broadcast.emit(
          'shootSyncRocket',
          this.players[socket.id],
          socket.id
        );
      });
    });
  }

  //   public listen(): void {
  //     this.httpServer.listen(this.port, () => {
  //       console.log(`Listening on port ${this.port}`);
  //     });
  //   }

  public listen(callback: (port: any) => void): void {
    this.httpServer.listen(this.dynamicPort, () => {
      console.log(`Listening on port ${this.dynamicPort}`);
      callback(this.dynamicPort);
    });
  }
}
