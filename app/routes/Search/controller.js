const {tmSearch,getProfile,getDetailedStats,getStatsBySeason} = require('../../functions/searcher')
module.exports = {
    searchTm: (req,res) => {
         tmSearch(req.query.search, (result) => {
            res.send(result);
         })
    },
    getProfile: (req,res) => {
        getProfile(req.query.id, (result)=>{
            res.send(result);
        })
    },
    getDetailedStats:(req,res) => {
        getDetailedStats(req.query.id, (position,stats) => {
            let currentSeason = '';
            let currentClub = '';
            let tempArr= [];
            let response = [];
            for(let i = 0; i<stats.length;i++){
                if(currentSeason !== stats[i].season || currentClub !== stats[i].club){
                    if(tempArr.length> 0){
                        response.push({season:currentSeason,club:currentClub,stats:tempArr})
                        tempArr = [];
                        tempArr.push(stats[i]);
                    }else{
                        tempArr.push(stats[i]);
                    }
                    currentSeason !== stats[i].season ? currentSeason = stats[i].season : ''
                    currentClub !== stats[i].club ? currentClub = stats[i].club:'';
                    
                } else {
                    tempArr.push(stats[i]);
                }
            }
            response.push({season:currentSeason,club:currentClub,stats:tempArr})
            let result = {
                position,
                stats:response,
            }
            res.send(result);
        })
    },
    getStatsBySeason: (req,res) => {
        getStatsBySeason (req.query.id,req.query.season,(result)=> {
            let currentCompetition = '';
            let tempArr = [];
            let response = [];
            for(let i = 0; i<result.length;i++){
                if(currentCompetition !== result[i].competition){
                    if(tempArr.length> 0){
                        response.push({competition:currentCompetition,matches:tempArr})
                        tempArr = [];
                        tempArr.push(result[i]);
                    }else{
                        tempArr.push(result[i]);
                    }
                    currentCompetition !== result[i].competition ? currentCompetition = result[i].competition : ''
                    
                } else {
                    tempArr.push(result[i]);
                }
            }
            response.push({competition:currentCompetition,matches:tempArr})
            res.send(response);
        })   
    }
}

