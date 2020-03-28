var Crawler = require("simplecrawler");
const htmlparser2 = require("htmlparser2");
var moment = require("moment-timezone");

module.exports = {
    tmSearch: (searchTerm, callback) => {
        let resultRow = false;
        let resultClub = false;
        let nameArr = [];
        let clubArr = [];
        let imgArr = [];
        let inlineTr = false;
        let zentriert = false;
        let zentriertArr = [];
        let playerArr = [];
        let tr = false;


        const parser = new htmlparser2.Parser({
            onopentag(name, attribs) {
                if (name === "table" && attribs.class === 'inline-table') {
                    resultRow = true;
                }
                if (resultRow && name === 'tr') {
                    inlineTr = true;
                }
                if (inlineTr && name === 'a' && attribs.class === 'spielprofil_tooltip') {
                    nameArr.push({
                        name: attribs.title,
                        id: attribs.id
                    })
                }
                if (inlineTr && name === 'a' && (attribs.class === 'vereinprofil_tooltip' || attribs.title === 'Retired' || attribs.title === 'Unknown')) {
                    resultClub = true;
                }
                if (inlineTr && name === 'img') {
                    imgArr.push(attribs.src);
                }
                if (name === 'td' && attribs.class === 'zentriert') {
                    zentriert = true;
                }
            },
            ontext(text) {
                if (resultClub) {
                    clubArr.push(text);
                }
                if (zentriert && zentriertArr.length < 10) {
                    if (playerArr.length !== 2) {
                        playerArr.push(text.trim());
                    } else {
                        zentriertArr.push(playerArr);
                        playerArr = [];
                        playerArr.push(text.trim())
                    }
                }
            },
            onclosetag(tagname) {
                if (tagname === 'table') {
                    resultRow = false;
                }
                if (tagname === 'tr') {
                    inlineTr = false;
                    tr = false;
                }
                if (tagname === 'td') {
                    zentriert = false;
                }
                if (tagname === 'a') {
                    resultClub = false;
                }
                if (tagname === 'tbody') {
                    tbody = false;
                }

            }
        }, {
            decodeEntities: true
        });

        var crawler = Crawler(`https://www.transfermarkt.com/schnellsuche/ergebnis/schnellsuche?query=${searchTerm}&x=0&y=0`)

        crawler.maxDepth = 1;
        crawler.decodeResponses = true;

        crawler.on("fetchcomplete", function (queueItem, responseBuffer, response) {
            parser.write(responseBuffer);
            parser.end();

            for (let i = 0; i < nameArr.length; i++) {
                nameArr[i].club = clubArr[i];
                nameArr[i].img = imgArr[i];
                if(zentriertArr.length > 0 && zentriertArr.length > i){
                    nameArr[i].position = zentriertArr[i][0];
                    nameArr[i].age = zentriertArr[i][1];
                }
            }
            callback(nameArr)

        });

        crawler.start();

    },
    getProfile: (id, callback) => {
        let isTable = false;
        let isNationalTable = false;
        let td = false;
        let th = false;
        let result = {};
        let key = '';
        let currentClub = false;
        let dateOfBirth = false;
        let height = false;
        let playerName = false;
        let valuePath = false;
        let playerValue = false;
        let capsNGoalsPath = false;
        let nationalTeam = false;
        let nationalTeamName = false;
        let nationalTeamInfo = false;
        let capsNGoalsValue = false;
        let tempCapsNGoal = '';
        let formerInternationalPath = false;
        let formerInternational = false;
        let formerInternationalValue = '';
        let mainPositionPath = false;
        let mainPositionValue = '';
        let otherPositionPath = false;
        let otherPositionValue = '';
        let nationalTeamArray = [];


        const parser = new htmlparser2.Parser({
            onopentag(name, attribs) {
                if (name === "table" && attribs.class === "auflistung") {
                    isTable = true;
                }
                if (name === "table" && attribs.class === "borderloser_odd_even_style") {
                    isNationalTable = true;
                }
                if (name === "div" && attribs.class === "hauptposition-left") {
                    mainPositionPath = true;
                }
                if (name === "div" && attribs.class === "nebenpositionen") {
                    otherPositionPath = true;
                }
                if (name === "p" && attribs.class === "hide-for-small notTablet") {
                    capsNGoalsPath = true;
                }
                if (name === "p" && attribs.class === "notTablet forMobile") {
                    formerInternationalPath = true;
                }
                if (formerInternationalPath && name === "span" && attribs.class === "dataValue") {
                    formerInternational = true;
                }
                if (capsNGoalsPath && name === "span" && attribs.class === "dataValue") {
                    capsNGoalsValue = true;
                }
                if (name === "h1" && attribs.itemprop === "name") {
                    playerName = true;
                }
                if (name === "div" && attribs.class === "zeile-oben") {
                    valuePath = true;
                }
                if (valuePath && name === "div" && attribs.class === "right-td") {
                    playerValue = true;
                }
                if (isTable && name === "th") {
                    th = true;
                }
                if (isTable && name === "td") {
                    td = true;
                }
                if (td && key === 'currentclub' && name === "a") {
                    currentClub = true;
                }
                if (td && key === 'dateofbirth' && name === "a") {
                    dateOfBirth = true;
                }
                if (td && key === 'height' && name === "td") {
                    height = true;
                }
                if (td && key === 'citizenship' && name === "img") {
                    result[key] = result[key] ? result[key] + ',' + attribs.title : attribs.title;
                }
                if(isNationalTable && name === 'td' && attribs.class === 'hauptlink no-border-links'){
                    nationalTeam = true;
                }
                if(nationalTeam && name === 'a'){
                    nationalTeamName = true;
                }
                if(isNationalTable && name === 'td' && attribs.class === 'zentriert'){
                    nationalTeamInfo = true;
                }
            },
            ontext(text) {
                if (th) {
                    key = text.replace(/\s/g, "")
                        .replace(":", "")
                        .toLowerCase();
                }
                if (td) {
                    if (key === 'nameinhomecountry') {
                        result[key] = text;
                    } else if (key === 'currentclub' || key === 'dateofbirth' || key === 'placeofbirth' || key === 'height' || key === 'citizenship' || key === 'playeragent' || key === 'joined' || key === 'socialmedia' || key === 'outfitter') {
                        if (currentClub) {
                            result[key] = text;
                        }
                        if (dateOfBirth) {
                            result[key] = moment.tz(text, "MMM DD, YYYY",'Europe/Istanbul');
                        }
                        if (height && text !== 'm' && text !== ' ') {
                            result[key] = result[key] ? result[key] + text : text;

                        }
                    } else if (key === 'contractexpires' || key === 'contractthereexpires') {
                        result[key] = moment.tz(text, "DD.MM.YYYY",'Europe/Istanbul');
                    } else if (key === 'dateoflastcontractextension') {
                        result[key] = moment.tz(text, "MMM DD, YYYY",'Europe/Istanbul');
                    } else {
                        result[key] = text.replace(/\s/g, "");
                    }

                }
                if (playerName) {
                    result.name = result.name ? result.name + text : text;
                }
                if (playerValue) {
                    result.currentValue = text.replace(/\s/g, "");
                    playerValue = false;
                    valuePath = false;
                }
                if (capsNGoalsValue) {
                    tempCapsNGoal = tempCapsNGoal + text;
                }
                if (formerInternational) {
                    formerInternationalValue = formerInternationalValue + text;
                }
                if (mainPositionPath) {
                    if (text.replace(/\s/g, "") !== 'Mainposition:') {
                        mainPositionValue = mainPositionValue + text;
                    }
                }
                if (otherPositionPath) {
                    if (text.replace(/\s/g, "") !== 'Otherposition:' && text.replace(/\s/g, "") !== ' ') {
                        otherPositionValue = otherPositionValue ? otherPositionValue + ',' + text.trim() : text.trim();

                    }
                }
                if(nationalTeamName) {
                    nationalTeamArray.push(text.trim())
                }
                if(nationalTeamInfo) {
                    text.trim().length > 0 ?nationalTeamArray.push(text.trim()) : '';
                }
            },
            onclosetag(tagname) {
                if (tagname === 'th') {
                    th = false;
                }
                if (tagname === 'td') {
                    td = false;
                    height = false;
                    nationalTeam = false;
                    nationalTeamInfo = false;
                }
                if (tagname === 'a') {
                    currentClub = false;
                    dateOfBirth = false;
                    nationalTeamName = false;
                }
                if (tagname === "table") {
                    isTable = false;
                    isNationalTable = false;
                }
                if (tagname === "img") {
                    placeOfBirth = false;
                }
                if (tagname === "h1") {
                    playerName = false;
                }
                if (tagname === "div") {
                    playerValue = false;
                    mainPositionPath = false;
                    otherPositionPath = false;
                }
                if (tagname === "p") {
                    capsNGoalsPath = false;
                    formerInternationalPath = false;
                }
                if (tagname === "span") {
                    capsNGoalsLabel = false;
                    capsNGoalsValue = false;
                    formerInternational = false;
                }
            }
        }, {
            decodeEntities: true
        });

        var crawler = Crawler(`https://www.transfermarkt.com/cyle-larin/profil/spieler/${id}`)

        crawler.maxDepth = 1;
        crawler.decodeResponses = true;

        crawler.on("fetchcomplete", function (queueItem, responseBuffer, response) {
            parser.write(responseBuffer);
            parser.end();
            result.formerInternational = formerInternationalValue.trim();
            result.caps = tempCapsNGoal.split('/')[0];
            result.mainPosition = mainPositionValue.trim();
            result.otherPosition = otherPositionValue
            let natInfo = []
            let tempObj = {};
            for(let i = 0; i <nationalTeamArray.length; i++){
                i%4 === 0 ? tempObj.nationalTeam = nationalTeamArray[i]: '';
                i%4 === 1 ? tempObj.debut = moment.tz(nationalTeamArray[i], 'MMM DD, YYYY','Europe/Istanbul'): '';
                i%4 === 2 ? tempObj.apps = nationalTeamArray[i]: '';
                i%4 === 3 ? tempObj.scored = nationalTeamArray[i]: '';
                if(i%4 === 3){
                natInfo.push(tempObj);
                    tempObj = {};
                }
            }
            result.nationalMatches = natInfo;
            callback(result);

        });

        crawler.start();

    },
    getDetailedStats: (id, callback) => {
        let resultRow = false;
        let resultTable = false;
        let resultBody = false;
        let competition = false;
        let club = false;
        let result = [];
        let line = [];
        let dataItem = false
        let dataValue = false
        let position = false;
        let positionValue = '';
        const parser = new htmlparser2.Parser({
            onopentag(name, attribs) {
                if (name === 'table' && attribs.class === 'items') {
                    resultTable = true
                }
                if (resultTable && name === 'tbody') {
                    resultBody = true
                }
                if (resultBody && name === "tr") {
                    resultRow = true;
                }
                if (resultRow && name === "td" && attribs.class === 'hauptlink no-border-links') {
                    competition = true;
                }
                if (resultRow && name === "td" && attribs.class === 'hauptlink no-border-rechts zentriert') {
                    club = true;
                }
                if (club && name === "img") {
                    line.push(attribs.alt)
                }
                if (name === "span" && attribs.class === 'dataItem') {
                    dataItem = true;
                }
                if (name === "span" && attribs.class === 'dataValue') {
                    dataValue = true;
                }
            },
            ontext(text) {
                if (resultRow) {

                    if (text.replace(/\s/g, "") !== '') {
                        if (competition) {
                            line.push(text);
                        } else {
                            line.push(text.replace(/\s/g, ""))

                        }
                    } else if (line.length > 0) {
                        let tempObj = {};
                        if (positionValue === 'Goalkeeper') {
                            tempObj = {
                                season: line[0],
                                competition: line[1],
                                club: line[2],
                                apps: line[4],
                                goals: line[6],
                                yellow: line[10],
                                secondyellow: line[11],
                                red: line[12],
                                conceded: line[13],
                                cleansheets: line[14],
                                minplayed: line[15]
                            };
                        } else {
                            tempObj = {
                                season: line[0],
                                competition: line[1],
                                club: line[2],
                                apps: line[4],
                                goals: line[6],
                                asists: line[7],
                                yellow: line[11],
                                secondyellow: line[12],
                                red: line[13],
                                minplayed: line[16]
                            };
                        }
                        result.push(tempObj)
                        line = [];
                    }

                    result.push()
                }
                if (dataItem && text.replace(/\s/g, "") === 'Position:') {
                    position = true;

                }
                if (dataValue && position) {
                    positionValue = text.replace(/\s/g, "")
                    position = false;
                }

            },
            onclosetag(tagname) {
                if (tagname === 'tr') {
                    resultRow = false;
                }
                if (tagname === 'a') {
                    competition = false;
                }
                if (tagname === 'td') {
                    competition = false;
                    club = false;
                }
                if (tagname === 'table') {
                    resultTable = false;
                }
                if (tagname === 'tbody') {
                    resultBody = false;
                }
                if (tagname === 'span') {
                    dataItem = false;
                    dataValue = false;
                }


            }
        }, {
            decodeEntities: true
        });

        var crawler = Crawler(`https://www.transfermarkt.com/mirko-maric/leistungsdatendetails/spieler/${id}/saison//verein/0/liga/0/wettbewerb//pos/0/trainer_id/0/plus/1`)

        crawler.maxDepth = 1;
        crawler.decodeResponses = true;

        crawler.on("fetchcomplete", function (queueItem, responseBuffer, response) {
            parser.write(responseBuffer);
            parser.end();
            callback(positionValue, result);
        });

        crawler.start();
    },
    getStatsBySeason: (id, season, callback) => {
        let tableHeader = false;
        let match = false;
        let competition = '';
        let competitionList = [];
        let matchTd = false;
        let matchA = false;
        let teams = false;
        let teamsA = false;
        let result = [];
        let line = [];
        let count = -1;




        const parser = new htmlparser2.Parser({
            onopentag(name, attribs) {
                if (name === 'div' && attribs.class === 'table-header img-vat') {
                    tableHeader = true
                }

                if (name === 'tr' && typeof (attribs.class) === 'string' && (attribs.class !== 'odd' && attribs.class !== 'even')) {
                    matchClass = attribs.class;
                    competitionList.push(competition);
                    if (line.length > 0) {
                        result.push({
                            match: line
                        });
                    }
                    line = [];
                    count = -1;
                    match = true;
                }
                if (tableHeader && name === 'img') {
                    competition = attribs.title;
                }
                if (match && name === 'td' && attribs.class !== 'zentriert no-border-rechts' && attribs.class !== 'no-border-links ' && attribs.class !== 'no-border-links hauptlink') {
                    count++;
                    line[count] = '';
                    matchTd = true;
                }
                if (match && name === 'td' && (attribs.class === 'no-border-links ' || attribs.class === 'no-border-links hauptlink')) {
                    teams = true;
                    count++;
                    line[count] = '';
                    matchTd = true;
                }
                if (teams && name === 'a') {
                    teamsA = true;
                }
                if (matchTd && name === 'a') {
                    matchA = true;
                }

            },
            ontext(text) {

                if (matchA && line[count] === '') {
                    line[count] = text.trim();
                }
                if (teamsA && line[count] === '') {
                    line[count] = text.trim();
                }
                if (!matchA && !teamsA && matchTd && line[count] === '') {
                    line[count] = text.trim();
                }

            },
            onclosetag(tagname) {
                if (tagname === 'div') {
                    tableHeader = false;
                }
                if (tagname === 'tr') {
                    tableHeader = false;
                    match = false;
                }
                if (tagname === 'td') {
                    matchTd = false;
                    teams = false;
                }
                if (tagname === 'a') {
                    matchA = false;
                    teamsA = false;
                }
                matchNotA = false;

            }
        }, {
            decodeEntities: true
        });

        var crawler = Crawler(`https://www.transfermarkt.com/mirko-maric/leistungsdaten/spieler/${id}/saison/${season}/plus/1#ELQ`)

        crawler.maxDepth = 1;
        crawler.decodeResponses = true;

        crawler.on("fetchcomplete", function (queueItem, responseBuffer, response) {
            parser.write(responseBuffer);
            parser.end();
            for (let i = 0; i < result.length; i++) {
                result[i].competition = competitionList[i];
                result[i].matchday = result[i].match[0];
                result[i].date = moment.tz(result[i].match[1], 'MMM DD, YYYY','Europe/Istanbul');
                result[i].home = result[i].match[2];
                result[i].away = result[i].match[3];
                result[i].score = result[i].match[4];
                if (result[i].match.length > 6) {
                    result[i].played = true;
                    result[i].position = result[i].match[5];
                    result[i].goals = result[i].match[6];
                    result[i].asists = result[i].match[7];
                    result[i].yellow = result[i].match[9];
                    result[i].secondYellow = result[i].match[10];
                    result[i].red = result[i].match[11];
                    result[i].subIn = result[i].match[12];
                    result[i].subOut = result[i].match[13];
                    result[i].min = result[i].match[14];
                } else {
                    result[i].played = false;
                }
                delete result[i].match;

            }
            callback(result);
        });

        crawler.start();
    }
}