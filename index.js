import axios from "axios";
import cheerio from "cheerio";
import cron from "node-cron";

// 👇 CHANGE THIS to the X account you want
const TWITTER_USERNAME = "PierrePoilievre";

// 👇 YOU WILL REPLACE THIS IN A LATER STEP
const LOVABLE_WEBHOOK = "PASTE_YOUR_LOVABLE_WEBHOOK_HERE";

let lastTweet = "";

async function checkTweets() {
  try {
    const response = await axios.get(
      `https://nitter.net/${TWITTER_USERNAME}`
    );

    const $ = cheerio.load(response.data);
    const tweet = $(".timeline-item").first();
    const text = tweet.find(".tweet-content").text().trim();
    const link =
      "https://x.com" + tweet.find("a.tweet-link").attr("href");

    if (!text || text === lastTweet) return;

    lastTweet = text;

    await axios.post(LOVABLE_WEBHOOK, {
      content: text,
      url: link,
      source: "X"
    });

    console.log("New tweet sent to Lovable");
  } catch (error) {
    console.log("Waiting for new tweets...");
  }
}

// Check every 3 minutes
cron.schedule("*/3 * * * *", checkTweets);

console.log("Tweet watcher running");
