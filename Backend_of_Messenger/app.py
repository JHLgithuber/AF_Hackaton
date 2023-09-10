from flask import Flask, render_template, jsonify
from flask_socketio import SocketIO

app = Flask(__name__)
socketio = SocketIO(app)

logs = []  # 로그를 저장할 리스트


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/logs')
def show_logs():
    return jsonify(logs)


@socketio.on('send_message')
def handle_message(message):
    print(f"Received message: {message}")

    user_id = message.get('user').get('_id')
    message['user']['_id'] = 101
    log_entry = {
        'from': user_id,
        'JSON_DATA': message
    }

    logs.append(log_entry)  # 로그 저장
    """
    print(f"Log: {log_entry}")
    """

    socketio.emit('receive_message', message)
    print(f"Sendied message: {message}")


@socketio.on('request_public_key')
def handle_request_public_key(data):
    print(f"Received request_public_key: {data}")
    """
    user_id = data.get('user').get('_id')
    log_entry = {
        'from': user_id,
        'JSON_DATA': data
    }

    logs.append(log_entry)  # 로그 저장
    """
    socketio.emit('receive_request_public_key', data)
    print(f"Sendied request_public_key: {data}")


@socketio.on('response_public_key')
def handle_public_key(public_key):
    print(f"Received response_public_key: {public_key}")
    """
    user_id = public_key.get('user').get('_id')
    log_entry = {
        'from': user_id,
        'JSON_DATA': public_key
    }

    logs.append(log_entry)  # 로그 저장
    """
    socketio.emit('receive_response_public_key', public_key)
    print(f"Sendied response_public_key: {public_key}")


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
