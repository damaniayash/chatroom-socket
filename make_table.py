import os

from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


app.config["SQLALCHEMY_DATABASE_URI"] = (
    os.getenv("DATABASE_URL") or "postgresql://yashdamania@localhost:5432/chat_db"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.String(150), primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(512), nullable=False)

    def __repr__(self):
        return f"<User {self.email}>"


class Message(db.Model):
    __tablename__ = "messages"

    id = db.Column(db.String(150), primary_key=True)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)
    sender_id = db.Column(db.String(150), db.ForeignKey("users.id"), nullable=False)
    sender_name = db.Column(db.String(150), nullable=False)
    upvotes = db.Column(db.Integer, default=0)
    downvotes = db.Column(db.Integer, default=0)


def create_mock_data():
    # Create two users
    yash = User(
        id="ABC1234",
        email="abc@example.com",
        name="Yash",
        password="hashed_password_yash",
    )
    janvi = User(
        id="XYZ1234",
        email="xyz@example.com",
        name="Janvi",
        password="hashed_password_janvi",
    )

    # Add users to the database
    db.session.add(yash)
    db.session.add(janvi)
    db.session.commit()

    # Create three messages between them
    message1 = Message(
        id="some_ulid",
        content="Hello from Yash!",
        timestamp=datetime.utcnow(),
        sender_id=yash.id,
        sender_name=yash.name
    )
    message2 = Message(
        id="ulid2",
        content="Hello back from Janvi!",
        timestamp=datetime.utcnow(),
        sender_id=janvi.id,
        sender_name=janvi.name
    )
    message3 = Message(
        id="ulid3",
        content="How are you, Yash?",
        timestamp=datetime.utcnow(),
        sender_id=janvi.id,
        sender_name=janvi.name
    )

    # Add messages to the database
    db.session.add(message1)
    db.session.add(message2)
    db.session.add(message3)
    db.session.commit()


# Run this once to create the tables:
with app.app_context():
    db.create_all()
    create_mock_data()
