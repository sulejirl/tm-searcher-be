const router = module.exports = require('express').Router();
const {searchTm,getProfile,getDetailedStats,getStatsBySeason} = require('./controller');

router.get('/search', searchTm)
router.get('/profile',getProfile);
router.get('/statsbyseason', getStatsBySeason);
router.get('/stats', getDetailedStats);

