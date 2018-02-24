const async     = require("async");
const snoowrap  = require("snoowrap")
const Request   = require("./Request");
const key       = "aQBK4Fezb4nnslJkP7uuhJv8rj8"

module.exports = (function(){

      const r = new snoowrap({
        userAgent: 'Tweedit by Mirira',
        clientId: '1kSrspmMM6VjyQ',
        clientSecret: 'vCuw5wjGs5b_HJYyPmx6ur-enfc',
        username: 'Mirira',
        password: '323450205',
        refreshToken: key
      })
    //private functions
    /**
     * Get related subreddits for each tag and create multi reddit from it
     * @param {Express Object} res res.send to send multi reddit link to front end
     * @param {String[]} tags tags from twitter analysis
     */
    function createMulti(res,tags){
      var subredditNames = [];
      async.each(tags, function(tag, callback){
          let options = {
            url:"https://oauth.reddit.com/api/subreddits_by_topic?query="+tag,
            headers:{
              'User-Agent':       'Tweedit by Mirira',
              "Authorization": "bearer " + key
            }
          }
//curl -X POST -d 'grant_type=password&username=Mirira&password=323450205' --user '1kSrspmMM6VjyQ:vCuw5wjGs5b_HJYyPmx6ur-enfc' https://www.reddit.com/api/v1/access_token
//curl -H "Authorization: bearer 9INSRKBgxfJJCpS5Y86fyta-v7I" -A "Tweedit by Mirira" https://oauth.reddit.com/api/subreddits_by_topic?query=technology
          Request(res, options, (subreddits) => {
              subredditNames = subredditNames.concat(JSON.parse(subreddits));
              callback();
          });
        }, function(err){
            if(err) throw err;
            let formattedSubs = [];
            for(var i of subredditNames){
              formattedSubs.push({
                "name":i.name
              });
            }
            res.send(JSON.stringify(prioritySort(formattedSubs)));
        });
    }
    /**
     * 
     * {
     *  "leagueoflegends": 5,
     *  "anime": 4
     * } 
     */
    function prioritySort(data){
        var checked = new Set();
        var counts = {};
        var output = [];
        for(var i = 0; i < data.length; i++){
            if(!checked.has(data[i].name)){
                checked.add(data[i].name);
                counts[data[i].name] = 1;
            } else {
                counts[data[i].name]++;
            }
        }
        let keys = Object.keys(counts);
        for(var j = 0; j < keys.length; j++){
            let o = {}
            o[keys[j]] = counts[keys[j]];
            output.push( o );
        }
        output.sort(function(a,b){
            let cA = Object.values(a)[0];
            let cB = Object.values(b)[0];
            if(cA > cB){ return -1;}
            if(cB > cA){ return 1;}
            return 0;
        });
        let finalOut = [];
        for(var k = 0; k < output.length; k++){  
            let key = Object.keys(output[k])[0];
            finalOut.push(key);
        }
        return finalOut;     
    }
    return {
        //public methods
        createMulti: function(res, tags){
            createMulti(res,tags);
        }
    };
})();
