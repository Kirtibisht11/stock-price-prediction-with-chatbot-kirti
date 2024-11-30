const chatBody = document.getElementById("chat-body");
const navbarLinks = document.querySelectorAll('.navbar a');
    navbarLinks.forEach(link => {
        link.addEventListener('click', () => {
            navbarLinks.forEach(l => l.classList.remove('active')); // Remove active from all
            link.classList.add('active'); // Add active to clicked link
        });
    });
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// Predefined financial definitions
const stockDefinitions = {
    "stock split": "A stock split divides a company's existing shares into multiple shares to boost liquidity.",
    "bear market": "A bear market is a prolonged decline in stock prices, usually 20% or more from recent highs.",
    "dividend": "A dividend is a portion of a company's earnings distributed to shareholders.",
    "bull market": "A bull market is a period of rising stock prices, typically 20% or more from recent lows.",
    "market capitalization": "Market capitalization is the total value of a company's outstanding shares, calculated by multiplying the stock price by the total number of shares.",
    "price-to-earnings ratio": "The price-to-earnings ratio (P/E ratio) measures a company's current share price relative to its per-share earnings.",
    "ipo": "IPO stands for Initial Public Offering, where a private company offers its shares to the public for the first time.",
    "sip": "A Systematic Investment Plan (SIP) is an investment strategy that allows investors to invest small amounts periodically in mutual funds.",
    "stocks": "Stocks represent a share in the ownership of a company, granting rights to its earnings and assets.",
    "blue chip stocks": "Blue chip stocks are shares in well-established companies with a history of stable earnings and reliable performance.",
    "types of stocks": "There are several types of stocks, including common stocks, preferred stocks, growth stocks, and dividend stocks.",
    "finance market": "The finance market encompasses various sectors such as stocks, bonds, commodities, and currencies where financial instruments are traded.",
    "financial news": "Financial news includes reports and updates on market conditions, stock prices, mergers, acquisitions, and economic events affecting financial markets.",
    "Share": "A single unit of ownership in a company.",
    "Common Stock": "Shares that give shareholders voting rights and potential dividends.",
    "Preferred Stock": "Shares that generally do not have voting rights but offer fixed dividends.",
    "Blue Chip Stocks": "Shares of large, reputable companies with a history of stable performance.",
    "Growth Stocks": "Stocks of companies expected to grow at an above-average rate compared to their industry.",
    "Value Stocks": "Stocks trading at a lower price relative to their fundamentals, considered undervalued.",
    "Bid Price": "The highest price a buyer is willing to pay for a stock.",
    "Ask Price": "The lowest price a seller is willing to accept for a stock.",
    "Spread": "The difference between the bid and ask price.",
    "Volume": "The number of shares traded during a given time period.",
    "Market Order": "An order to buy or sell a stock immediately at the best available price.",
    "Limit Order": "An order to buy or sell a stock at a specific price or better.",
    "Stop-Loss Order": "An order to sell a stock when it reaches a certain price to limit an investor's loss.",
    "Day Trading": "The practice of buying and selling stocks within the same trading day.",
    "Earnings Per Share/EPS": "A company's profit divided by the number of outstanding shares.",
    "Price-to-Earnings Ratio (P/E)": "A valuation ratio of a company's current share price relative to its EPS.",
    "Dividend": "A portion of a company's earnings distributed to shareholders.",
    "Yield": "The dividend expressed as a percentage of the stock price.",
    "Book Value": "The net value of a company's assets minus its liabilities.",
    "Index": "A benchmark that tracks the performance of a group of stocks, e.g., S&P 500.",
    "Volatility": "A measure of price fluctuations in the market.",
    "Resistance Level": "A price level where a stock tends to face selling pressure.",
    "Support Level": "A price level where a stock tends to find buying interest.",
    "Diversification": "Spreading investments across various financial instruments to reduce risk.",
    "Portfolio": "A collection of investments owned by an individual or institution.",
    "Hedging": "Using financial instruments to offset potential losses in investments.",
    "Leverage": "Borrowing money to increase the potential return on an investment.",
    "Short Selling": "Selling borrowed shares with the aim of buying them back later at a lower price.",
    "Candlestick Chart": "A type of chart used to analyze price movements of securities.",
    "Moving Average": "An indicator showing the average price of a stock over a specific time period.",
    "RSI (Relative Strength Index)": "A momentum oscillator measuring the speed and change of price movements.",
    "MACD (Moving Average Convergence Divergence)": "A trend-following momentum indicator.",
    "Fibonacci Retracement": "A tool to identify potential support and resistance levels.",
    "Liquidity": "The ease with which an asset can be converted into cash.",
    "Penny Stocks": "Stocks of small companies that trade at low prices.",
    "ETF (Exchange-Traded Fund)": "A basket of securities traded on an exchange like a stock.",
    "Mutual Fund": "An investment vehicle pooling money from many investors to purchase securities.",
    "Options": "Contracts granting the right, but not the obligation, to buy or sell an asset at a set price before expiration.",
    "Futures": "Contracts to buy or sell an asset at a predetermined price on a specific future date.",
    "Margin": "Borrowed money used to purchase investments."  
};
// Normalize stockDefinitions keys to lowercase for consistent case-insensitive matching
const normalizedStockDefinitions = {};
for (const key in stockDefinitions) {
    normalizedStockDefinitions[key.toLowerCase()] = stockDefinitions[key];
}

// Weather API keys (replace with valid keys)
const weatherApis = ["4ce6870a6c2dc05d9d1151912dd0db09", "38fe0b478a78dcb97f4a4e7839b663be", "7e191d9315101c3f4b3ee0f6835639d5", "cb92c5e8c223bfe4fe9241b8449b1cb7"];

// Helper function to append messages to the chat
const appendMessage = (message, type) => {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("chat-message", type === "user" ? "user-message" : "bot-message");
    const messageText = document.createElement("p");
    messageText.textContent = message;
    messageDiv.appendChild(messageText);
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
};

// Fetch weather information
const fetchWeather = async (location) => {
    appendMessage("Fetching weather information...", "bot");
    for (const apiKey of weatherApis) {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=metric&appid=${apiKey}`;
        try {
            const response = await fetch(url);
            if (!response.ok) continue;
            const data = await response.json();
            if (data.cod === 200) {
                const weatherDescription = data.weather[0].description;
                const temp = data.main.temp;
                const country = data.sys.country;
                appendMessage(`The current weather in ${location}, ${country} is ${weatherDescription} with a temperature of ${temp}°C.`, "bot");
                return;
            }
        } catch (error) {
            console.error("Error fetching weather:", error);
        }
    }
    appendMessage("Sorry, I couldn't fetch the weather information at the moment. Please try again later.", "bot");
};


// Extract city name from user input
const extractCity = (input) => {
    const match = input.match(/in\s+(.*)/i);
    return match ? match[1].trim() : null;
};

// Handle user messages and provide appropriate responses
const processMessage = async (message) => {
    appendMessage(message, "user");
    const lowerMessage = message.toLowerCase();

    if (["hi", "hello", "hey"].some((greet) => lowerMessage.includes(greet))) {
        appendMessage("Hello! How can I assist you today?", "bot");
    } else if (lowerMessage.includes("thank") || lowerMessage.includes("okay")) {
        appendMessage("You're welcome! Let me know if you need anything else.", "bot");
    } else if (lowerMessage.includes("bye") || lowerMessage.includes("bye")) {
        appendMessage("Goodbye! It was nice talking to you!", "bot");
    }else if (lowerMessage.includes("weather")) {
        const location = extractCity(lowerMessage) || "Dehradun";
        await fetchWeather(location);
    } else if (lowerMessage.includes("time")) {
        appendMessage("Time-related functionality is not implemented yet.", "bot");
    } else if (Object.keys(stockDefinitions).some((term) => lowerMessage.includes(term.toLowerCase()))) {
        const term = Object.keys(stockDefinitions).find((key) => lowerMessage.includes(key.toLowerCase()));
        appendMessage(stockDefinitions[term], "bot");
    } else if (["explain", "tell me about", "define"].some((trigger) => lowerMessage.includes(trigger))) {
        const term = lowerMessage
            .replace(/explain|tell me about|define/gi, "")
            .trim();
        if (term) {
            const definition = stockDefinitions[term.toLowerCase()];
            appendMessage(definition || `I'm sorry, I don't have a definition for "${term}".`, "bot");
        } else {
            appendMessage("Please specify what you'd like me to define or explain.", "bot");
        }
    } else {
        appendMessage("I didn't understand that. Can you rephrase?", "bot");
    }
};

// Event listeners for message input
sendBtn.addEventListener("click", () => {
    const message = userInput.value.trim();
    if (message) {
        processMessage(message);
        userInput.value = "";
    }
});

userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const message = userInput.value.trim();
        if (message) {
            processMessage(message);
            userInput.value = "";
        }
    }
});
