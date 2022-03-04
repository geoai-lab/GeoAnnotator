from flask import Flask, jsonify, request, session,redirect
import bcrypt 
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import func
from sqlalchemy.exc import IntegrityError
import os

from flask_bcrypt import Bcrypt

import json
from flask_cors import CORS, cross_origin
from flask_session import Session
import redis
from datetime import datetime, timedelta, timezone
from models import db, tpr_database, User, LoginForm, Project
from dotenv import load_dotenv
from flask_login import LoginManager, login_required, login_user, current_user, logout_user


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
login_manager = LoginManager()
login_manager.init_app(app)

with app.app_context():
    optionsData = jsonify(json.load(open('../../createProjectOptions.json')))



@login_manager.user_loader
def load_user(user_id):
    return User.query.filter_by(id=user_id).first()


@app.route("/@me", methods = ["POST"])
@login_required
def get_current_user():
    
    #print(current_user.is_authenticated)
    if not current_user.is_authenticated:
        return jsonify({"error": "Unauthorized"}), 401
    
    return jsonify({
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username
    }),200


@app.route("/login", methods=["POST"])
def login():
    loginform = LoginForm()
    email = request.json["email"]
    password = request.json["password"]

    user = User.query.filter_by(email=loginform.email.data).first()
    if user is None:
        return jsonify({"error": "Unauthorized"}), 401

    if not bcrypt.check_password_hash(user.password, loginform.password.data):
        return jsonify({"error": "Unauthorized"}), 401
    
    login_user(user)
   

    return jsonify({
        "id": user.id,
        "email": user.email
    }),200



@app.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return redirect("/", code=200)

@app.route("/createproject", methods=["GET"])
@login_required
def create():
    return optionsData, 200

@app.route("/project+descriptions", methods=["GET"])
@login_required
def project_descriptions():
    projects = Project.query.all()
    list_of_projects = []
    for project in projects:
        list_of_projects.append({"project-name": project.project_name, "geo_json": project.geo_json})
    return jsonify(list_of_projects), 200

@app.route("/createproject-submit", methods=["POST"])
@login_required
def createproject_submission():
    projectName = request.json["Project Name"]
    mapLayers = request.json["map-layers"]
    project_exists = Project.query.filter_by(project_name = projectName).first() is not None

    if(project_exists):
        return jsonify({"error": "project already exists"}), 409
    new_project = Project(project_name = projectName, geo_json = mapLayers )
    db.session.add(new_project)
    db.session.commit()
    return redirect("/createproject", code=200)

@app.route("/register", methods=["POST"])
def register_user():
    print(request.json)
    email = request.json["email"]
    password = request.json["password"]
    retype = request.json["retypepassword"]
    username = request.json["username"]
    user_exists = User.query.filter_by(email=email).first() is not None

    if user_exists:
        return jsonify({"error": "User already exists"}), 409
    elif password != retype:
        return jsonify({"error":"password do not match"}), 409
    hashed_password = bcrypt.generate_password_hash(password)
    new_user = User(email=email, username=username ,password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    
    login_user(new_user)
    return jsonify({
        "id": new_user.id,
        "email": new_user.email
    }), 200

@app.route('/compare', methods =['GET'])
@login_required
def compare_data():
    return 

@app.route('/api', methods=['GET'])
@login_required
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