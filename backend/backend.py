from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3


app = FastAPI(title="Help Nearby API")


# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


DB_FILE = "help_nearby.db"


# Database connection
def get_connection():
    connection = sqlite3.connect(DB_FILE)
    connection.row_factory = sqlite3.Row
    return connection


# Create database table
def init_database():

    connection = get_connection()

    connection.execute("""
        CREATE TABLE IF NOT EXISTS help_requests (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            help_type TEXT NOT NULL,

            description TEXT NOT NULL,

            location TEXT NOT NULL,

            contact TEXT NOT NULL,

            urgency TEXT NOT NULL,

            status TEXT DEFAULT 'Open',

            created_at TEXT DEFAULT CURRENT_TIMESTAMP

        )
    """)

    connection.commit()
    connection.close()


init_database()


# Request model
class HelpRequest(BaseModel):

    help_type: str
    description: str
    location: str
    contact: str
    urgency: str


# Home endpoint
@app.get("/")
def home():

    return {
        "message": "Help Nearby API is running"
    }


# Get all requests
@app.get("/requests")
def get_requests():

    connection = get_connection()

    rows = connection.execute("""
        SELECT *
        FROM help_requests
        ORDER BY id DESC
    """).fetchall()

    connection.close()

    return [dict(row) for row in rows]


# Create help request
@app.post("/requests")
def create_request(request: HelpRequest):

    connection = get_connection()

    cursor = connection.execute("""
        INSERT INTO help_requests
        (
            help_type,
            description,
            location,
            contact,
            urgency,
            status
        )
        VALUES (?, ?, ?, ?, ?, 'Open')
    """, (
        request.help_type,
        request.description,
        request.location,
        request.contact,
        request.urgency
    ))

    connection.commit()

    request_id = cursor.lastrowid

    connection.close()

    return {
        "message": "Help request created successfully",
        "id": request_id
    }


# Accept help request
@app.put("/requests/{request_id}/accept")
def accept_request(request_id: int):

    connection = get_connection()

    cursor = connection.execute("""
        UPDATE help_requests
        SET status = 'Accepted'
        WHERE id = ?
        AND status = 'Open'
    """, (request_id,))

    connection.commit()

    if cursor.rowcount == 0:

        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Request not found or already accepted"
        )

    connection.close()

    return {
        "message": "Help request accepted"
    }


# Complete help request
@app.put("/requests/{request_id}/complete")
def complete_request(request_id: int):

    connection = get_connection()

    cursor = connection.execute("""
        UPDATE help_requests
        SET status = 'Completed'
        WHERE id = ?
        AND status = 'Accepted'
    """, (request_id,))

    connection.commit()

    if cursor.rowcount == 0:

        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Request not found or not accepted"
        )

    connection.close()

    return {
        "message": "Help request completed"
    }


# Delete request
@app.delete("/requests/{request_id}")
def delete_request(request_id: int):

    connection = get_connection()

    cursor = connection.execute("""
        DELETE FROM help_requests
        WHERE id = ?
    """, (request_id,))

    connection.commit()

    if cursor.rowcount == 0:

        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Request not found"
        )

    connection.close()

    return {
        "message": "Help request deleted"
    }
