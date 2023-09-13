from flask import Flask, render_template, request
from flask_socketio import SocketIO
import tailer
import threading

app = Flask(__name__)
socketio = SocketIO(app, logger=True, engineio_logger=True, cors_allowed_origins="*")

def tail_file(filename, sid):
    print(f"스레드 시작: {filename} 파일을 모니터링합니다.")  # 로그 추가
    for line in tailer.follow(open(filename)):
        print(f"새로운 라인 발견: {line}")  # 로그 추가
        socketio.emit('new_log_line', {'log_line': line}, room=sid)

@app.route('/')
def index():
    print("루트 URL에 접근")  # 로그 추가
    return render_template('index.html')

@socketio.on('connect')
def handle_connect():
    sid = request.sid
    print(f"새로운 소켓 연결: {sid}")  # 로그 추가
    for filename in ['file1.log', 'file2.log']:
        t = threading.Thread(target=tail_file, args=(filename, sid))
        t.start()

if __name__ == '__main__':
    print("서버 시작")  # 로그 추가
    socketio.run(app, host='0.0.0.0', port=7000)
