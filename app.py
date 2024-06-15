from flask import Flask, render_template, jsonify
from fetch_financial_data import *
import json

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/data/<ticker>')
def get_data(ticker):
    try:
        financial_data = fetch_financial_data(ticker)
        return jsonify(financial_data[ticker])
    
    except Exception as e:
        print(f"Unexpected error occurred: {e}")
        return jsonify({"error": f"Unexpected error occurred: {e}"}), 500

if __name__ == '__main__':
    app.run(debug=True)
