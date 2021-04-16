from flask import (
    Flask,
    jsonify,
    render_template,
    send_from_directory
)
from requests import get
import os
import json

app = Flask(__name__, template_folder="templates")

@app.route('/')
def home():
    return render_template('index.html',
        api_key=os.environ.get('GOOGLE_MAPS_API_KEY'),
        api_name=os.environ.get('LAMBDA_API'))

@app.route('/findISS')
def findIss():
    positionData = get("http://api.open-notify.org/iss-now.json")
    return jsonify(positionData.text)

@app.route('/astronauts')
def astronauts():
    astros = get("http://api.open-notify.org/astros.json")
    return jsonify(astros.text)

if __name__ == '__main__':
    app.run()