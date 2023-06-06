const scrollToBottom = require("../middlewares/auto-scroll");
const Users = require("../model/posts-model");
const mongoose = require("mongoose");
var Sentiment = require("sentiment");
const {
  userLinkSelector,
  userNameSelector,
  aboutUserSelector,
} = require("../config/html-selectors");

var sentiment = new Sentiment();
mongoose
  .connect("mongodb://localhost/facebook-data", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB ..."))
  .catch((err) => console.log(err.message));

module.exports = async function createGroups(ids, page) {
  var date = new Date().toLocaleString();
  const result = [];

  // NAVIGATION AND SCROLING TO THE DESIRED PAGE //
  try {
    await page.goto("https://facebook.com/search/people/?q=" + ids);
    console.log("search succesfull");
    await page.waitForTimeout(1000);
    //await scrollToBottom(page);
    console.log("scrolling success");
  } catch (error) {
    return console.log(error.message);
  }

  // Scraping for all post Links on a given page //
  try {
    let list_length = await page.evaluate((sel) => {
      let elements = Array.from(document.querySelectorAll(sel));
      return elements.length;
    }, userNameSelector);
    console.log(list_length);
    let count = 0;

    // Modify dom

    await page.evaluate(() => {
      const parentDiv = document.querySelectorAll(
        ".x9f619.x1n2onr6.x78zum5.xdt5ytf.x193iq5w.xeuugli.x2lah0s.x1t2pt76.x1xzczws.x1cvmir6.x1vjfegm"
      );
      if (parentDiv) {
        for (let i = 0; i < parentDiv.length; i++) {
          const allDivs = parentDiv[i].querySelectorAll("*");
          allDivs.forEach((div) => {
            div.setAttribute("class", "myClass");
          });
        }
      } else {
        return;
      }
    });

    for (let i = 0; i < list_length; i++) {
      /// post link scraper
      var userLink = await page.evaluate(
        (l, sel) => {
          const anchor = Array.from(document.querySelectorAll(sel));

          return anchor ? anchor[l].href : "";
        },
        i,
        userNameSelector
      );
      console.log(userLink);
      ////  posts scraper
      var aboutUser = await page.evaluate(
        (l, sel) => {
          let elements = Array.from(document.querySelectorAll(sel));
          let anchor = elements[l];
          if (anchor) {
            return anchor.innerText;
          } else {
            return "empty";
          }
        },
        i,
        aboutUserSelector
      );
      console.log(aboutUser);

      /// userScraper
      var userName = await page.evaluate(
        (l, sel) => {
          let elements = Array.from(document.querySelectorAll(sel));
          let anchor = elements[l];
          if (anchor) {
            return anchor.innerText;
          } else {
            return "empty";
          }
        },
        i,
        userNameSelector
      );
      console.log(userName);

      const singleUser = {
        userName: userName,
        userLink: userLink,
        aboutUser: aboutUser.split("\n")[1],
        date: date,
      };
      result.push(singleUser);
      const users = new Users(singleUser);
      await users.save();
      count = count + 2;
    }
  } catch (error) {
    console.log(error);
  }

  return result;
};
