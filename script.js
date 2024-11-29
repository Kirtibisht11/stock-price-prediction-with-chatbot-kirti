const chatBody = document.getElementById("chat-body");
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
};

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

// Function to extract city from the user's input
const extractCity = (input) => {
    // Remove common keywords like 'time', 'in', 'the', etc., to extract the city
    const cityKeywords = ["time", "in", "the", "what's", "what", "is", "of"];
    let words = input.split(" ").filter(word => !cityKeywords.includes(word.toLowerCase()));
    
    // Return the city as a single string
    return words.join(" ");
};

// Function to fetch time for the extracted city using TimeZoneDB API
const fetchTime = async (input) => {
    const city = extractCity(input);
    
    if (!city) {
        appendMessage("Please provide a valid city name.", "bot");
        return;
    }

    const apiKeys = ["MB7FYAXJUMEG", "UKGBZ41USJT7"];
    let cityFound = false;

    // Get the current system time in UTC
    const systemTime = new Date();
    const systemTimeUTC = systemTime.getTime() + systemTime.getTimezoneOffset() * 60000; // Convert system time to UTC

    for (const apiKey of apiKeys) {
        const url = `https://api.timezonedb.com/v2.1/get-time-zone?key=${apiKey}&by=zone&zone=${encodeURIComponent(city)}&format=json`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.status === "OK" && data.formatted) {
                cityFound = true;

                // Extract date and time
                const [datePart, timePart] = data.formatted.split(" ");
                const [cityHour, cityMinute, citySecond] = timePart.split(":").map(Number);

                // Get the timezone offset in seconds (GMT Offset)
                const offsetInSeconds = data.gmtOffset;
                const offsetInHours = Math.floor(offsetInSeconds / 3600);
                const offsetInMinutes = Math.floor((offsetInSeconds % 3600) / 60);

                // Convert system time (UTC) to the city's local time
                let cityTimeInMS = systemTimeUTC + (offsetInSeconds * 1000); // System time in UTC + offset in milliseconds
                const cityDate = new Date(cityTimeInMS);

                // Get the adjusted time from the city
                const adjustedHour = cityDate.getUTCHours();
                const adjustedMinute = cityDate.getUTCMinutes();
                const adjustedSecond = cityDate.getUTCSeconds();

                // Convert adjusted time to GMT (this should already be GMT)
                const gmtTime = new Date(cityDate.toUTCString());

                const amPm = adjustedHour >= 12 ? "PM" : "AM";
                const hour12 = adjustedHour % 12 || 12;
                const formattedTime = `${hour12}:${adjustedMinute.toString().padStart(2, "0")} ${amPm}`;

                appendMessage(`The current GMT time in ${city} is ${formattedTime} on ${datePart}.`, "bot");
                return;
            }
        } catch (error) {
            console.error("Error fetching time:", error);
        }
    }

    if (!cityFound) {
        appendMessage(`Sorry, I couldn't find the time for ${city}. Please check the city name and try again.`, "bot");
    }
};

// Handle user messages and provide appropriate responses
const processMessage = async (message) => {
    appendMessage(message, "user");
    const lowerMessage = message.toLowerCase();

    if (["hi", "hello", "hey"].some((greet) => lowerMessage.includes(greet))) {
        appendMessage("Hello! How can I assist you today?", "bot");
    } else if (lowerMessage.includes("thank") || lowerMessage.includes("okay")) {
        appendMessage("You're welcome! Let me know if you need anything else.", "bot");
    } else if (lowerMessage.includes("weather")) {
        const location = lowerMessage.split("weather in")[1]?.trim() || "Dehradun";
        await fetchWeather(location);
    } else if (lowerMessage.includes("time")) {
        const city = lowerMessage.split("time in")[1]?.trim() || "Dehradun";
        await fetchTime(city);
    } else if (Object.keys(stockDefinitions).some((term) => lowerMessage.includes(term))) {
        const term = Object.keys(stockDefinitions).find((key) => lowerMessage.includes(key));
        appendMessage(stockDefinitions[term], "bot");
    } else if (
        ["explain", "tell me about", "define"].some((trigger) => lowerMessage.includes(trigger))
    ) {
        const term = lowerMessage
            .replace("explain", "")
            .replace("tell me about", "")
            .replace("define", "")
            .trim();
        if (term) {
            await fetchDefinition(term);
        } else {
            appendMessage("Please specify what you'd like me to explain in detail.", "bot");
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
