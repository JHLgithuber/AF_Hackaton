from flask import Flask, render_template
from flask_socketio import SocketIO

app = Flask(__name__)
socketio = SocketIO(app)

@app.route("/")
def main():
    return "WebSocket Server is running"

@socketio.on("message")
def handle_message(msg):
    print("Received message:", msg)
    socketio.emit("message", "This is a message from the server")

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000)
