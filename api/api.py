from flask import Flask, jsonify, request
import json
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import func
app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///HarveyTwitter.db"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
db = SQLAlchemy(app)


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

import json
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