from flask import Flask, render_template, request, jsonify
import yfinance as yf
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from statsmodels.tsa.arima.model import ARIMA
import base64
from io import BytesIO

app = Flask(__name__)

# Fetch historical stock data from Yahoo Finance
def fetch_data_yahoo(ticker, start_date, end_date):
    try:
        print(f"Fetching data for {ticker} from {start_date} to {end_date}")  # Debugging
        data = yf.download(ticker, start=start_date, end=end_date)
        if data.empty:
            raise ValueError(f"No data fetched for {ticker}. Please check the ticker symbol or date range.")
        
        # Check if data contains missing values and fill them
        if data.isnull().any().any():
            print("Warning: Missing values in the stock data, filling with forward fill.")
            data = data.fillna(method='ffill')  # Forward fill missing values
            print("Missing values filled.")
        
        return data['Close']
    except Exception as e:
        raise ValueError(f"Error fetching data from Yahoo Finance: {str(e)}")

# Prepare and train ARIMA model
def train_arima_model(data, order=(5, 1, 0)):
    try:
        model = ARIMA(data, order=order)  # ARIMA(p,d,q)
        model_fit = model.fit()
        return model_fit
    except Exception as e:
        print(f"Error during ARIMA model training: {str(e)}")
        return None

# Forecast future stock prices using the ARIMA model
def forecast_arima(model_fit, steps=30):
    try:
        forecast = model_fit.forecast(steps=steps)
        return forecast
    except Exception as e:
        print(f"Error during forecasting: {str(e)}")
        return []

# Visualize the forecast and convert it to a PNG image
def plot_forecast(actual, forecast, ticker, forecast_dates):
    plt.figure(figsize=(12, 6))
    plt.plot(actual.index, actual, label="Actual Price")
    plt.plot(forecast_dates, forecast, label="Predicted Price", color='red')
    plt.title(f"Stock Price Prediction for {ticker}")
    plt.xlabel("Date")
    plt.ylabel("Price (USD)")
    plt.legend()
    plt.xticks(rotation=45)
    plt.tight_layout()

    # Save the plot to a BytesIO object and convert to base64 for embedding in HTML
    img = BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    plot_url = base64.b64encode(img.getvalue()).decode('utf-8')
    plt.close()
    return plot_url

# Main function to fetch data, train the model, and forecast
@app.route('/predict', methods=['POST'])
def predict():
    ticker = request.form['ticker']
    start_date = request.form['start_date']
    end_date = request.form['end_date']
    forecast_days = int(request.form['prediction_days'])

    try:
        # Fetch historical data from Yahoo Finance
        stock_data = fetch_data_yahoo(ticker, start_date, end_date)

        # Check if the data has enough points to train ARIMA
        if len(stock_data) < 10:
            raise ValueError(f"Not enough data points to train the ARIMA model. Found {len(stock_data)} points.")
        
        # Train the ARIMA model
        model_fit = train_arima_model(stock_data)

        if model_fit is None:
            raise ValueError("Error during ARIMA model fitting. Please check the data or try different parameters.")
        
        # Forecast future stock prices
        forecast = forecast_arima(model_fit, steps=forecast_days)

        if not forecast:
            raise ValueError("Forecasting failed. No valid predictions available.")

        # Generate future dates for plotting
        forecast_dates = pd.date_range(start=stock_data.index[-1] + pd.Timedelta(days=1), periods=forecast_days, freq='B')

        # Plot the forecast
        plot_url = plot_forecast(stock_data, forecast, ticker, forecast_dates)

        # Prepare forecasted data for display
        forecast_df = pd.DataFrame(forecast, index=forecast_dates, columns=["Predicted Price"])

        # Prepare context for rendering HTML template
        predictions = forecast_df["Predicted Price"].tolist()
        first_date = stock_data.index[0].strftime('%Y-%m-%d')
        last_date = stock_data.index[-1].strftime('%Y-%m-%d')
        num_dates = len(stock_data)

        return render_template('combine.html', predictions=predictions, plot_url=plot_url,
                               first_date=first_date, last_date=last_date, num_dates=num_dates)

    except Exception as e:
        return str(e)

@app.route('/')
def home():
    return render_template('combine.html')

if __name__ == "__main__":
    app.run(debug=True)
