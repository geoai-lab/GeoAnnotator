from flask import Flask, jsonify 
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
def tweet_serializer(tweet):
    return{
        'id': tweet.id,
        'content': tweet.content
    }

@app.route('/api', methods=['GET'])
def index():
    tweets = tweet_database.query.order_by(func.random()).first()
    content = tweets.text
    return jsonify(content)
if __name__ == '__main__':
    app.run(debug = True)