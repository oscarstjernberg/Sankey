import yfinance as yf
import json
import numpy as np
import pickle
import os
import pandas as pd

def handle_nan(value):
    return 0 if np.isnan(value) else value

def get_financial_data_to_pickle(ticker):
    print(f'Downloading data for {ticker}.')
    
    try:
        stock = yf.Ticker(ticker)
        financial_data = {
            'quarterly_financials': stock.quarterly_financials.to_dict()
            # Add other relevant data as needed
        }
        
        # Ensure the directory exists
        os.makedirs('static/data/pickles', exist_ok=True)

        # Save the financial data to a pickle file
        with open(f'static/data/pickles/{ticker}.pickle', 'wb') as f:
            pickle.dump(financial_data, f)
            print(f'Delicious {ticker} pickle saved...')
    except Exception as e:
        print(f"Data not available for {ticker}. Exception: {e}")

def load_financial_data_from_pickle(ticker):
    try:
        with open(f'static/data/pickles/{ticker}.pickle', 'rb') as f:
            financial_data = pickle.load(f)
        return pd.DataFrame(financial_data['quarterly_financials'])
    except Exception as e:
        print(f"Error loading data for {ticker}. Exception: {e}")
        return None

def fetch_financial_data(ticker):
    financial_data = {}

    try:
        print('Fetching data for: ' + ticker + ' from pickle.')
        stock = load_financial_data_from_pickle(ticker)
        
        
        try:
            gross_profit = handle_nan(stock.T['Gross Profit'].iloc[0])
        except:
            gross_profit = 0

        try:
            cost_of_revenue = handle_nan(stock.T['Cost Of Revenue'].iloc[0])
        except:
            cost_of_revenue = 0

        try:
            operating_expense = handle_nan(stock.T['Operating Expense'].iloc[0])
        except:
            operating_expense = 0

        try:
            net_income = handle_nan(stock.T['Net Income'].iloc[0])
        except:
            net_income = 0

        try:
            selling_general_and_administration = handle_nan(stock.T['Selling General And Administration'].iloc[0])
        except:
            selling_general_and_administration = 0

        try:
            research_and_development = handle_nan(stock.T['Research And Development'].iloc[0])
        except:
            research_and_development = 0

        try:    
            operating_income = handle_nan(stock.T['Operating Income'].iloc[0])
        except:
            operating_income = 0
        
        try:
            tax_provision = handle_nan(stock.T['Tax Provision'].iloc[0])
        except:
            tax_provision = 0

        processed_data = {
            'nodes': [
                {"name": "Total Revenue"},
                {"name": "Gross Profit"},
                {"name": "Cost Of Revenue"},
                {"name": "Operating Income"},
                {"name": "Net Income"},
                {"name": "Taxes"},
                {"name": "Operating Expenses"},
                {"name": "Research And Development"},
                {"name": "Selling General And Administration"}
            ],
            'links': [
                {"source": 0, "target": 1, "value": gross_profit},
                {"source": 0, "target": 2, "value": cost_of_revenue},
                {"source": 1, "target": 3, "value": operating_income},
                {"source": 3, "target": 4, "value": net_income},
                {"source": 3, "target": 5, "value": tax_provision},
                {"source": 1, "target": 6, "value": operating_expense},
                {"source": 6, "target": 7, "value": research_and_development},
                {"source": 6, "target": 8, "value": selling_general_and_administration},
            ]
        }

        financial_data[ticker] = processed_data
    
    except IndexError as e:
        print(f"IndexError for ticker {ticker}: {e}")
    
    except KeyError as e:
        print(f"KeyError for ticker {ticker}: {e} not found in financial data.")
    
    except Exception as e:
        print(f"Unexpected error for ticker {ticker}: {e}")

    return financial_data

def fetch_net_income_percentage_data(ticker):
    print('Fetching bar data for ' + ticker + ' from pickle.')
    stock = load_financial_data_from_pickle(ticker)
    quarters = stock.columns.tolist()
    net_income_percentage = np.nan_to_num((stock.loc['Net Income'] / stock.loc['Total Revenue'] * 100), nan=0.0).tolist()

    # Filter out 0 values and keep quarters aligned
    filtered_data = [
        (quarter, percentage)
        for quarter, percentage in zip(quarters, net_income_percentage)
        if percentage != 0.0
    ]

    filtered_quarters, filtered_percentages = zip(*filtered_data) if filtered_data else ([], [])

    bar_chart_percentage = {
        'quarters': filtered_quarters,
        'net_income_percentage': filtered_percentages,
    }

    return bar_chart_percentage

def fetch_total_revenue_data(ticker):
    print('Fetching revenue data from pickle.')
    stock = load_financial_data_from_pickle(ticker)
    
    quarters = stock.columns.tolist()
    total_revenue = np.nan_to_num(stock.loc['Total Revenue'], nan=0.0).tolist()
    net_income = np.nan_to_num(stock.loc['Net Income'], nan=0.0).tolist()

    # Filter out 0 values and keep quarters aligned
    filtered_data = [
        (quarter, revenue, income)
        for quarter, revenue, income in zip(quarters, total_revenue, net_income)
        if revenue != 0.0 and income != 0.0
    ]

    filtered_quarters, filtered_revenue, filtered_income = zip(*filtered_data) if filtered_data else ([], [], [])

    bar_chart_data = {
        'quarters': filtered_quarters,
        'total_revenue': filtered_revenue,
        'net_income': filtered_income,
    }

    return bar_chart_data

def fetch_cost_data(ticker):
    print('Fetching cost data from pickle.')
    stock = load_financial_data_from_pickle(ticker)
    
    quarters = stock.columns.tolist()
    total_revenue = np.nan_to_num(stock.loc['Total Revenue'], nan=0.0).tolist()
    cost_of_revenue = np.nan_to_num(stock.loc['Cost Of Revenue'], nan=0.0).tolist()

    # Filter out 0 values and keep quarters aligned
    filtered_data = [
        (quarter, revenue, cost)
        for quarter, revenue, cost in zip(quarters, total_revenue, cost_of_revenue)
        if revenue != 0.0 and cost != 0.0
    ]

    filtered_quarters, filtered_revenue, filtered_cost = zip(*filtered_data) if filtered_data else ([], [], [])

    bar_chart_data = {
        'quarters': filtered_quarters,
        'total_revenue': filtered_revenue,
        'cost_of_revenue': filtered_cost,
    }

    return bar_chart_data

def fetch_financial_report(ticker):
    print(f'Fetching financial report data for {ticker}')
    stock = load_financial_data_from_pickle(ticker)
    
    def handle_nan_to_missing(data):
        if isinstance(data, list):
            return ["Missing Data" if np.isnan(x) else f"{x:,.0f}" for x in data]
        elif np.isnan(data):
            return "Missing Data"
        else:
            return f"{data:,.0f}"
    
    try:
        total_revenue = handle_nan_to_missing(stock.loc['Total Revenue'].tolist())
    except:
        total_revenue = "Missing Data"
    try:   
        cost_of_revenue = handle_nan_to_missing(stock.loc['Cost Of Revenue'].tolist())
    except:
        cost_of_revenue = "Missing Data"
    try:
        gross_profit = handle_nan_to_missing(stock.loc['Gross Profit'].tolist())
    except:
        gross_profit = "Missing Data"
    try:
        operating_income = handle_nan_to_missing(stock.loc['Operating Income'].tolist())
    except:
        operating_income = "Missing Data"
    try:
        net_income = handle_nan_to_missing(stock.loc['Net Income'].tolist())
    except:
        net_income = "Missing Data"
    try:
        research_and_development = handle_nan_to_missing(stock.loc['Research And Development'].tolist())
    except:
        research_and_development = "Missing Data"
    try:   
        selling_general_and_administration = handle_nan_to_missing(stock.loc['Selling General And Administration'].tolist())
    except:
        selling_general_and_administration = "Missing Data"
    try:
        operating_expense = handle_nan_to_missing(stock.loc['Operating Expense'].tolist())
    except:
        operating_expense = "Missing Data"
    
    financial_report = {
        'Income Statement': {
            'Total Revenue': total_revenue,
            'Cost Of Revenue': cost_of_revenue,
            'Gross Profit': gross_profit,
            'Operating Income': operating_income,
            'Net Income': net_income,
            'Research And Development': research_and_development,
            'Selling General And Administration': selling_general_and_administration,
            'Operating Expense': operating_expense,
        }
    }
    
    return financial_report


if __name__ == "__main__":
    with open('static/data/sp500_tickers.json') as f:
        sp500_tickers = json.load(f)
    
    for ticker in sp500_tickers:
        financial_data = get_financial_data_to_pickle(ticker)

    with open('static/data/financial_data.json', 'w') as f:
        json.dump(financial_data, f)
