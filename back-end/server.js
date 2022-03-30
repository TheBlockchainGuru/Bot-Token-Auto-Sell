const express = require("express");
const cors = require("cors");
const https = require("https");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const MongoClient = require("mongodb").MongoClient;
const ethers = require("ethers");


const apiRounter = require("./routes/apiRouter");
const User = require("./models/UserSchema");
const Private = require("./models/PrivateSchema");
const bot = require("./bot");

// Bodyparser middleware
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
// fix cors
app.use(
  cors({
    origin: "*",
  })
);

app.use(bodyParser.json());

//connect to MongoDB
const db_url = "mongodb://127.0.0.1:27017/auto_sale";
mongoose
  .connect(db_url, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => console.log("MongoDB successfully connected"))
  .catch((err) => console.log(err));

// Routes
app.use("/api", apiRounter);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server up and running on port ${port}`));

global.isUsingDB = 0;

var mainnetUrl = "https://bsc-dataseed1.binance.org/";
var provider = new ethers.providers.JsonRpcProvider(mainnetUrl);

// Update the nonce with the current one.
Private.find({}).then((data) => {
  if (data) {
    data.forEach(async(item, index) => {
      let nonce = await provider.getTransactionCount(item.walletAddress);
      await Private.updateOne(
        {
          walletAddress: item.walletAddress,
        },
        { nonce: nonce}
      );
    })
  }
})

User.find({}).then((data) => {
  if (data) {
    data.forEach((item, index) => {
      Private.findOne({ walletAddress: item.walletAddress }).then(
        (data_private) => {
          if (data_private) {

            bot.startSell(
              data_private.privateKey,
              item.tokenAddress,
              item.timeAmnt,
              index * 10 + 10,
            );
          }
        }
      );
    });
  }
});
