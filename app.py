from flask import (
    Flask,
    jsonify,
    render_template,
    send_from_directory
)
from requests import get
import json

app = Flask(__name__, template_folder="templates")

@app.route('/')
def home():
    return render_template('index.html')

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