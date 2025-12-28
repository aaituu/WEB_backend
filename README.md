# WEB Technologies 2 (Back End) - Assignment 2: API Integration

**Student:** Saqyp Dias  
**Group:** SE-2436  
**Course:** WEB Technologies 2 (Back End)  
**Assignment:** API Integration Project

---

## Introduction

In this assignment, I worked with multiple external APIs to create a comprehensive web application that fetches, processes, and displays data from various sources. The main objective was to learn how to integrate different APIs on the server side using Node.js and Express, handle asynchronous operations, manage environment variables securely, and present the retrieved information effectively on the frontend.

This project demonstrates practical implementation of RESTful API integration, error handling, data transformation, and server-side logic that powers modern web applications.

---


## Task 1: Random User Generator API

### Objective
Fetch random user data from the Random User API and extract specific personal and location details.

### Implementation

```javascript
async function fetchRandomUser() {
  try {
    const response = await axios.get("https://randomuser.me/api/");
    const user = response.data.results[0];

    return {
      firstName: user.name.first,
      lastName: user.name.last,
      gender: user.gender,
      profileImage: user.picture.large,
      age: user.dob.age,
      dateOfBirth: new Date(user.dob.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      city: user.location.city,
      country: user.location.country,
      fullAddress: `${user.location.street.number} ${user.location.street.name}`,
    };
  } catch (error) {
    console.error("Random user API error:", error.message);
    throw error;
  }
}
```

### Key Features
- Fetches a random user from the Random User API
- Extracts first name, last name, gender, profile picture, age, date of birth, city, country, and full address
- Formats the date of birth into a readable format using JavaScript's `toLocaleDateString()`
- Implements error handling with try-catch blocks
- Returns a clean, structured object with all required user information

---

## Task 2: REST Countries API Integration

### Objective
Based on the user's country from Task 1, fetch detailed country information including capital, languages, currency, and flag.

### Implementation

```javascript
async function fetchCountryInfo(countryName) {
  try {
    const response = await axios.get(
      `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}`
    );
    const country = response.data[0];

    const languages = country.languages
      ? Object.values(country.languages).join(", ")
      : "N/A";

    const currencyCode = country.currencies
      ? Object.keys(country.currencies)[0]
      : "USD";

    const currencyName = country.currencies
      ? country.currencies[currencyCode].name
      : "N/A";

    return {
      name: country.name.common,
      capital: country.capital ? country.capital[0] : "N/A",
      languages: languages,
      currencyCode: currencyCode,
      currencyName: currencyName,
      flag: country.flags.png,
    };
  } catch (error) {
    console.error("Country API error:", error.message);
    return {
      name: countryName,
      capital: "N/A",
      languages: "N/A",
      currencyCode: "USD",
      currencyName: "N/A",
      flag: "",
    };
  }
}
```

### Key Features
- Accepts country name from the Random User API
- Uses `encodeURIComponent()` to properly format the country name for the URL
- Extracts country details: name, capital city, official languages, currency code and name, and flag image
- Handles multiple languages by joining them with commas
- Implements graceful error handling - returns default values if API fails
- Provides fallback currency (USD) if country currency is unavailable

---

## Task 3: Exchange Rate API Integration

### Objective
Using the currency obtained from the REST Countries API, show exchange rates compared to USD and KZT.

### Implementation

```javascript
async function fetchExchangeRates(currencyCode) {
  try {
    const apiKey = process.env.EXCHANGE_API_KEY;
    const response = await axios.get(
      `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${currencyCode}`
    );
    const rates = response.data.conversion_rates;

    return {
      base: currencyCode,
      USD: rates.USD ? rates.USD.toFixed(2) : "N/A",
      KZT: rates.KZT ? rates.KZT.toFixed(2) : "N/A",
    };
  } catch (error) {
    console.error("Exchange rate API error:", error.message);
    return {
      base: currencyCode,
      USD: "N/A",
      KZT: "N/A",
    };
  }
}
```

### Key Features
- Retrieves the API key securely from environment variables using `process.env.EXCHANGE_API_KEY`
- Fetches real-time exchange rates based on the user's country currency
- Calculates conversion rates to USD (United States Dollar) and KZT (Kazakhstani Tenge)
- Formats numbers to 2 decimal places using `toFixed(2)` for better readability
- Implements error handling with fallback values
- Returns structured data showing base currency and conversion rates

---

## Task 4: News API Integration

### Objective
Fetch five recent news headlines related to the random user's country in English language.

### Implementation

```javascript
async function fetchNews(countryName) {
  try {
    const apiKey = process.env.NEWS_API_KEY;
    
    // Multiple search strategies for better results
    const searchTerms = [
      countryName,
      countryName.split(' ')[0], // First word only
      'world news' // Fallback to general news
    ];
    
    for (const term of searchTerms) {
      try {
        console.log(`Trying to fetch news for: ${term}`);
        const response = await axios.get("https://newsapi.org/v2/everything", {
          params: {
            q: term,
            language: "en",
            pageSize: 5,
            sortBy: "publishedAt",
            apiKey: apiKey,
          },
          timeout: 5000 // 5 second timeout
        });

        if (response.data.articles && response.data.articles.length > 0) {
          console.log(`Successfully fetched ${response.data.articles.length} articles for ${term}`);
          return response.data.articles.map((article) => ({
            title: article.title || "No title available",
            description: article.description || "No description available",
            image: article.urlToImage || "",
            url: article.url || "#",
          }));
        }
      } catch (innerError) {
        console.log(`Failed to fetch news for ${term}:`, innerError.message);
        continue; // Try next search term
      }
    }
    
    // If all attempts fail, return empty array
    console.log("All news fetch attempts failed, returning empty array");
    return [];
    
  } catch (error) {
    console.error("News API error:", error.message);
    if (error.response) {
      console.error("News API response error:", error.response.status, error.response.data);
    }
    return [];
  }
}
```

### Key Features
- Uses News API with secure API key from environment variables
- Implements multiple search strategies with fallback options:
  1. Full country name
  2. First word of country name (for multi-word countries)
  3. General "world news" as final fallback
- Filters for English language articles only
- Retrieves 5 most recent articles sorted by publication date
- Extracts title, description, image URL, and source URL for each article
- Implements 5-second timeout to prevent hanging requests
- Comprehensive error handling at multiple levels
- Returns empty array if all fetch attempts fail (graceful degradation)
- Provides detailed console logging for debugging

---

## Main API Endpoint

### Implementation

```javascript
app.get("/api/random-profile", async (req, res) => {
  try {
    console.log("Fetching random profile...");
    const userData = await fetchRandomUser();
    console.log("User data fetched:", userData.firstName, userData.lastName);
    
    const countryData = await fetchCountryInfo(userData.country);
    console.log("Country data fetched:", countryData.name);
    
    const exchangeData = await fetchExchangeRates(countryData.currencyCode);
    console.log("Exchange data fetched for:", countryData.currencyCode);
    
    const newsData = await fetchNews(userData.country);
    console.log("News data fetched:", newsData.length, "articles");

    res.json({
      user: userData,
      country: countryData,
      exchange: exchangeData,
      news: newsData,
    });
  } catch (error) {
    console.error("Error fetching profile data:", error.message);
    res.status(500).json({ error: "Failed to fetch profile data" });
  }
});
```

### Key Features
- Single endpoint that orchestrates all four API calls
- Uses async/await for clean, sequential API calls
- Each API call depends on data from the previous one (cascading data flow)
- Comprehensive logging at each step for debugging
- Returns a single JSON response containing all fetched data
- Implements error handling with appropriate HTTP status code (500)
- Organized response structure with separate sections for user, country, exchange, and news data

---

## Additional Features

### BMI Calculator (Task 1 - Assignment 1)

```javascript
app.post("/send", (req, res) => {
  try {
    fs.writeFileSync("data.json", JSON.stringify(req.body));
    res.redirect("/assik1/result.html");
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).send("Error saving data");
  }
});

app.get("/data", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync("data.json"));
    res.json(data);
  } catch (error) {
    console.error("Error reading data:", error);
    res.status(500).json({ error: "Failed to read data" });
  }
});
```

- Handles BMI calculator data submission
- Stores user input (name, weight, height) in `data.json` file
- Reads and serves stored data to the results page
- Implements file system operations with error handling

---

## Server Configuration

```javascript
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`\nEnvironment check:`);
  console.log(`- NEWS_API_KEY: ${process.env.NEWS_API_KEY ? 'Set' : 'Not set'}`);
  console.log(`- EXCHANGE_API_KEY: ${process.env.EXCHANGE_API_KEY ? 'Set' : 'Not set'}`);
});
```

### Features
- Server runs on port 3000 as required
- Displays server status and URL on startup
- Checks and displays environment variable configuration
- Helps with debugging by showing which API keys are configured

---

## API Documentation

### GET `/api/random-profile`

**Description**: Fetches a random user profile with complete information including country details, exchange rates, and news.

**Response Format**:
```json
{
  "user": {
    "firstName": "John",
    "lastName": "Doe",
    "gender": "male",
    "profileImage": "https://...",
    "age": 30,
    "dateOfBirth": "January 15, 1994",
    "city": "London",
    "country": "United Kingdom",
    "fullAddress": "123 Main Street"
  },
  "country": {
    "name": "United Kingdom",
    "capital": "London",
    "languages": "English",
    "currencyCode": "GBP",
    "currencyName": "British Pound",
    "flag": "https://..."
  },
  "exchange": {
    "base": "GBP",
    "USD": "1.27",
    "KZT": "574.23"
  },
  "news": [
    {
      "title": "Article Title",
      "description": "Article description",
      "image": "https://...",
      "url": "https://..."
    }
  ]
}
```

---

## Conclusion

This assignment provided hands-on experience with real-world API integration scenarios. I successfully implemented a complete backend system that fetches data from multiple external sources, processes it server-side, and serves it to the frontend in a structured format.

The project taught me the importance of proper error handling, security practices, and how to design APIs that are both functional and maintainable. I learned how to handle asynchronous operations effectively, manage API dependencies, and provide fallback mechanisms when external services fail.

Working with different APIs helped me understand that each service has its own quirks and requirements, and adapting to these differences is a crucial skill for backend development. The experience of debugging API integration issues and implementing retry logic has prepared me for real-world scenarios where external services may be unreliable or have rate limits.

Overall, this assignment significantly improved my backend development skills and gave me confidence in working with external APIs, which is an essential skill for modern web development.


**End of Report**
