const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");

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

app.listen(3000, () => console.log("Server started at port 3000"));
