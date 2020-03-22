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
            let response = {
                position,
                stats,
            }
            res.send(response);
        })
    },
    getStatsBySeason: (req,res) => {
        getStatsBySeason (req.query.id,req.query.season,(result)=> {
            res.send(result);
        })   
    }
}

