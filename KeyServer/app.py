from flask import Flask, jsonify, abort
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.backends import default_backend
import hashlib
import json

app = Flask(__name__)

# 해시 값과 비밀키를 저장하는 간단한 데이터베이스 역할을 하는 딕셔너리
key_database = {}
@app.route('/generate_key', methods=['GET'])
def generate_key():
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
        backend=default_backend()
    )
    public_key = private_key.public_key()

    private_pem = private_key.private_numbers()
    public_pem = public_key.public_numbers()

    public_key_n = public_pem.n
    public_key_e = public_pem.e

    private_key_values = {
        "n": hex(private_pem.public_numbers.n)[2:],
        "e": hex(private_pem.public_numbers.e)[2:],
        "d": hex(private_pem.d)[2:],
        "p": hex(private_pem.p)[2:],
        "q": hex(private_pem.q)[2:],
        "dmp1": hex(private_pem.dmp1)[2:],
        "dmq1": hex(private_pem.dmq1)[2:],
        "coeff": hex(private_pem.iqmp)[2:]
    }
    public_key_values = {
        "n": hex(private_pem.public_numbers.n)[2:],
        "e": hex(private_pem.public_numbers.e)[2:]
    }

    private_key_json = json.dumps(private_key_values)
    public_key_json = json.dumps(public_key_values)

    # 공개키의 해시값을 생성
    hasher = hashlib.sha256()
    hasher.update(public_key_json.encode('utf-8'))
    public_key_hash = hasher.hexdigest()

    # 데이터베이스에 저장
    key_database[public_key_hash] = private_key_json

    return jsonify({"hash": public_key_hash, "public_key": public_key_json})


@app.route('/get_key/<string:hash_value>', methods=['GET'])
def get_key(hash_value):
    private_key_json = key_database.get(hash_value)
    if private_key_json is None:
        abort(404, description="Key not found")
    return jsonify({"private_key": private_key_json})


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=6000)
