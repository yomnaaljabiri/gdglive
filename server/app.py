from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import json
import random
import os

app = Flask(__name__)
CORS(app)

DB_PATH = 'agriroots.db'

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()
    # Users table
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            farm TEXT NOT NULL
        )
    ''')
    # Animals table
    c.execute('''
        CREATE TABLE IF NOT EXISTS animals (
            id TEXT PRIMARY KEY,
            name_ar TEXT,
            name_en TEXT,
            type TEXT,
            breed_ar TEXT,
            breed_en TEXT,
            age INTEGER,
            weight INTEGER,
            status TEXT,
            vaccines TEXT,
            meds TEXT,
            withdrawalEnd TEXT
        )
    ''')
    conn.commit()
    
    # No seeding logic - start from zero
    
    conn.close()



@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    try:
        conn = get_db()
        c = conn.cursor()
        c.execute('INSERT INTO users (email, password, name, farm) VALUES (?, ?, ?, ?)',
                  (data['email'], data['password'], data['name'], data['farm']))
        conn.commit()
        user_id = c.lastrowid
        conn.close()
        return jsonify({"success": True, "user": {"id": user_id, "name": data['name'], "email": data['email'], "farm": data['farm']}})
    except sqlite3.IntegrityError:
        return jsonify({"success": False, "message": "Email already exists"}), 400

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    conn = get_db()
    c = conn.cursor()
    c.execute('SELECT * FROM users WHERE (email = ? OR name = ?) AND password = ?', (data['email'], data['email'], data['password']))
    user = c.fetchone()
    conn.close()
    
    if user:
        return jsonify({"success": True, "user": {"id": user['id'], "name": user['name'], "email": user['email'], "farm": user['farm']}})
    return jsonify({"success": False, "message": "Invalid credentials"}), 401

@app.route('/api/animals', methods=['GET'])
def get_animals():
    conn = get_db()
    c = conn.cursor()
    c.execute('SELECT * FROM animals')
    rows = c.fetchall()
    conn.close()
    
    animals = []
    for row in rows:
        animals.append({
            "id": row['id'],
            "name": {"ar": row['name_ar'], "en": row['name_en']},
            "type": row['type'],
            "breed": {"ar": row['breed_ar'], "en": row['breed_en']},
            "age": row['age'],
            "weight": row['weight'],
            "status": row['status'],
            "vaccines": json.loads(row['vaccines']) if row['vaccines'] else [],
            "meds": json.loads(row['meds']) if row['meds'] else [],
            "withdrawalEnd": row['withdrawalEnd']
        })
    return jsonify(animals)

@app.route('/api/animals', methods=['POST'])
def add_animals():
    data = request.json
    if not isinstance(data, list):
        data = [data]
        
    conn = get_db()
    c = conn.cursor()
    
    for animal in data:
        c.execute('''
            INSERT INTO animals (id, name_ar, name_en, type, breed_ar, breed_en, age, weight, status, vaccines, meds, withdrawalEnd)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            animal['id'],
            animal['name']['ar'], animal['name']['en'],
            animal['type'],
            animal['breed']['ar'], animal['breed']['en'],
            animal['age'], animal['weight'],
            animal['status'],
            json.dumps(animal.get('vaccines', [])),
            json.dumps(animal.get('meds', [])),
            animal.get('withdrawalEnd')
        ))
    conn.commit()
    conn.close()
    
    return jsonify({"success": True, "message": f"{len(data)} animals added successfully."})

@app.route('/api/animals/<animal_id>', methods=['PUT'])
def update_animal(animal_id):
    data = request.json
    conn = get_db()
    c = conn.cursor()
    
    # First, fetch current vaccines
    c.execute('SELECT vaccines FROM animals WHERE id = ?', (animal_id,))
    row = c.fetchone()
    if not row:
        conn.close()
        return jsonify({"success": False, "message": "Animal not found"}), 404
        
    current_vaccines = json.loads(row['vaccines']) if row['vaccines'] else []
    
    # If a new vaccine is provided, append it
    if 'new_vaccine' in data and data['new_vaccine']:
        current_vaccines.append(data['new_vaccine'])
        
    c.execute('''
        UPDATE animals
        SET age = ?, weight = ?, status = ?, vaccines = ?
        WHERE id = ?
    ''', (data.get('age'), data.get('weight'), data.get('status'), json.dumps(current_vaccines), animal_id))
    
    conn.commit()
    conn.close()
    
    return jsonify({"success": True, "message": "Animal updated successfully."})

if __name__ == '__main__':
    init_db()
    print("Starting server on port 5000...")
    app.run(debug=True, port=5000)
