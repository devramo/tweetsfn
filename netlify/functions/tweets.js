const Twitter = require('twitter');
const Big = require('big.js');
const config = {
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  bearer_token: process.env.BEARER_TOKEN,
}
const client = new Twitter(config);

exports.handler = async function(event, context, response) {
  console.log("NETLIFY FUNCTION CALLED")
  let name = event.queryStringParameters.name || ''
  let count = event.queryStringParameters.count || 200
  let max = event.queryStringParameters.max || 200

  if(max>3200) max = 3200
  let loop = max /200 + (max % 200 ? 1 : 0)


  console.log(name, count, max, loop)

  let tweets = [];
  const params = {
    screen_name: name,
    trim_user: true,
    count,
  };

  let maxId = 0;
  for (let i = 0; i < loop; i += 1) {
    if (maxId > 0) params.max_id = maxId;
    const p = new Promise((resolve, reject) => {
      client.get('statuses/user_timeline', params, (error, list) => {
        if (!error) {
          resolve(list);
          return;
        }
        reject(error);
      });
    });
    tweets = [...tweets, ...await p];
    maxId = new Big(tweets[tweets.length - 1].id_str).minus(1).toString();
  }

  return {
    statusCode: 200,
    body: JSON.stringify({tweets})
  };
}