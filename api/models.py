from click import password_option
from flask_sqlalchemy import SQLAlchemy
from uuid import uuid4
from flask_login import UserMixin
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired
from flask import jsonify, json
db = SQLAlchemy()
def get_uuid():
    return uuid4().hex

class tweet_database(db.Model):
    __tablename__ = 'TwitterDataSet'
    id = db.Column(db.String, unique=True, primary_key = True)
    text = db.Column(db.String, nullable = False)
    created_at = db.Column(db.String)
    projectName = db.Column(db.String)
    def __str__(self):
        return f'{self.id},{self.text},{self.created_at}'
class tpr_database(db.Model):
    __tablename__ = 'NeuroTPR-dataset'
    text = db.Column(db.String, nullable = False)
    id = db.Column(db.String, unique=True,primary_key = True)
    created_at = db.Column(db.String)
    neuro_data = db.Column(db.String, nullable = False)
    correction_of_neuro = db.Column(db.String, nullable = False)
    def __str__(self):
        return f'{self.id},{self.text},{self.created_at},{self.neuro_data},{self.correction_of_neuro}'

# class tweet_submission(db.Model):
#     __tablename__ = 'Annotation-Submission'
  
    
#     userid = db.Column(db.String(32), unique=True, default=get_uuid)
#     tweetid = db.Column(db.String, unique=True)
    
#     correction_of_neuro = db.Column(db.String, nullable = False)
#     def __str__(self):
#         return f'{self.id},{self.text},{self.created_at},{self.neuro_data},{self.correction_of_neuro}'

class User(db.Model,UserMixin):
    __tablename__ = "User"
    id = db.Column(db.String(32), primary_key=True, unique=True, default=get_uuid)
    email = db.Column(db.String(345), unique=True)
    username = db.Column(db.String(345), unique=True)
    password = db.Column(db.Text, nullable=False)

class LoginForm(FlaskForm):
    email = StringField('email', validators=[DataRequired()])
    password = PasswordField('password', validators=[DataRequired()])
    submit= SubmitField('Sign-in')

class Project(db.Model):
    __tablename__ = 'projects'
    project_id = db.Column(db.String(32), primary_key=True, unique=True, default=get_uuid)
    project_name = db.Column(db.String, nullable = False)
    geo_json = db.Column(db.String)
  
class Submission(db.Model):
    __tablename__ = 'submission'
    submission_id = db.Column(db.String(32), primary_key=True, unique=True, default=get_uuid)
    userid = db.Column(db.String(32))
    username = db.Column(db.String)
    tweetid = db.Column(db.String)
    project_name = db.Column(db.String, nullable = False)
    timestamp = db.Column(db.String)
    annotation = db.Column(db.String)

class CompareSubmission(db.Model):
    __tablename__ = 'compare-submissions'
    compareSubmissionId = db.Column(db.String(32), primary_key=True, unique=True, default=get_uuid)
    submission_userid_1 = db.Column(db.String)
    submission_userid_2 = db.Column(db.String)
    submissionid_1 = db.Column(db.String)
    submissionid_2 = db.Column(db.String)
    choosing_correct_submission = db.Column(db.String)
    userid = db.Column(db.String(32))
   
  





  