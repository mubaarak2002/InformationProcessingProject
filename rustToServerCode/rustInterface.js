const io = require("socket.io-client");
socket = io("http://localhost:3000");

const net = require("net")
const server = net.createServer((socket) => {
    console.log("Rust Client is now Connected and listening on Localhost")

    socket.on("data", (data) => {
        const message = data.toString.trim();
        console.log("Recieved: " + message);
        
        data = JSON.parse(message)
        socket.emit("rust-message", { data });

    });

    socket.on("end", () => {
        console.log("ended")
    });
}) ;

server.listen(8080, () => {
    console.log("Listening for Rust communication on port 8080")
})
