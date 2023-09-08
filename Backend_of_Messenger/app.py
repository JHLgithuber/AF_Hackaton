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
    #print(f"Log: {log_entry}")

    socketio.emit('receive_message', message)
    print(f"Sendied message: {message}")
    #socketio.emit('update_logs', log_entry)  # 모든 클라이언트에게 로그 업데이트 이벤트 발송

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000,debug=True)
