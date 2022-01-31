import fetch from "node-fetch";
import  cheerio  from "cheerio";
import  mongoose  from "mongoose";
import CsvWriter from 'csv-writer'
import  { getUrl }  from "./utils/common.js";
import  database  from "./models/database.js"
import  {config}   from "./config/index.js";

const createCsvWriter = CsvWriter.createObjectCsvWriter;

// connect the database 

const db = `mongodb://${config.db.username}:${config.db.password}@cluster0-shard-00-00.blhdd.mongodb.net:27017,cluster0-shard-00-01.blhdd.mongodb.net:27017,cluster0-shard-00-02.blhdd.mongodb.net:27017/${config.db.database}?ssl=true&replicaSet=atlas-2xph43-shard-0&authSource=admin&retryWrites=true&w=majority`
mongoose.connect(db)
    .then(()=> console.log('connection successfull'))
    .catch((err)=>console.log('connection failed' , err));



// Create header of CSV file 
const csvWriter = createCsvWriter({
    path: './data.csv',
    header: [
        {id: 'link', title: 'Question Link'},
        {id: 'name', title: 'Question Name'},
		{id: 'viewed', title: 'Viewed'},
		{id: 'upvote', title: 'Upvote Count'},
		{id: 'answerCount', title: 'Answer Count'},
		

    ]
});


const getInformationAboutTheQuestion = async( {link})=>{
	link = "https://or.stackexchange.com/questions/7697/integer-programming-constraints-min-max-days-between-deliveries";
	
	const response = await fetch(link);
	const html = await response.text();
	const $ = cheerio.load(html);

	// getting the Name of the Question 
	var question = $(".question-hyperlink").get(0);
	var questionName = $(question).text().trim();

	// number of hit on this question 
	var noOfViewed = $('.flex--item.ws-nowrap.mb8>span').get(2);
	var parent = $(noOfViewed).parent();
	$(noOfViewed).remove();
	var viewedCount = $(parent). text().trim();

	// number of upvote 
	var upvote = $("*[itemprop = 'upvoteCount']").get(0);
	var upvoteCount = $(upvote).text().trim();

	// finding the number of answer of this question 
	var noOfAnswer = $("*[itemprop = 'answerCount']").get(0);
	var answerCount = $(noOfAnswer).text().trim();

	const informationAboutTheQuestion = {
		link , 
		questionName,
		viewedCount,
		upvoteCount,
		answerCount,
	}
	//console.log(informationAboutTheQuestion);

	return informationAboutTheQuestion;

}


const crawl = async({ url })=>{
	const response = await fetch(url);
	const html = await response.text();
	const $ = cheerio.load(html);

	const questionsLinks = $(".question-hyperlink")
		.map((i , link)=>link.attribs.href)
		.get()
	// console.log(questionsLinks);

	questionsLinks.forEach(async link => {

		if(link!==undefined){
			// write into csv file
			link = getUrl(link);
      const informationAboutTheQuestion = await getInformationAboutTheQuestion({ link });
			const record = [
				{
					link: (await informationAboutTheQuestion).link,
					name: (await informationAboutTheQuestion).questionName,
					viewed: (await informationAboutTheQuestion).viewedCount,
					upvote: (await informationAboutTheQuestion).upvoteCount,
					answerCount: (await informationAboutTheQuestion).answerCount,
				}
			]
			csvWriter.writeRecords(record)       // returns a promise
			.then(() => {
				console.log('...Done');
			});

			// write into database 
			const dbRecord = new database({
				link : (await informationAboutTheQuestion).link,
				questionName: (await informationAboutTheQuestion).questionName,
				Viewed: (await informationAboutTheQuestion).viewedCount,
				upvoteCount: (await informationAboutTheQuestion).upvoteCount,
				answerCount: (await informationAboutTheQuestion).answerCount,

			})

			dbRecord.save(function(err , data){
				if(err){
					console.log(err)
				}
				else{
					console.log('data inserted successfully');
				}
			})

		}
	})
}

function main() {
  const pageLimit = 1;
  for (let pageNo = 1; pageNo <= pageLimit; pageNo++) {
    crawl({
      url: `https://stackoverflow.com/questions?tab=newest&page=${pageNo}`
    });
  }
}

main();