import os 
from flask import Flask, request, jsonify, url_for, Blueprint
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager

api = Blueprint('api', __name__)

@app.route("/login", methods=["POST"])
def login():
    username = request.json.get("username", None)
    password = request.json.get("password", None)

    #user = User.query.filter_by(username=username).one_or_none()
    if username != 'test' or password != 'test':
        return jsonify("Wrong username or password"), 401

    # Notice that we are passing in the actual sqlalchemy user object here
    access_token = create_access_token(identity=user)
    return jsonify(access_token=access_token)
