require("dotenv").config();
const express = require("express");
const axios = require("axios");
const fs = require("fs");
const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// assik 1 - BMI calculator -----------------------------------
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

// assik 2 - information API -----------------------------

// Main API endpoint to fetch all data
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

async function fetchNews(countryName) {
  try {
    const apiKey = process.env.NEWS_API_KEY;
    
   
    const searchTerms = [
      countryName,
      countryName.split(' ')[0], 
      'world news' 
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
          timeout: 5000 
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
        continue; 
      }
    }
    
  
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

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`\nEnvironment check:`);
  console.log(`- NEWS_API_KEY: ${process.env.NEWS_API_KEY ? 'Set' : 'Not set (using default)'}`);
  console.log(`- EXCHANGE_API_KEY: ${process.env.EXCHANGE_API_KEY ? 'Set' : 'Not set (using default)'}`);
});