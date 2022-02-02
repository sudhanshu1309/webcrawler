const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const json2csv = require("json2csv").Parser;

const baseUrl = "https://stackoverflow.com/questions";

const newUrl = (page) => {
  return `https://stackoverflow.com/questions?tab=newest&page=${page}`;
};

const crawlPage = async () => {
  try {
    let records = [];
    let page = 1;

    let firstResponse = await axios.get(newUrl(page));

    let $ = cheerio.load(firstResponse.data);

    const lastPage = $(
      "#mainbar > div.s-pagination.site1.themed.pager.float-left > a:nth-child(7)"
    ).text();

    while (page <= lastPage) {
      let response = await axios.get(newUrl(page));
      let $ = cheerio.load(response.data);

      let a = $('div[id="questions"] > div ');

      for (var i = 0; i < a.length; i++) {
        let id = a[i].attribs.id;

        let views = $(`#${id} > div.statscontainer > div.views`)
          .text()
          .match(/\d/g)
          .join("");
        let votes = $(
          `#${id} > div.statscontainer > div.stats > div.vote > div > span > strong`
        ).text();
        let answers = $(
          `#${id} > div.statscontainer > div.stats > div.status.unanswered > strong`
        ).text();

        records.push({
          URL: newUrl(page),
          views,
          votes,
          answers,
        });
      }

      const j2c = new json2csv();
      const csv = j2c.parse(records);

      fs.writeFileSync("./Data/data.csv", csv, "utf-8");
      page = page + 1;
    }
  } catch (err) {
    console.log(err);
  }
};

crawlPage();
