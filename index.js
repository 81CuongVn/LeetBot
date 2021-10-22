
const {Client, Intents, MessageEmbed} = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] })
const axios = require('axios');

let totalQ = [];
let freeQ = [{}];
let loading = false;
let easy = false;
let medium = false;
let hard = false;
let rand = 0;

var version = "1.0.0";

//Problem Objects
 function LCProblem(problem) {
  this.id = problem.stat.question_id;
  this.question_slug = problem.stat.question__title_slug;
  this.title = problem.stat.question__title;
  this.totalSubmitted = problem.stat.total_submitted;
  this.difficulty = problem.difficulty.level === 3 ? "Hard" : problem.difficulty.level === 2 ? "Medium" : "Easy";
  this.description = `\n Difficulty: ${this.difficulty}`;

  this.title = problem.stat.question__title;
}


client.on("ready", ()=> {
  console.log(`Logged in as ${client.user.tag}!`)
})


//Fetch free questions
const getLC = async() => {
  try {
    const res = await axios.get("https://leetcode.com/api/problems/all/");
    res.data.stat_status_pairs.forEach((problem)=> {
      const newProblem = new LCProblem(problem);

      if(!newProblem.paid) {freeQ.push(newProblem);}
      else {};
   
      totalQ.push(newProblem.id);
      loading = true;
    });
    
  }
  catch(err) {
    console.error(err);
  }
}

getLC();

function renderQ(data, msg) {

    if (easy) {
      const easyQ = data.filter(q => q.difficulty == "Easy");
      data = easyQ;
    }
    else if (medium) {
      const medQ = data.filter(q => q.difficulty == "Medium");
      data = medQ;
    }
    else if (hard) {
      const hardQ = data.filter(q => q.difficulty == "Hard");
      data = hardQ;
    }

rand = Math.floor(Math.random()*(data.length-0)+0);
let randData = data[rand];

let url = `https://leetcode.com/problems/${randData.question_slug}/`;
const embed = new MessageEmbed()  
      	.setColor('#f4a261')
      	.setTitle(`${randData.title}`)
	      .setAuthor('Leetcode', 'https://leetcode.com/static/images/LeetCode_logo.png', )
      	.setDescription(`${randData.description}`)
         .setURL(url);


msg.channel.send({ embeds: [embed] });

}

//render popular question
function renderPop(data,msg) {
  const popularData = data.filter((problem) => problem.totalSubmitted > 50000);
      if (easy) {
      const popEasy = popularData.filter(q => q.difficulty == "Easy");
      data = popEasy;
    }
    else if (medium) {
      const popMed = popularData.filter(q => q.difficulty == "Medium");
      data = popMed;
    }
    else if (hard) {
      const popHard = popularData.filter(q => q.difficulty == "Hard");
      data = popHard;
    }
    else { data = popularData; }

  rand = Math.floor(Math.random()*(data.length-0)+0);
  let randData = data[rand];
   let url = `https://leetcode.com/problems/${randData.question_slug}/`;

  const embed = new MessageEmbed()  
      	.setColor('#f4a261')
      	.setTitle(`${randData.title}`)
	      .setAuthor('Leetcode', 'https://leetcode.com/static/images/LeetCode_logo.png', )
      	.setDescription(`${randData.description}`)
         .setURL(url);


msg.channel.send({ embeds: [embed] });
}

//Find difficulty keywords
const findDiff = (word)=> {
    if (word.trim().includes("easy")) {
      easy = true; medium = false; hard = false;
      return true;
    }
    else if(word.trim().includes("medium")) {
      easy = false; medium = true; hard = false;
         return true;
    } 
    else if (word.trim().includes("hard")) {
      easy = false; medium = false; hard = true;
         return true;
    }
    return false;
}

//Find popular keywords
const findPop = (word) => {
    if (word.trim().includes("popular")) {
      return true;
    }
    return false;
}
//React to message
client.on("message", msg => {
 
  if (msg.content.startsWith("!")) {
     if (msg.content.includes("help")) {
    msg.reply(`How to use LeetBot: 
              !help : all commands \n
              !grind : random questions \n
              !grind easy/medium/hard : random easy/medium/hard questions \n
              !grind popular easy/medium/hard: random popular easy/medium/hard questions \n
              `);
       
  }
  else if (msg.content === "!total" && loading) {
    msg.reply(`Leetcode has ${totalQ.length-1} questions`);
  }
  else if (msg.content === "!grind" && loading) {
    console.log("me");
    renderQ(freeQ, msg);  
  
  }
  else if (findDiff(msg.content) && !findPop(msg.content) && loading) {
     console.log("mew");
        renderQ(freeQ, msg);  
  }
  else if (findDiff(msg.content) && findPop(msg.content) && loading) {
     console.log("meo");
        renderPop(freeQ,msg);
  }
  }
  
})


client.login(process.env.TOKEN);