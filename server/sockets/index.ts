import { schedulesSocket } from './schedules';

export * from './schedules';

export function init(io: SocketIO.Server) {
    console.log("Init sockets");
    schedulesSocket.init(io);
}