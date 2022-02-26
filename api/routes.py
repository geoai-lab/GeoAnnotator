from flask import Flask, jsonify, request, url_for, Blueprint
import json
import bcrypt 
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import func
from sqlalchemy.exc import IntegrityError
import os
from flask_jwt_extended import create_access_token
from flask_jwt_extended import current_user
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager
import json
