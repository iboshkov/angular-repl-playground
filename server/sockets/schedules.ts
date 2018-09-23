
export class SchedulesSocket {
    io: SocketIO.Server;

    init(io: SocketIO.Server): any {
        this.io = io;
        this.io.on('connection', (socket) => {
            console.log("Welcome a user");

            this.io.emit("Welcome");
        });
    }

    scheduleLockChanged() {
        this.io.emit("scheduleLockChanged");
    }
}

export const schedulesSocket = new SchedulesSocket();