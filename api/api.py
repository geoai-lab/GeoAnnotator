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
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta, timezone
from models import db, tweet_database, User, LoginForm, Project, Submission, CompareSubmission
from dotenv import load_dotenv
from flask_login import LoginManager, login_required, login_user, current_user, logout_user
from sqlalchemy.orm import sessionmaker
import pandas as pd 
import requests
from sqlalchemy.types import String, DateTime
import io 
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
bcrypt = Bcrypt(app) # this is encyrpt the app 


CORS(app, supports_credentials=True)
server_session = Session(app)
db.__init__(app)
with app.app_context():
    db.create_all()
login_manager = LoginManager()
login_manager.init_app(app)

with app.app_context():
    # before intialization of the app, commands under here are ran first 
    # Replace with the commented when running the command gunicorn3 -w 3 GeoAnnotator.api:app
    optionsData = jsonify(json.load(open('../../createProjectOptions.json'))) # 'GeoAnnotator/api/createProjectOptions.json'
    configurationsData = json.load(open('../../configuration_data.json')) #  'GeoAnnotator/api/configuration_data.json'



@login_manager.user_loader
def load_user(user_id):
    """
    Loads current user data
    ---
    """
    return User.query.filter_by(id=user_id).first()

@app.route('/')
def index():
    """
    Initialization of flask object 
    ---
    return:
        returns an index.html object built by react's build file.
    """
    return app.send_static_file("index.html")

@app.route("/@me", methods = ["GET"]) # might need to change 
def get_current_user():
    """
    User session data is retrieved through this callback.
    ---
    GET:
      description: Get session data
      security:
        - Session Token 
      responses:
        200:
          content:
            User/json
    """
    if not session["project_name"]:
        return jsonify({"error": "did not select project"}), 401
   
    if not current_user.is_authenticated:
        return jsonify({"error": "Unauthorized"}), 401
    
    return jsonify({
        "id": str(current_user.id),
        "email": current_user.email,
        "username": current_user.username,
        "projectName":session["project_name"]
    }),200


@app.route("/login", methods=["POST"])
def login():
    """
    Function that handles login of user 
    ---
    POST:
      description: Add new user in the session
      responses:
        200:
            description:
               Successfuly log in user onto the session.
        401:
            description:
                User entered wrong username/password that does not match any data on the database.
    """
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
    """
    Function that handles logout of user 
    ---
    POST:
      description: remove curent user in the session
      responses:
        200:
            description:
               Successfuly log out user from the session. 
    """
    logout_user() # flask logout library
    return redirect("/", code=200) # successful log out will redirect to the homepage 

@app.route("/createprojects", methods=["GET"])
@login_required
def create():
    """
    Function that returns state geojson at the create projects page. 
    ---
    GET:
      data: optionsData =>
      responses:
        200:
            description:
               Successfuly log out user from the session. 
    """
    return optionsData, 200

@app.route("/project+descriptions", methods=["GET"])
def project_descriptions():
    """
    Function that returns data from the project database that are not deleted by the user.
    ---
    GET:
      responses:
        200:
            data:
                {"project-name": <Project.project_name>, "geo_json":<Project.geo_json>} 
    """
    projects = Project.query.filter_by(isDeleted = 0).all()
    print(projects)
    list_of_projects = []
    for project in projects:
        list_of_projects.append({"project-name": project.project_name, "geo_json": project.geo_json})
    return jsonify(list_of_projects), 200

@app.route("/createproject-submit", methods=["POST"])
@login_required
def createproject_submission():
    """
    Creation of a new project 
    ---
    POST:
      description: adds a new project item onto the Projects table of the database 
      responses:
        200:
            description:
                new project added
        409:
            description:    
               * if the project name given already exists within the database
    """
    projectName = request.json["Project Name"]
    mapLayers = request.json["map-layers"]
    project_exists = Project.query.filter_by(project_name = projectName).first() is not None

    if(project_exists):
        return jsonify({"error": "project already exists"}), 409
    session['project_name'] = projectName
    new_project = Project(project_name = projectName, geo_json = mapLayers, isDeleted = 0 )
    db.session.add(new_project)
    db.session.commit()
    return  jsonify({"success": "project created"}), 200

@app.route("/register", methods=["POST"])
def register_user():
    """
    By registering a new user in the database, you may add new user data to the database.
    ---
    POST:
      description: Add new user in the database
      responses:
        200:
            description:
                new username and password are added onto the database.
        409:
            description:    
               * if the username used to register already exists in the database
               * if the password entered and the password retyped do not match
    """
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

@app.route('/comparison', methods =['GET'])
@login_required
def compare_data():
    """
    Obtain information for the comparative page. 
    When the user who is the resolver requests data to compare, 
    this method must deliver data that the resolver has not resolved previously. 
    That would be the value of the notYet_submitted variable.
    ---
    GET:
      responses:
        200:
            data:
                list of data that the resolver can compare and resolve 
            format:
                {
                 text:<tweet_database.text>,
                 submission_id:<Submission.submission_id>,
                 annotation:<Submission.annotation>,
                 username:<Submission.username>,
                 projectGeojson:<Project.geo_json>,
                 tweetid:<tweet_database.id>,
                 userid:<Submission.userid>
                 }
                 where current_user=Submission.id values are not in current_user=CompareSubmission.id values
    """
    project_name = session["project_name"]
    to_send_data = []    
    alreadySubmitted_ids = [idvid for subid in CompareSubmission.query.filter_by(userid = current_user.id).options(load_only(CompareSubmission.submissionid_1, CompareSubmission.submissionid_2)).all() for idvid in [subid.submissionid_1,subid.submissionid_2]]
                       # need to change the tweet id here later on 
    
    # grab submissions you haven't looked at yet 
    notYet_submitted = Submission.query.filter_by(project_name= project_name).filter(Submission.submission_id.notin_(alreadySubmitted_ids)) \
                                .join(tweet_database, Submission.tweetid == tweet_database.id) \
                                .join(Project, Submission.project_name == project_name) \
                                .filter_by(project_name = project_name).add_columns(tweet_database.text, Submission.submission_id, Submission.annotation,Submission.username, Project.geo_json, tweet_database.id, Submission.userid) 

    df = pd.DataFrame(notYet_submitted, columns = ["SubmissionObject","text","submission_id","annotation","username","geo_json","id","userid"]).astype(str)
    to_iterate =None  # grab the first group of unique IDS
    # an alternate to implementing the for loop below is by doing df.grouby('id',sort=False).first()
    for name, group in df.groupby('id',sort=False):
        to_iterate = group
        break 
  
    for index,filtered_submission in to_iterate.iterrows():  # each group is a tweet set
        to_send_data.append({"text": filtered_submission.text,
        "submission_id": str(filtered_submission.submission_id),
        "annotation": json.loads(filtered_submission.annotation)["annotation"],
        "username":filtered_submission.username,
        "projectGeojson": json.loads(filtered_submission.geo_json),
        "tweetid":str(filtered_submission.id),
        "userid":str(filtered_submission.userid)})
    return jsonify(to_send_data), 200


@app.route('/api-grab/<tweetid>', methods=['GET'])
@login_required
def app_data(tweetid):
    """
    Obtain information for the Annotation page page. 
    When the user who is the annotator requests data to annotate, 
    this method must deliver data that the annotatoer has not annotated previously. 
    ---
    @param:
        tweetid:  Grab the data in the database where Tweet_database.id == tweetid if this parameter exists.
    ---
    GET:
      responses:
        200:
            data:
                 data that the annotator can annotate
            format:
                {
                 id:<tweet_database.id>,
                 content:<tweet_data.text>,
                 neuro_result: Model rest api data,
                 project_description:{label:<Project.project_name>,geo_json:<Project.geo_json>}
                 }
        409:
            description:
                * If the data from the Model prediction link did not yield any results (i.g. response from the UB servers are not 200)
                * If there is no project in session 

    """
    submissions_exists = Submission.query.filter_by(userid = current_user.id) is not None 
    if(submissions_exists): # if User already annotated data before, find data that the user has not annotated before and return that 
        tweet_ids = [ids.tweetid for ids in Submission.query.filter_by(userid = current_user.id, project_name = session["project_name"]).options(load_only(Submission.tweetid)).all()]
        tweets = tweet_database.query.filter_by(projectName = session["project_name"]).filter(tweet_database.id.notin_(tweet_ids)).first()
    else: # It's the user's first time annotating, therefore pick the first tweet in the database
        tweets = tweet_database.query.filter_by(projectName = session["project_name"]).first() 
    if(tweetid != 'any'):
        tweets = tweet_database.query.filter_by(id = str(tweetid)).first() 
    content = tweets.text
    project_name = session["project_name"]
    if project_name: # if the session has a project, then query the project GeoJson
        project_json = Project.query.filter_by(project_name = project_name).first()
    else: # Since users must first register a project before signing in, this is extremely unlikely to occur.
        return jsonify({"error": "No Project on session"}), 409
    urlEncoded = urllib.parse.quote(tweets.text) #encode the text content of a tweet so that it may be converted into a url format
    toRequestModel = "{}={}".format(configurationsData['modelLink'],urlEncoded) # Using the model url link from configuration.json, get a request using the URLencoded method.
    response = requests.get(toRequestModel)
    if response.status_code != 200:
        # If the model url link does not return a response of 200, send a 409 since we do not have model prediction data.
        # Cases of where the code fires here is when the servers at the University at Buffalo are down.
        return  jsonify({"error": "Rest Api Model unable to grab data"}), 409

    neuro_results_json = response.json()['annotation'] # data from the response
    toSend = {'id': str(tweets.id), 
     'content': content,
     'neuro_result':neuro_results_json,
     'project_description': {"label":project_json.project_name, "geo_json": json.loads(project_json.geo_json)}}
    return jsonify(toSend), 200

@app.route('/uploadfile', methods=['POST'])
@login_required
def uploading_textFile():
    """
   This method is related to the create project part, 
   since if a user submits twitter data, it must first 
   go via this method to be preprocessed and stored in the database.
    ---
    POST:
      responses:
        200:
            description:
                 The data from tweets has been successfully preprocessed and should now be available in the database.
        401:
            description:
                * Preprocessing failed due to data format. 

    """
    try: 
        projectName = request.form['projectName'] #The name of the project on which the user wishes to upload new tweets
        project_exists = Project.query.filter_by(project_name = projectName).first() is not None
        if project_exists: # if the project name already exists, then tell the user
            return jsonify({"error":"Project Name Already Exists"}), 401
        file = request.files['file']
        df = pd.read_json(file.stream.read().decode("UTF8"), lines=True, encoding="utf8")[['text','id','created_at']]
        df['projectName'] = projectName
        dtype={"text": String(),"id":String(), "created_at":DateTime(), "projectName":String()}
        rowsAffected = df.to_sql(name = 'TwitterDataSet',con = db.engine, index = False, if_exists='append',dtype=dtype) # upload onto the database 
    except Exception as e: #If the entire procedure above fails, publish the line number where the error occurred.
        print(
        type(e).__name__,          # TypeError
        __file__,                  # /tmp/example.py
        e.__traceback__.tb_lineno  # 2
        )
        return jsonify({"error": "File Upload Fail"}), 401
    return jsonify({"success": "Upload Complete"}), 200

@app.route('/deleteproject', methods=['POST'])
@login_required
def deleting_projects():
    """
    This approach replaces the value on the isDeleted part of the Project column by one.
    If we replace the column value with 1, we will not display the user this project since
    they requested that it be removed.
    ---
    POST:
      responses:
        200:
            description:
                 Project data has successfuly been deleted/hidden fromn the user's view
    """
    projects = request.json['projects'] # contains a list of projects that the user desires to get deleted
    queried_projects = Project.query.filter(Project.project_name.in_(projects))
    for query in queried_projects: # we replace the value with 1 
        query.isDeleted = 1 
    db.session.commit()
    return jsonify({"success": "Upload Complete"}), 200

@app.route('/api/submit', methods=['POST'])
@login_required
def submission():
    """
    This method handles the event when a user submits an annotation. 
    ---
    POST:
      responses:
        200:
            description:
                 adds a new row value in the Submission table on the HarveyTwitter.db
    """
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
    """
    When a resolver submits a resolution from the compare submissions page, this method handles the event.
    ---
    POST:
      responses:
        200:
            description:
                 adds a new row value in the compare-submission table on the HarveyTwitter.db
    """
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