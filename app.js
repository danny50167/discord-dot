//jshint esversion:6
// 회사 탄생 - 022 / 3 / 11
// DOT (project D) - 2022 / 3 / 21 봇 임신일
// 제작자: dark0316, 이상원, 최이안

//discord.js 12버전으로 제작됬습니다.

// 가위바위보 제비뽑기 운세 저뭐먹 주사위 캐쉬
// import DiscordJS, {Intents} from "discord.js"// ㅎㅇㅎㅇ

const Discord = require("discord.js");

const client = new Discord.Client();

// const { CanvasRenderService } = require("chartjs-node-canvas")
// const { MessageAttachment } = require("discord.js")

const request = require("request");
const fs = require("fs");

const getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
};
const calculateDegree = (num) => {
  return Math.floor(num - 273.15);
};
const getKeys = (jsonObj) => {
  return Object.keys(jsonObj);
};
const drawGraph = (stockName, db) => {
  const JSDOM = require("jsdom").JSDOM;
  const jsdom = new JSDOM("<body><div id='container'></div></body>", {
    runScripts: "dangerously",
  });
  const window = jsdom.window;

  const anychart = require("anychart")(window);
  const anychartExport = require("anychart-nodejs")(anychart);

  const data = db;
  const chart = anychart.line();
  const series = chart.line(data);
  chart.container("container");
  chart.draw();

  const fileName = `${stockName}.jpg`;

  anychartExport.exportTo(chart, "jpg").then(
    (img) => {
      fs.writeFile(fileName, image, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("graph img saved!");
        }
      });
    },
    (generationErr) => {
      console.log(generationErr);
    }
  );
};

client.on("ready", () => {
  console.log("HI!");
});

client.on("message", (msg) => {
  // console.log(msg.guild.roles);

  // if doesnt have sever db
  const dbFolder = `./db/${msg.guild.id}/`;

  try {
    if (!fs.existsSync(dbFolder)) {
      fs.mkdirSync(dbFolder);
    }
  } catch (err) {
    console.log(err);
  }

  if (msg.author.bot) return;
  if (msg.author.id === client.user.id) return;

  const id = msg.author.id;
  const name = msg.author.username;
  const filePath = `./db/${msg.guild.id}/${id}.json`; // 유저의 잔액 정보 담는 파일인듯 ㅇㅅㅇ

  // 기록 없으면 파일 생성
  !fs.existsSync(filePath)
    ? fs.writeFileSync(filePath, JSON.stringify({}))
    : null;

  const saveChgedUserDB = () => {
    fs.writeFileSync(filePath, JSON.stringify(saveUser)); // save updated userdata
  };

  const user = JSON.parse(fs.readFileSync(filePath, "utf-8")); // after reading file, save to user

  const today = new Date();
  const date = "" + today.getFullYear() + today.getMonth() + today.getDate();

  const wrongUseAlert = (content) => {
    const exampleEmbed = new Discord.MessageEmbed()
      .setColor(`#8f8f8f`)
      .setTitle("잘못된 사용법!")
      .setDescription(content);
    msg.channel.send(exampleEmbed);
  };

  // set amount of money to give
  const howMuch = 20;
  const easterReward = 40;
  let saveUser = {};
  if (msg.content == "도트 돗줘") {
    // give 20d
    if (!user.id) {
      const exampleEmbed = new Discord.MessageEmbed()
        .setColor(`#8f8f8f`)
        .setTitle(`등록 성공!`)
        .setDescription(
          `${name}! 도트를 사용하는건 처음이구나! 처음이니 ${
            howMuch * 1.5
          }돗을 줄께!`
        );
      msg.channel.send(exampleEmbed);
      saveUser = {
        id: id,
        name: name,
        date: date,
        money: howMuch * 1.5,
        gotEaster: false,
        stocks: {
          애플: [0, 0],
          구글: [0, 0],
          테슬라: [0, 0],
          로블록스: [0, 0],
          메타: [0, 0],
        },
      };
    } else {
      // no hist of user
      if (user.id) {
        // there is hist of user
        if (user.date != date) {
          // if user got money today
          const exampleEmbed = new Discord.MessageEmbed()
            .setColor(`#8f8f8f`)
            .setTitle(`적립완료!`)
            .setDescription(
              `${howMuch}돗 적립완료! \n${name}님의 현재 잔액은 ${user.money + howMuch}이야!`
            );
          msg.channel.send(exampleEmbed);
          saveUser = {
            // update user info
            id,
            name,
            date, //의사양반...도트가 어케된겨...
            money: user.money + howMuch,
            gotEaster: user.gotEaster,
            stocks: user.stocks,
          };
        } else {
          const exampleEmbed = new Discord.MessageEmbed()
            .setColor(`#8f8f8f`)
            .setTitle(`이미 적립됬어!`)
            .setDescription("오늘은 이미 적립이 되었어!내일 다시 와!");
          msg.channel.send(exampleEmbed);
          saveUser = user; // no data changes, just save
        }
      }
    }

    saveChgedUserDB();
  }

  const stocks = {
    애플: "AAPL",
    구글: "GOOG",
    테슬라: "TSLA",
    로블록스: "RBLX",
    메타: "FB",
  };

  const stocks_arr = ["애플", "구글", "테슬라", "로블록스", "메타"];

  if (msg.content.substring(0, 5) == "도트 주가") {
    const stockName = msg.content.split(" ")[2];
    if (!stockName) {
      wrongUseAlert(
        `올바른 사용법은 **도트 주가 <회사 이름>**이야!\n자세한 정보는 **도트 주식사용법**에서 확인해봐!`
      );
    } else if (!stocks[stockName]) {
      wrongUseAlert(
        `입력한 ${stockName}은 돗이 지원하지 않는 주식이야!\n자세한 정보는 **도트 주식사용법**에서 확인해봐!`
      );
    } else {
      const apiLink = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${stocks[stockName]}&interval=1min&apikey=88J02IFT5LJAUZP6`;
      request(apiLink, function (error, response, body) {
        if (error) {
          console.log(error);
        }
        const obj = JSON.parse(body);
        const objKey = Object.keys(obj)[1];
        const date = Object.keys(obj[Object.keys(obj)[1]])[0];
        const price = obj[objKey][date]["4. close"];
        const exampleEmbed = new Discord.MessageEmbed()
          .setColor(`#8f8f8f`)
          .setTitle(`${stockName}의 주가`)
          .setDescription(`오늘의 ${stockName} 주가: ${price}돗!`);
        msg.channel.send(exampleEmbed);
      });
    }
  }

  if (msg.content.substring(0, 7) == "도트 주식구매") {
    const stockName = msg.content.split(" ")[2];
    const num = Number(msg.content.split(" ")[3]);
    if (!stocks[stockName]) {
      wrongUseAlert(
        `입력한 ${stockName}은 돗이 지원하지 않는 주식이야!\n자세한 정보는 **도트 주식사용법**에서 확인해봐!`
      );
    } else {
      const apiLink = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${stocks[stockName]}&interval=1min&apikey=88J02IFT5LJAUZP6`;
      request(apiLink, (error, response, body) => {
        if (error) {
          console.log(error);
        }
        const obj = JSON.parse(body);
        const objKey = Object.keys(obj)[1];
        const date = Object.keys(obj[Object.keys(obj)[1]])[0];
        const price = obj[objKey][date]["4. close"];

        if (!user.id) {
          const exampleEmbed = new Discord.MessageEmbed()
            .setColor(`#8f8f8f`)
            .setTitle(`등록되지 않은 유저!`)
            .setDescription(
              `**도트 돗줘**를 입력해서 등록하고, 서비스를 이용해봐!`
            );
          msg.channel.send(exampleEmbed);
        } else if (!num) {
          wrongUseAlert(
            "잘못된 사용법!",
            "**도트 주식구매 <구매할 양>**가 올바른 사용법이야!"
          );
        } else if (price * num > user.money) {
          const exampleEmbed = new Discord.MessageEmbed()
            .setColor(`#8f8f8f`)
            .setTitle(`잔액 부족!`)
            .setDescription(`돈이 부족해! 돈을 모아서 다시 와!`);
          msg.channel.send(exampleEmbed);
        } else {
          if (price * num <= user.money) {
            const costMoney = price * num;

            let stockCurr = {
              애플: user.stocks["애플"],
              구글: user.stocks["구글"],
              테슬라: user.stocks["테슬라"],
              로블록스: user.stocks["로블록스"],
              메타: user.stocks["메타"],
            };

            // console.log(stockCurr[stockName]);
            let changingStock = stockCurr[stockName];
            let avg;
            if (user.stocks[stockName][1] == 0) {
              avg = price;
            } else {
              avg = (
                (user.stocks[stockName][0] + costMoney) /
                (num + 1)
              ).toFixed(2);
            }
            console.log(avg);
            changingStock = [Number(avg), (changingStock[1] += num)];

            for (const i of getKeys(stockCurr)) {
              if (i == stockName) {
                stockCurr[i] = changingStock;
              }
            }

            saveUser = {
              id,
              name,
              date,
              money: user.money - costMoney,
              gotEaster: user.gotEaster,
              stocks: stockCurr,
            };
            saveChgedUserDB();

            let stockMsg = "";

            // value: `평단: ${avg}, ${user.stocks[1] + num}주 보유 중`,
            for (const i of getKeys(user.stocks)) {
              if (user.stocks[i][0] != 0 && user.stocks[i][1] != 0) {
                if (stockName == i) {
                  stockMsg += `**${i}**: 평단: ${avg}, ${user.stocks[i][1]}주\n`;
                } else {
                  stockMsg += `**${i}**: 평단: ${user.stocks[i][0]}, ${user.stocks[i][1]}주\n`;
                }
                console.log(user.stocks[i]);
              }
            }
            // console.log(user.stocks);
            const nowM = (user.money - costMoney).toFixed(2);
            const embed = new Discord.MessageEmbed()
              .setColor(`#8f8f8f`)
              .setTitle("주식 구매")
              .setDescription(`${stockName}의 주식을 ${price}돗으로 구입했어!`)
              .addFields(
                {
                  name: "주식계좌:",
                  value: stockMsg,
                },
                {
                  name: "잔액:",
                  value: `${user.money} -> ${nowM}`,
                }
              );
            msg.channel.send(embed);
          } else {
            const embed = new Discord.MessageEmbed()
              .setColor(`#8f8f8f`)
              .setTitle(`잔액 부족`)
              .setDescription(`${stockName}의 주가는 ${price}돗 이지만 너의 잔액은 ${user.money}돗이야. 돈을 더 모아서 와!`)
            msg.channel.send(embed);
          }
        }
      });
    }
  }

  if (msg.content.substring(0, 7) == "도트 주식판매") {
    const stockName = msg.content.split(" ")[2];
    const num = msg.content.split(" ")[3];
    if (!user.id) {
      const exampleEmbed = new Discord.MessageEmbed()
        .setColor(`#8f8f8f`)
        .setTitle(`등록되지 않은 유저!`)
        .setDescription(
          `**도트 돗줘**를 입력해서 등록하고, 서비스를 이용해봐!`
        );
      msg.channel.send(exampleEmbed);
    } else if (!num) {
      wrongUseAlert("잘못된 사용법!", "");
    } else if (num > user.stocks[1] || !user.stocks[1]) {
      msg.reply("남은 주식이 없어서 판매할 수가 없어!");
    } else {
      console.log(num);
      if (num > 0) {
        // tell
        const embed = new Discord.MessageEmbed()
          .setColor(`#8f8f8f`)
          .setTitle("주식 판매")
          .setDescription(
            `${stockName}의 주식을 한 주식 당 ${user.stocks[0]}돗으로 판매했어!`
          )
          .addFields({
            name: "주식계좌:",
            value: `평단: ${user.stocks[0]}, ${user.stocks[1] - num}`,
            name: "잔액:",
            value: `${user.money} -> ${user.money + user.stocks[0] * num}`,
          });
        msg.channel.send(embed);

        // update db
        saveUser = {
          id,
          name,
          date,
          money: user.money + user.stocks[0] * num,
          gotEaster: user.gotEaster,
          stocks: [user.stocks[0], user.stocks[1] - num],
        };
        saveChgedUserDB();
      }
    }
  }

  if (msg.content == "도트 과일게임") {
    if (!user.id) {
      const exampleEmbed = new Discord.MessageEmbed()
        .setColor(`#8f8f8f`)
        .setTitle(`등록되지 않은 유저!`)
        .setDescription(
          `**도트 돗줘**를 입력해서 등록하고, 서비스를 이용해봐!`
        );
      msg.channel.send(exampleEmbed);
    } else if (user.money < 2) {
      const exampleEmbed = new Discord.MessageEmbed()
        .setColor(`#8f8f8f`)
        .setTitle(`잔액 부족!`)
        .setDescription(`돈이 부족해! 돈을 모아서 다시 와!`);
      msg.channel.send(exampleEmbed);
    } else {
      const fruits = ["🍎", "🍌", "🍒", "🍇"];

      const pick = [
        fruits[getRandomInt(fruits.length)],
        fruits[getRandomInt(fruits.length)],
        fruits[getRandomInt(fruits.length)],
      ];
      let changedMoney = 0;
      let ret = ``;
      if (pick[0] == pick[1] && pick[1] == pick[2]) {
        ret = `세개의 과일이 모두 일치하다니! 기분이 좋으니 40돗을 줄게!!!`;
        changedMoney += 40;
      } else {
        ret = `아쉽게도 과일들이 일치하지 않았네ㅠ 안따깝지만 너의 2돗은 내꺼!`;
        changedMoney = -2;
      }
      const exampleEmbed = new Discord.MessageEmbed()
        .setColor(`#8f8f8f`)
        .setTitle(`과일게임의 결과는...! ${pick}`)
        .setDescription(ret);
      msg.channel.send(exampleEmbed);
      saveUser = {
        id: id,
        name: name,
        date: date,
        money: user.money + changedMoney,
        gotEaster: user.gotEaster,
        stocks: user.stocks,
      };
      saveChgedUserDB();
    }
  }

  if (msg.content == "도트 잔액확인" || msg.content == "도트 잔액") {
    if (user.id) {
      let stockMsg = "";
      for (const i of getKeys(user.stocks)) {
        if (user.stocks[i][0] == 0) {
          stockMsg += "";
        } else {
          stockMsg += `**${i}**: 평단: ${user.stocks[i][0]}, ${user.stocks[i][1]}주\n`;
        }
        console.log(user.stocks[i]);
      }
      const embed = new Discord.MessageEmbed()
        .setColor(`#8f8f8f`)
        .setTitle(`${user.name}의 현재 잔액:`)
        .addFields(
          { name: "돗:", value: `${user.money}돗` },
          {
            name: "주식: ",
            value: stockMsg,
            inline: true,
          }
        )
        .setTimestamp();
      msg.reply(embed);
    } else if (!user.id) {
      const embed = new Discord.MessageEmbed()
        .setColor(`#8f8f8f`)
        .setTitle(`등록되지 않은 유저!`)
        .setDescription(
          `**도트 돗줘**를 입력해서 등록하고, 서비스를 이용해봐!`
        );
      msg.reply(embed);
    }
  }

  if (msg.content == "도트 커맨드") {
    // 도트 명령어 알려주는 기능이다.
    const embed = new Discord.MessageEmbed()
      .setTitle("커맨드")
      .setColor(`#8f8f8f`)
      .addFields(
        {
          name: `**도트 ㅎㅇ**`,
          value: `동방예의지국인 대한민국에서 인사는 기본이겠지?`,
        },
        {
          name: `**도트 돗줘**`,
          value: `하루에 한번 20돗씩 받아봐! 처음 오셨다면 30돗이야!`,
        },
        { name: `**도트 잔액확인 | 잔액**`, value: "잔액을 확인해봐!" },
        { name: `**도트 가위바위보**`, value: `간단한 가위바위보를 즐겨봐!` },
        { name: `**도트 운세**`, value: `오늘의 운세를 확인해봐!` },
        {
          name: `**도트 과일게임**`,
          value: `과일이 들어간 세칸이 모두 같으면 40돗!`,
        },
        { name: `**도트 리더보드**`, value: `서버의 리더보드를 확인해봐!` },
        { name: `**도트 동전**`, value: `앞면이 나올까? 뒷면이 나올까?` },
        {
          name: `**도트 투표**`,
          value: `민주주의 국가 대한민국에서 가장 필요한 투표!`,
        },
        {
          name: `**도트 저뭐먹**`,
          value: `저녁을 뭐 먹을지 고민될때 사용해봐!`,
        },
        {
          name: `**도트 제비뽑기 <항목1> <항목2>...**`,
          value: `결정이 힘들어질때 사용해봐!`,
        },
        { name: `**도트 주식사용법**`, value: `주식 사용법을 자세하게 알아봐!` }
      );
    msg.channel.send(embed);
  }

  if (msg.content === "도트 주식사용법") {
    const embed = new Discord.MessageEmbed()
      .setTitle("**주식 사용법**")
      .setColor(`#8f8f8f`)
      .addFields(
        { name: "회사 종류", value: `애플, 구글, 테슬라, 로블록스, 메타` },
        {
          name: `**도트 주가 <회사이름>**`,
          value: `구매했던 주식의 주가를 확인해봐!`,
        },
        {
          name: `**도트 주식구매 <회사이름> <주>**`,
          value: `도트에서 주식을 구매해봐!`,
        },
        {
          name: `**도트 주식판매 <회사이름> <주>**`,
          value: `구매했던 주식을 판매해봐!`,
        }
      )
      .setFooter(`*주식시장은 주말에 열리지 않음*`);
    msg.channel.send(embed);
  }

  if (msg.content == "도트 리더보드") {
    // get all ids from db
    const dbFolder = `./db/${msg.guild.id}/`;
    let dbs = [];
    let userInfos = [];
    fs.readdirSync(dbFolder).forEach((db_id) => {
      dbs.push(db_id);
    });

    // get money data from each dbs
    dbs.forEach((user_id) => {
      const db = JSON.parse(fs.readFileSync(`${dbFolder}${user_id}`, "utf-8"));
      const i = {
        name: db.name,
        money: db.money,
      };
      if (i.money != undefined && i.name != undefined) {
        userInfos.push(i);
      }
    });

    console.log(userInfos);
    let raw_moneys = [];
    userInfos.forEach((i) => {
      raw_moneys.push(i.money);
    });
    raw_moneys = raw_moneys
      .sort((a, b) => a - b)
      .reverse()
      .slice(0, 11);
    console.log(raw_moneys);

    const moneys = raw_moneys.filter((val, idx) => {
      return raw_moneys.indexOf(val) === idx; //값이 처음나오는 배열 인덱스와 현재 인덱스가 같으면 포함
    });

    let value = "";
    moneys.forEach((money) => {
      for (const i of userInfos) {
        if (i.money == money) {
          value += `${userInfos.indexOf(i) + 1}등: **${i.name}**(${
            i.money
          }돗)\n`;
        }
      }
    });
    const embed = new Discord.MessageEmbed()
      .setColor("#8f8f8f")
      .setTitle(`${msg.guild}의 리더보드!`)
      .setDescription(value)
      .setTimestamp();
    msg.channel.send(embed);
  }

  if (msg.content == "도트 ㅎㅇ") {
    // 인사를 해주는 기능이다.
    // const msgs = ["안녕!", "ㅎㅇ!", "안녕하시오리까"];
    // msg.reply(msgs[getRandomInt(3)])
    const exampleEmbed = new Discord.MessageEmbed()
      .setColor(`#8f8f8f`)
      .setDescription(`안녕!`);
    msg.channel.send(exampleEmbed);
  }

  if (msg.content.includes("도트 제비뽑기")) {
    //제비뽑기 기능이다.
    let elements = msg.content.replace("도트 제비뽑기 ", "");
    elements = elements.split(" ");
    // msg.channel.send(`${elements[getRandomInt(elements.length)]}`);
    const embed = new Discord.MessageEmbed()
      .setColor("#8f8f8f")
      .setTitle("제비뽑기의 결과")
      .setDescription(
        `결과는.. **${elements[getRandomInt(elements.length)]}**!`
      );

    msg.channel.send(embed)
  }

  if (msg.content == "도트 주사위") {
    //주사위기능이다.
    const result = getRandomInt(6) + 1;
    // msg.channel.send(`:game_die: 주사위 결과는 **${result}** 이야!`);
    const embed = new Discord.MessageEmbed()
      .setTitle(":game_die: 주사위!")
      .setColor("#8f8f8f")
      .setDescription(`주사위의 결과는 **${result}**이야!`);
    msg.channel.send(embed);
  }

  if (msg.content == "도트 동전") {
    const num = getRandomInt(100) + 1;
    let message = "";
    let changedMoney;
    const msgList = {
      front: ["앞면", 2],
      back: ["뒷면", -2],
      mid: ["가운데", 20],
    };
    if (num <= 48) {
      const exampleEmbed = new Discord.MessageEmbed()
        .setTitle("결과는..?")
        .setColor(`#8f8f8f`)
        .setDescription(
          `${msgList.front[0]}이 나왔다! ${msgList.front[1]}돗 가져!`
        );
      msg.channel.send(exampleEmbed);
      changedMoney = msgList.front[1];
    } else if (num <= 99) {
      const exampleEmbed = new Discord.MessageEmbed().setTitle(`결과는..?`)
        .setDescription(`${msgList.back[0]}이 나왔다! ${
        msgList.back[1] * -1
      }돗을 가져갈게...
\n현재 잔액: ${user.money} -> ${user.money + changedMoney}`);
      msg.channel.send(exampleEmbed);
      changedMoney = msgList.back[1];
    } else {
      const exampleEmbed = new Discord.MessageEmbed()
        .setDescription(`매우 낮은 확률로 동전이 세워졌다! 기분이 좋으니 ${
        msgList.mid[1]
      }돗 가져!
\n현재 잔액: ${user.money} -> ${user.money + changedMoney}`);
      msg.channel.send(exampleEmbed);
      changedMoney = msgList.mid[1];
    }
    saveUser = {
      id: id,
      name: name,
      date: date,
      money: user.money + changedMoney,
      gotEaster: user.gotEaster,
      stocks: user.stocks,
    };
    saveChgedUserDB();
  }

  if (msg.content == "도트 운세") {
    // 운세 기능이다.
    const int_luck = getRandomInt(100) + 1;
    const luckMessages = {};
    let changedMoney = 0;
    if (!user.id) {
      const embed = new Discord.MessageEmbed()
        .setColor(`#8f8f8f`)
        .setTitle(`등록되지 않은 유저!`)
        .setDescription(
          `**도트 돗줘**를 입력해서 등록하고, 서비스를 이용해봐!`
        );
      msg.channel.send(embed);
    } else {
      if (int_luck == 77) {
        changedMoney = 20;
        const embed = new Discord.MessageEmbed()
          .setColor(`#8f8f8f`)
          .setTitle(`오늘의 운세!`)
          .setDescription("행운의 77! 옛다 20돗 먹어라!");
        msg.channel.send(embed);
      } else if (int_luck >= 91) {
        if (int_luck == 100) {
          changedMoney = 20;
          const embed = new Discord.MessageEmbed()
            .setColor(`#8f8f8f`)
            .setTitle(`오늘의 운세!`)
            .setDescription("운이 100점이 나오다니! 옛다 20돗 먹어라!");
          msg.channel.send(embed);
        } else {
          changedMoney = int_luck - 90;
          const embed = new Discord.MessageEmbed()
            .setColor(`#8f8f8f`)
            .setTitle(`오늘의 운세!`)
            .setDescription(
              `${int_luck}점이 나오다니... 옛다 ${changedMoney}돗 먹어라!`
            );
          msg.channel.send(embed);
        }
      } else if (int_luck <= 9) {
        if (int_luck == 1) {
          changedMoney = -20;
          const embed = new Discord.MessageEmbed()
            .setColor(`#8f8f8f`)
            .setTitle(`오늘의 운세!`)
            .setDescription(`풉ㅋ 어떻게 0점이 나오냐 ㅋ 20돗 맛있게 먹을게!`);
          msg.channel.send(embed);
        } else {
          changedMoney -= 10 - int_luck;
          const embed = new Discord.MessageEmbed()
            .setColor(`#8f8f8f`)
            .setTitle(`오늘의 운세!`)
            .setDescription(
              `풉ㅋ 어떻게 ${int_luck}점이 나오냐 ㅋ ${
                changedMoney * -1
              }돗 맛있게 먹을게!`
            );
          msg.channel.send(embed);
        }
      }
      saveUser = {
        // update user info
        id,
        name,
        date,
        money: user.money + changedMoney,
        gotEaster: user.gotEaster,
        stocks: user.stocks,
      };
      saveChgedUserDB();
    }
  }

  if (msg.content == "도트 저뭐먹") {
    var meal;
    request(
      "https://www.themealdb.com/api/json/v1/1/random.php",
      { json: true },
      (err, res, body) => {
        if (err) {
          return console.log(err);
        }
        meal = body.meals[0].strMeal;
        // msg.reply(`오늘 당신이 쳐(?)먹을 저녁은 ${meal}입니다!`)

        const embed = new Discord.MessageEmbed()
          .setColor(`#8f8f8f`)
          .setThumbnail(body.meals[0].strMealThumb)
          .setAuthor("도트봇의 센스 있는 저녁 추천!")
          .setTitle(`${meal}`)
          .setDescription(`오늘 먹을 저녁은 ${meal}`)
          .setURL(body.meals[0].strYoutube);
        msg.channel.send(embed);
      }
    );
  }

  if (msg.content === "도트 관리자") {
    // 임베드를 사용하여 메세지를 보내는기능.보기 깔끔한것이 장점.
    const embed = new Discord.MessageEmbed()
      .setColor(`#8f8f8f`)
      .setTitle("이 사람들은 나를 만든 사람들이야!")
      .addField("[Developer]", "이아늬")
      .addField("[Developer]", "dark0316")
      .addField("[Developer]", "이상원");
    msg.channel.send(embed);
  }

  if (msg.content.substring(0, 5) === "도트 투표") {
    //도트 투표기능

    const description = msg.content.substring(5);

    const embed = new Discord.MessageEmbed()
      .setTitle("도트의 O X 투표!")
      .setDescription(description)
      .setColor(`#8f8f8f`);
    msg.channel.send(embed).then((msg) => {
      msg.react("⭕"); //react는 디스코드상에서 메세지에 이모티콘으로 반응해주는 코드이
      msg.react("❌");
    });
  }

  if (msg.content == "이스터") {
    if (user.gotEaster) {
      const exampleEmbed = new Discord.MessageEmbed()
        // msg.reply("너 이미 이스터에그로 꿀빨았으면서 너 빨려고 하냐 ㄲ져라")
        .setColor("#8f8f8f")
        .setTitle(`ㅗ`)
        .setDescription("조용히 하고 위에 메시지나 삭제해");
      saveUser = {
        id,
        name,
        date,
        money: user.money,
        gotEaster: true,
        stocks: user.stocks,
      };
      msg.channel.send(exampleEmbed);
    } else {
      const exampleEmbed = new Discord.MessageEmbed()
        .setColor(`#8f8f8f`)
        .setTitle(`이 메세지를 빨리 지워줘!`)
        .setDescription(`도트에 대해 얼마나 알아낸거야... \n선물로 ${easterReward}돗을 줄게!\n

${user.name}의 잔액:\n${user.money} -> ${user.money + easterReward}`);
      saveUser = {
        id: id,
        name: name,
        date: date,
        money: user.money + easterReward,
        gotEaster: true,
        stocks: user.stocks,
      };
      msg.channel.send(exampleEmbed);
    }

    fs.writeFileSync(filePath, JSON.stringify(saveUser)); // 형 실행좀
  }

  if (
    msg.content === "도트 가위" ||
    msg.content === "도트 바위" ||
    msg.content === "도트 보"
  ) {
    //가위바위보 코드이다.
    if (!user.id) {
      const exampleEmbed = new Discord.MessageEmbed()
        .setColor(`#8f8f8f`)
        .setTitle(`등록되지 않은 유저!`)
        .setDescription(
          `**도트 돗줘**를 입력해서 등록하고, 서비스를 이용해봐!`
        );
      msg.channel.send(exampleEmbed);
    } else {
      const list = { 가위: 1, 바위: 2, 보: 3 };
      const human = list[msg.content.split(" ")[1]];
      const bot = getRandomInt(3) + 1; // 1 || 2 || 3

      var keys = Object.keys(list);
      const str_human = keys[human - 1];
      const str_bot = keys[bot - 1];

      if (human - bot == 0) {
        // same
        const exampleEmbed = new Discord.MessageEmbed()
          .setColor("#8f8f8f")
          .setTitle("무승부!").setDescription(`
          ${user.name}: ${str_human}, Dot: ${str_bot}!\n${user.name}에게 들어간 돗: **0돗**\n
현재 잔액: ${user.money} -> ${user.money}`);
        // msg.channel.send(`
        //   ${user.name}: ${str_human}, Dot: ${str_bot}! 결과: 비김
        //   ${user.name}에게 들어간 돗: **0돗**
        //   현재 잔액: ${user.money} -> ${user.money}
        // `);
        saveUser = {
          id: id,
          name: name,
          date: date,
          money: user.money,
          gotEaster: user.gotEaster,
          stocks: user.stocks,
        };
        msg.channel.send(exampleEmbed);
      } else if (human - bot == -1 || human - bot == 2) {
        // lose
        const exampleEmbed = new Discord.MessageEmbed()
          .setColor("#8f8f8f")
          .setTitle("패배!").setDescription(`
          ${user.name}: ${str_human}, Dot: ${str_bot}!\n${
          user.name
        }에게 들어간 돗: **-4돗**\n
현재 잔액: ${user.money} -> ${user.money - 4}
        `);
        // msg.channel.send(`
        // ${user.name}: ${str_human}, Dot: ${str_bot}! 결과: 짐
        // ${user.name}에게 들어간 돗: **-4돗**
        // 현재 잔액: ${user.money} -> ${user.money - 4}
        // `);
        saveUser = {
          id: id,
          name: name,
          date: date,
          money: user.money - 4,
          gotEaster: user.Easter,
          stocks: user.stocks,
        };
        msg.channel.send(exampleEmbed);
      } else if (human - bot == 1 || human - bot == -2) {
        // win
        const exampleEmbed = new Discord.MessageEmbed()
          .setColor("#8f8f8f")
          .setTitle("승리!").setDescription(`
          ${user.name}: ${str_human}, Dot: ${str_bot}!\n${
          user.name
        }에게 들어간 돗: **+4돗**\n
현재 잔액: ${user.money} -> ${user.money + 4}`);
        // msg.reply(`
        //   ${user.name}: ${str_human}, Dot: ${str_bot}! 결과: 이김
        //   ${user.name}에게 들어간 돗: **+4돗**
        //   현재 잔액: ${user.money} -> ${user.money + 4}`);

        saveUser = {
          id: id,
          name: name,
          date: date,
          money: user.money + 4,
          gotEaster: user.gotEaster,
          stocks: user.stocks,
        };
        msg.channel.send(exampleEmbed);
      }
      saveChgedUserDB();
    }
  }
});

client.login(
  "OTcyNTUzNDcxOTM5MTgyNjMy.G73F9L.58QVxSYRUPZ2FGfKKjbhMyncNcyl-9eKfVIwvI"
);
