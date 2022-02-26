from flask_sqlalchemy import SQLAlchemy
from uuid import uuid4
db = SQLAlchemy()
def get_uuid():
    return uuid4().hex

class tweet_database(db.Model):
    __tablename__ = 'HarveyTwitterDataSet'
    index = db.Column(db.Integer)
    id = db.Column(db.Integer, primary_key = True)
    text = db.Column(db.String, nullable = False)
    created_at = db.Column(db.String)
    def __str__(self):
        return f'{self.id},{self.text},{self.created_at}'
class tpr_database(db.Model):
    __tablename__ = 'NeuroTPR-dataset'
  
    text = db.Column(db.String, nullable = False)
    id = db.Column(db.Integer, primary_key = True)
    created_at = db.Column(db.String)
    neuro_data = db.Column(db.String, nullable = False)
    correction_of_neuro = db.Column(db.String, nullable = False)
    def __str__(self):
        return f'{self.id},{self.text},{self.created_at},{self.neuro_data},{self.correction_of_neuro}'

class User(db.Model):
    __tablename__ = "User"
    id = db.Column(db.String(32), primary_key=True, unique=True, default=get_uuid)
    email = db.Column(db.String(345), unique=True)
    password = db.Column(db.Text, nullable=False)