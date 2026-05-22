import { Socket, Server as SocketIoServer } from "socket.io";

export function registerUserEvents(io: SocketIoServer, socket: Socket) {
    socket.on("testSocket", (data) => {
        socket.emit("testSocketResponse", { msg: "Hello from the server!"});
    })
}
