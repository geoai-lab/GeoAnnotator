from flask import Flask, jsonify, request, session
import json
import bcrypt 
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import func
from sqlalchemy.exc import IntegrityError
import os
from flask_jwt_extended import create_access_token
from flask_jwt_extended import current_user
from flask_jwt_extended import jwt_required
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, get_jwt, get_jwt_identity, unset_jwt_cookies, jwt_required
import json
from flask_cors import CORS, cross_origin
from flask_session import Session
import redis
from datetime import datetime, timedelta, timezone
from models import db, tpr_database, User
from dotenv import load_dotenv
load_dotenv()
app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///HarveyTwitter.db"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
app.config["SECRET_KEY"] = "6236413AA53537DE57D1F6931653B"
app.config['SQLALCHEMY_ECHO'] = True
app.config['SESSION_TYPE'] = "filesystem" # causes bugs right here this needs to be in redis soon need to download reddis and do some reddis cli stuff
app.config['SESSION_USE_SIGNER'] = True
#app.config['SESSION_COOKIE_NAME']
#app.config['SESSION_COOKIE_DOMAIN]
#app.config['SESSION_COOKies]
#app.config['SESSION_COOKIE_SECURE'] = True # add this to make the cookies invisible or something 
bcrypt = Bcrypt(app)

CORS(app, supports_credentials=True)
server_session = Session(app)
db.__init__(app)
with app.app_context():
    db.create_all()

@app.route("/@me", methods = ["GET"])
def get_current_user():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    user = User.query.filter_by(id=user_id).first()
    print("ME SUCCESSFUL\n\n\n")
    return jsonify({
        "id": user.id,
        "email": user.email
    }) 

@app.after_request
def refresh_expiring_jwts(response):
    try:
        exp_timestamp = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target_timestamp = datetime.timestamp(now + timedelta(minutes=30))
        if target_timestamp > exp_timestamp:
            access_token = create_access_token(identity=get_jwt_identity())
            data = response.get_json()
            if type(data) is dict:
                data["access_token"] = access_token 
                response.data = json.dumps(data)
        return response
    except (RuntimeError, KeyError):
        # Case where there is not a valid JWT. Just return the original respone
        return response

@app.route("/login", methods=["POST"])
def login_user():
    email = request.json["email"]
    password = request.json["password"]

    user = User.query.filter_by(email=email).first()

    if user is None:
        return jsonify({"error": "Unauthorized"}), 401

    if not bcrypt.check_password_hash(user.password, password):
        return jsonify({"error": "Unauthorized"}), 401
    
    session["user_id"] = user.id

    return jsonify({
        "id": user.id,
        "email": user.email
    })



@app.route("/logout", methods=["POST"])
def logout():
    session.pop("user_id")
    return "200"


@app.route("/register", methods=["POST"])
def register_user():
    email = request.json["email"]
    password = request.json["password"]

    user_exists = User.query.filter_by(email=email).first() is not None

    if user_exists:
        return jsonify({"error": "User already exists"}), 409

    hashed_password = bcrypt.generate_password_hash(password)
    new_user = User(email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    
    session["user_id"] = new_user.id

    return jsonify({
        "id": new_user.id,
        "email": new_user.email
    })

@app.route('/api', methods=['GET'])
def index():

    tweets = tpr_database.query.order_by(func.random()).first()
    content = tweets.text
  
    neuro_results_json = json.loads(tweets.correction_of_neuro)
    toSend = {'id': tweets.id, 
     'content': content,
     'neuro_result':neuro_results_json}
    return jsonify(toSend)
@app.route('/api/submit', methods=['POST'])
def submission():
    request_data = json.loads(request.data.decode('utf-8'))
    print(request_data)
    return json.dumps({'success':True}), 200, {'ContentType':'application/json'} 


if __name__ == '__main__':
    app.run(debug = True)