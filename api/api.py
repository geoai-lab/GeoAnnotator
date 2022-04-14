from flask import Flask, jsonify, request, session,redirect, url_for
import bcrypt 
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import func
from sqlalchemy.exc import IntegrityError
import os
from sqlalchemy.orm import load_only
from flask_bcrypt import Bcrypt
import urllib.parse
from itertools import groupby
from operator import attrgetter
import json
from flask_cors import CORS, cross_origin
from flask_session import Session
import redis
from datetime import datetime, timedelta, timezone
from models import db, tpr_database, User, LoginForm, Project, Submission, CompareSubmission
from dotenv import load_dotenv
from flask_login import LoginManager, login_required, login_user, current_user, logout_user
from sqlalchemy.orm import sessionmaker
import pandas as pd 
import requests
load_dotenv()
app = Flask(__name__,static_folder="../build", static_url_path='/')#
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///HarveyTwitter.db"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
app.config["SECRET_KEY"] = "6236413AA53537DE57D1F6931653B"
app.config['SQLALCHEMY_ECHO'] = True
app.config['SESSION_TYPE'] = "filesystem" # causes bugs right here this needs to be in redis soon need to download reddis and do some reddis cli stuff
app.config['SESSION_USE_SIGNER'] = True
#app.config['SESSION_COOKIE_NAME']
#app.config['SESSION_COOKIE_DOMAIN]
#app.config['SESSIO N_COOKies]
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
    optionsData = jsonify(json.load(open('../../createProjectOptions.json'))) # '../../createProjectOptions.json'
    configurationsData = json.load(open('../../configuration_data.json'))



@login_manager.user_loader
def load_user(user_id):
    return User.query.filter_by(id=user_id).first()


@app.route('/')
def index():
    return app.send_static_file("index.html")

@app.route("/@me", methods = ["POST"]) # might need to change 
def get_current_user():
    if not session["project_name"]:
        return jsonify({"error": "did not select project"}), 401
   
    if not current_user.is_authenticated:
        return jsonify({"error": "Unauthorized"}), 401
    
    return jsonify({
        "id": str(current_user.id),
        "email": current_user.email,
        "username": current_user.username
    }),200


@app.route("/login", methods=["POST"])
def login():
    loginform = LoginForm()
    email = request.json["email"]
    password = request.json["password"]
    project_name = request.json["project"]
    session["project_name"] = project_name
    user = User.query.filter_by(email=loginform.email.data).first()
    if user is None:
        return jsonify({"error": "Wrong Email/Password"}), 401

    if not bcrypt.check_password_hash(user.password, loginform.password.data):
        return jsonify({"error": "Wrong Email/Password"}), 401
    
    login_user(user)
    return jsonify({
        "id": str(user.id),
        "email": user.email
    }),200



@app.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return redirect("/", code=200)

@app.route("/createprojects", methods=["GET"])
@login_required
def create():
    return optionsData, 200

@app.route("/project+descriptions", methods=["GET","POST"])
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
    
    return jsonify({
        "id": str(new_user.id),
        "email": new_user.email
    }), 200

@app.route('/comparison', methods =['GET','POST'])
@login_required
def compare_data():
    project_name = session["project_name"]
    user_data = User.query.with_entities(User.username)
    list_usernames =[]

    to_send_data = []    
    alreadySubmitted_ids = [idvid for subid in CompareSubmission.query.filter_by(userid = current_user.id).options(load_only(CompareSubmission.submissionid_1, CompareSubmission.submissionid_2)).all() for idvid in [subid.submissionid_1,subid.submissionid_2]]
                       # need to change the tweet id here later on 
    
    # grab submissions you haven't looked at yet 
    notYet_submitted = Submission.query.filter_by(project_name= project_name).filter(Submission.submission_id.notin_(alreadySubmitted_ids)) \
                                .join(tpr_database, Submission.tweetid == tpr_database.id) \
                                .join(Project, Submission.project_name == project_name) \
                                .filter_by(project_name = project_name).add_columns(tpr_database.text, Submission.submission_id, Submission.annotation,Submission.username, Project.geo_json, tpr_database.id, Submission.userid) 

    df = pd.DataFrame(notYet_submitted, columns = ["SubmissionObject","text","submission_id","annotation","username","geo_json","id","userid"]).astype(str)
    to_iterate =None  # grab the first group of unique IDS
    for name, group in df.groupby('id',sort=False):
        to_iterate = group
        break 
    # all_submissions = Submission.query.filter_by(project_name = project_name, tweetid = "901774898623692800")\
    #                                 .join(tpr_database, Submission.tweetid == tpr_database.id) \
    #                                     .join(Project, Submission.project_name == project_name) \
    #                                         .filter_by(project_name = project_name) \
    #                                               .add_columns(tpr_database.text, Submission.submission_id, Submission.annotation,Submission.username, Project.geo_json, tpr_database.id, Submission.userid) 
               
                   
    for idx,filtered_submission in to_iterate.iterrows():  # each group is a tweet set
        to_send_data.append({"text": filtered_submission.text,
        "submission_id": str(filtered_submission.submission_id),
        "annotation": json.loads(filtered_submission.annotation)["annotation"],
        "username":filtered_submission.username,
        "projectGeojson": json.loads(filtered_submission.geo_json),
        "tweetid":str(filtered_submission.id),
        "userid":str(filtered_submission.userid)})
    return jsonify(to_send_data), 200


@app.route('/api-grab/<tweetid>', methods=['GET','POST'])
@login_required
def app_data(tweetid):
    submissions_exists = Submission.query.filter_by(userid = current_user.id) is not None 
    if(submissions_exists):
        tweet_ids = [ids.tweetid for ids in Submission.query.filter_by(userid = current_user.id, project_name = session["project_name"]).options(load_only(Submission.tweetid)).all()]
        tweets = tpr_database.query.filter(tpr_database.id.notin_(tweet_ids)).first()
    else:
        tweets = tpr_database.query.filter_by(id = "901774900481970176").first() #"901774900481970176" #.order_by(func.random()).first() #func.random()
    if(tweetid != 'any'):
        tweets = tpr_database.query.filter_by(id = str(tweetid)).first() 
    content = tweets.text
    project_name = session["project_name"]
    if project_name:
        project_json = Project.query.filter_by(project_name = project_name).first()
    else:
        return jsonify({"error": "No Project on session"}), 409
    urlEncoded = urllib.parse.quote(tweets.text)
    toRequestModel = "{}={}".format(configurationsData['modelLink'],urlEncoded)
    response = requests.get(toRequestModel)
    if response.status_code != 200:
        return  jsonify({"error": "Rest Api Model unable to grab data"}), 409

    neuro_results_json = response.json()['annotation']
    toSend = {'id': str(tweets.id), 
     'content': content,
     'neuro_result':neuro_results_json,
     'project_description': {"label":project_json.project_name, "geo_json": json.loads(project_json.geo_json)}}
    return jsonify(toSend)



# NEED TO TRY ON MULTIPLE USERS DOING IT AT THE SAME TIME! 
@app.route('/api/submit', methods=['POST'])
@login_required
def submission():
    json_object = request.json
    tweetid =json_object["tweetid"]
    project = session["project_name"]
    highlight = json_object["highlight"]
    spatial_footprint = json_object["spatial-footprint"]
    timestamp = json_object["timestamp"]
    category = json_object["category"]

    annotation = json.dumps({"annotation": {
        "highlight": highlight , 
        "spatial-footprint": spatial_footprint,
        "category": category
    }})
    new_submission = Submission(userid = current_user.id, tweetid = tweetid, project_name = project,
                 timestamp = timestamp, annotation = annotation, username = current_user.username)
    db.session.add(new_submission)
    db.session.commit()
    
    return jsonify("Success"), 200

@app.route('/compare/submit', methods=['POST'])
@login_required
def compare_submission():
    json_object = request.json
    
    userId1 = json_object['submission-userid-1']
    userId2 = json_object['submission-userid-2']
    submissionid1 = json_object['submissionid-1']
    submissionid2 = json_object['submissionid-2']
    choosenId = json_object['choosing-correct-submission']
    CurrentUserId = current_user.id
    new_submission = CompareSubmission(userid = CurrentUserId,
                                     submission_userid_1 = userId1, 
                                    submission_userid_2 = userId2, 
                                    submissionid_1 = submissionid1,
                                    submissionid_2 = submissionid2,
                                    choosing_correct_submission = choosenId)
    db.session.add(new_submission)
    db.session.commit()
    return jsonify("Success"), 200
if __name__ == '__main__':
    app.run(host='0.0.0.0')