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
  fs.writeFileSync("data.json", JSON.stringify(req.body));
  res.redirect("assik1/result.html");
});

app.get("/data", (req, res) => {
  const data = JSON.parse(fs.readFileSync("data.json"));
  res.json(data);
});

// assik 2 - information API -----------------------------[-]

// Main API endpoint to fetch all data
app.get("/api/random-profile", async (req, res) => {
  try {
    const userData = await fetchRandomUser();
    const countryData = await fetchCountryInfo(userData.country);
    const exchangeData = await fetchExchangeRates(countryData.currencyCode);
    const newsData = await fetchNews(userData.country);

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
    const apiKey = process.env.EXCHANGE_API_KEY || "7ecd58a887936857f9806f83";
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
    const apiKey =
      process.env.NEWS_API_KEY || "950e2028b7984458a01d77576be0d939";
    const response = await axios.get("https://newsapi.org/v2/everything", {
      params: {
        q: countryName,
        language: "en",
        pageSize: 5,
        sortBy: "publishedAt",
        apiKey: apiKey,
      },
    });

    return response.data.articles.map((article) => ({
      title: article.title || "No title available",
      description: article.description || "No description available",
      image: article.urlToImage || "",
      url: article.url || "#",
    }));
  } catch (error) {
    console.error("News API error:", error.message);
    return [];
  }
}

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
