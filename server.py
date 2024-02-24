from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from passlib.hash import bcrypt
from ulid import ULID
import hashlib

app = Flask(__name__)
app.config["SECRET_KEY"] = "secret!"
CORS(app, origins=["http://localhost:3001"])
socketio = SocketIO(app, cors_allowed_origins="*")


app.config["SQLALCHEMY_DATABASE_URI"] = (
    "postgresql://yashdamania@localhost:5432/chat_db"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)


class User(db.Model):
    """Defines the User model for the database."""

    __tablename__ = "users"

    id = db.Column(db.String(150), primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(512), nullable=False)


class Message(db.Model):
    """Defines the Message model for the database."""

    __tablename__ = "messages"

    id = db.Column(db.String(150), primary_key=True)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)
    sender_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    sender_name = db.Column(db.String(150), nullable=False)
    upvotes = db.Column(db.Integer, default=0)
    downvotes = db.Column(db.Integer, default=0)

@socketio.on("get_previous_messages")
def get_previous_messages():
    """event listener to fetch previous messages"""
    previous_messages = Message.query.order_by(Message.timestamp).all()
    #print(previous_messages)
    formatted_messages = [
        {
            "ulid": message.id,
            "user": message.sender_name,
            "message": message.content,
            "upvote": message.upvotes,
            "downvote": message.downvotes,
        }
        for message in previous_messages
    ]

    emit("previous_messages", formatted_messages)

@socketio.on("connect")
def connected():
    """event listener when client connects to the server"""
    print(request.sid)
    print("client has connected")
    emit("connect", {"data": f"id: {request.sid} is connected"})


@socketio.on("data")
def handle_message(data):
    """event listener when client types a message"""
    content = data.get("message")
    user_name = data.get("user")

    user = User.query.filter_by(name=user_name).first()
    if not content or not user_name:
        emit("data", {"error": "Invalid message or user!"})
        return

    ulid = ULID()
    new_message = Message(id=str(ulid), content=content, sender_id=user.id, sender_name = user.name)
    print(new_message.id)
    db.session.add(new_message)
    db.session.commit()

    print("data from the front end: ", str(data))
    emit(
        "data",
        {
            "data": data,
            "id": request.sid,
            "ulid": str(ulid),
            "user": user_name,
            "message": content,
            "upvote": new_message.upvotes,
            "downvote": new_message.downvotes,
        },
        broadcast=True,
    )


@socketio.on("upvote")
def handle_upvote(data):
    msgulid = data.get("msgulid")
    msg = Message.query.filter_by(id=msgulid).first()
    if msg:
        msg.upvotes += 1
        db.session.commit()

        emit("upvote", {"upvote": msg.upvotes, "ulid": msg.id}, broadcast=True)


@socketio.on("downvote")
def handle_downvote(data):
    msgulid = data.get("msgulid")
    msg = Message.query.filter_by(id=msgulid).first()
    if msg:
        msg.downvotes += 1
        db.session.commit()

        emit("downvote", {"downvote": msg.downvotes, "ulid": msg.id}, broadcast=True)


@socketio.on("disconnect")
def disconnected():
    """event listener when client disconnects to the server"""
    print("user disconnected")
    emit("disconnect", f"user {request.sid} disconnected", broadcast=True)


@app.route("/signup", methods=["POST"])
def signup():
    """API endpoint for user registration."""
    data = request.json
    name = data["name"]
    email = data["email"]
    password = data["password"]
    print(password)
    hash = hashlib.sha256(password.encode()).hexdigest()
    user = User.query.filter_by(email=email).first()
    if user:
        return jsonify({"message": "Email already registered!"}), 400

    ulid = ULID()
    new_user = User(id=str(ulid), name=name, email=email, password=hash)

    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User signed up!"})


@app.route("/login", methods=["POST"])
def login():
    """API endpoint for user authentication."""
    data = request.json
    email = data["email"]
    password = data["password"]
    print(password)

    user = User.query.filter_by(email=email).first()
    if not user or user.password != hashlib.sha256(password.encode()).hexdigest():
        return jsonify({"message": "Invalid email or password!"}), 401

    return jsonify({"message": "Success"})


@app.route("/get-username", methods=["POST"])
def get_username():
    """API endpoint to fetch a user's name based on their email."""
    data = request.json
    email = data.get("email")

    if not email:
        return jsonify({"error": "Email is required!"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User not found!"}), 404
    return jsonify({"name": user.name, "id": user.id})


if __name__ == "__main__":
    socketio.run(app, debug=True, port=5001, allow_unsafe_werkzeug=True)
