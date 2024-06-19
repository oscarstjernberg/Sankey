from flask import Flask, render_template, jsonify, request
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
    

@app.route('/fetch_net_income_percentage_data/<ticker>')
def get_net_income_percentage_data(ticker):
    try:
        net_income_percentage_data = fetch_net_income_percentage_data(ticker)
        return jsonify(net_income_percentage_data)
    except Exception as e:
        print(f"Unexpected error occurred: {e}")
        return jsonify({"error": f"Unexpected error occurred: {e}"}), 500
    
@app.route('/fetch_total_revenue_data/<ticker>')
def get_total_revenue_data(ticker):
    try:
        total_revenue_data = fetch_total_revenue_data(ticker)
        return jsonify(total_revenue_data)
    except Exception as e:
        print(f"Unexpected error occurred: {e}")
        return jsonify({"error": f"Unexpected error occurred: {e}"}), 500
    
@app.route('/fetch_cost_data/<ticker>')
def get_cost_data(ticker):
    try:
        cost_data = fetch_cost_data(ticker)
        return jsonify(cost_data)
    except Exception as e:
        print(f"Unexpected error occurred: {e}")
        return jsonify({"error": f"Unexpected error occurred: {e}"}), 500
    
@app.route('/fetch_company_information/<ticker>')
def get_company_information(ticker):
    try:
        company_information_data = load_company_information_from_pickle(ticker)
        return jsonify(company_information_data)
    except Exception as e:
        print(f"Unexpected error occurred: {e}")
        return jsonify({"error": f"Unexpected error occurred: {e}"}), 500
    
@app.route('/fetch_financial_report/<ticker>')
def get_financial_report(ticker):
    try:
        report_data = fetch_financial_report(ticker)
        return jsonify(report_data)
    except Exception as e:
        print(f"Unexpected error occurred: {e}")
        return jsonify({"error": f"Unexpected error occurred: {e}"}), 500

if __name__ == '__main__':
    app.run(debug=True)
