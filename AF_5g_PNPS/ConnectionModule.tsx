import io from "socket.io-client";

export class Messenger_IO {
  constructor(serverUrl) {
    this.socket = io(serverUrl);
    console.log("Messenger_IO constructed", serverUrl);

    this.socket.on("connect", () => {
      const { url } = this.socket.request;
      console.log(`연결됨: ${url}`);
    });

    this.socket.on("message", (text) => {
      console.log(`메시지: ${text}`);
    });
  }

  sendMessage(message) {
    console.log("Messenger_IO message", message);
    this.socket.emit("send_message", message);
  }
}
