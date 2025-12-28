const express = require("express");
const app = express();
const fs = require("fs");
const axios = require("axios");

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/send", (req, res) => {
  fs.writeFileSync("data.json", JSON.stringify(req.body));
  res.redirect("assik1/result.html");
});

app.get("/data", (req, res) => {
  const data = JSON.parse(fs.readFileSync("data.json"));
  res.json(data);
});

app.get("/get-user", async (req, res) => {
  try {
    const response = await axios.get("https://randomuser.me/api/");
    const user = response.data.results[0];

    const userData = {
      firstName: user.name.first,
      lastName: user.name.last,
      gender: user.gender,
      profilePicture: user.picture.large,
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

    const countryResponse = await axios.get(
      `https://restcountries.com/v3.1/name/${userData.country}`
    );
    const country = countryResponse.data[0];

    const countryData = {
      name: country.name.common,
      capital: country.capital ? country.capital[0] : "N/A",
      languages: country.languages ? Object.values(country.languages) : [],
      currencyCode: country.currencies
        ? Object.keys(country.currencies)[0]
        : null,
      flag: country.flags.png,
    };

    const exchangeResponse = await axios.get(
      `https://v6.exchangerate-api.com/v6/7ecd58a887936857f9806f83/latest/${countryData.currencyCode}`
    );
    const rates = exchangeResponse.data.conversion_rates;

    const exchangeData = {
      USD: rates.USD,
      KZT: rates.KZT,
    };

    const newsResponse = await axios.get("https://newsapi.org/v2/everything", {
      params: {
        q: countryData.name,
        language: "en",
        pageSize: 5,
        apiKey: "950e2028b7984458a01d77576be0d939",
      },
    });
    const newsData = newsResponse.data.articles.map((article) => ({
      title: article.title,
      description: article.description,
      image: article.urlToImage,
      url: article.url,
    }));

    res.json({
      user: userData,
      country: countryData,
      exchange: exchangeData,
      news: newsData,
    });
  } catch (error) {
    res.status(500).json({ error: "Ошибка при получении данных" });
  }
});

app.listen(3000, () => console.log("Server started at port 3000"));
