const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const axios = require('axios');
const url = require('url');

//axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
//axios.defaults.headers.common['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept';
//axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const fullUrl = (req) => {
    return url.format({
      protocol: req.protocol,
      host: req.get('host'),
      pathname: req.originalUrl
    });
};

router.get('/', (req, res) => {
  res.json([
      { 'auth': '/api/v1/liquidm/auth/email/:email/password/:password'}, 
      '😳', 
      '🙄'
    ]);
});

// LIQUIDM_AUTH
const LIQUIDM_AUTH = process.env.LIQUIDM_AUTH_TOKEN || '';
let AUTH_TOKEN_LIQUIDM
try {
    AUTH_TOKEN_LIQUIDM = LIQUIDM_AUTH; 
    if (AUTH_TOKEN_LIQUIDM !== '') {
        console.log('AUTH_TOKEN_LIQUIDM: ' + AUTH_TOKEN_LIQUIDM);
    } else {
        console.log('AUTH_TOKEN_LIQUIDM is Empty');
    }
} catch (error) {
    console.error('AUTH_TOKEN_LIQUIDM not found;' + error);
}

axios.defaults.headers.common['authorization'] = AUTH_TOKEN_LIQUIDM;

// PARAM email
router.param('email', function(req,res, next, email){ next(); });
// PARAM password
router.param('password', function(req,res, next, password){ next(); });
// PARAM visualReports
router.param('visualReports', function(req,res, next, visualReports){ next(); });
// PARAM campaignID
router.param('campaignID', function(req,res, next, campaignID){ next(); });
// PARAM budgetID
router.param('budgetID', function(req,res, next, budgetID){ next(); });
// PARAM campaignName
router.param('campaignName', function(req,res, next, campaignName){ next(); });
// PARAM adID
router.param('adID', function(req,res, next, adID){ next(); });
// PARAM targetingID
router.param('targetingID', function(req,res, next, targetingID){ next(); });
// PARAM creativeID
router.param('creativeID', function(req,res, next, creativeID){ next(); });
// PARAM settingsID
router.param('settingsID', function(req,res, next, settingsID){ next(); });
// PARAM uploadFile
router.param('uploadFile', function(req,res, next, uploadFile){ next(); });

// UPDATE AUTH
router.get('/auth/renew',(req,res) => {
    const URL_AUTH = '/auth/renew';
    const METHOD_AUTH = 'GET';
    const BASE_URL_AUTH = 'https://platform.liquidm.com/api/auth';
    const REQ_PARAMS_EMAIL = process.env.LIQUIDM_AUTH_TOKEN_EMAIL;
    const REQ_PARAMS_PASSWORD = process.env.LIQUIDM_AUTH_TOKEN_PASSWORD;
    const HEADERS_AUTH = { 'cache-control': 'no-cache' };
    const PARAMS_AUTH = { email: REQ_PARAMS_EMAIL, password: REQ_PARAMS_PASSWORD, api: 'true' };
    const getAuth = async URL_AUTH => {
        try {
            const AXIOS_RESPONSE = await axios({
            method: METHOD_AUTH,
            url: BASE_URL_AUTH,
            params: PARAMS_AUTH,
            headers: HEADERS_AUTH
            })
            .then(function(AXIOS_RESPONSE) {
                console.log('AXIOS_RESPONSE.status:', AXIOS_RESPONSE.status);
                let AXIOS_RESP
                try {
                    AXIOS_RESP = AXIOS_RESPONSE.data;
                    if (('auth_token' in AXIOS_RESP) == true) {
                        process.env.LIQUIDM_AUTH_TOKEN = AXIOS_RESP
                        res.send(AXIOS_RESP);
                    } else {
                        console.log('Credentials-invalid');
                        res.status(404).json({ error: 'credentials-invalid' });
                    };
                } catch (error) {
                    console.log('Cannot get new Token');
                    res.status(404).json({ error: 'credentials-invalid' });
                }
            });;
        } catch (error) {
            console.log(error);
        };
    };
    getAuth(URL_AUTH);
});
    
// GET VISUAL REPORTS
router.get('/reports/:visualReports', (req, res, next) => next());
// API VISUAL REPORTS
router.get('/reports/:visualReports', (req,res) => {
    const REQ_PARAMS_REPORT = req.params.visualReports;
    const BASE_URL_REPORT = 'https://platform.liquidm.com/visual_reports.json?auth_token=' + AUTH_TOKEN_LIQUIDM + '&' + REQ_PARAMS_REPORT;
    const getReport = async () => {
        await axios.get(BASE_URL_REPORT)
        .then(AXIOS_RESPONSE => res.send(AXIOS_RESPONSE.data))
        .catch(error => res.status(400).json(error))
    };
    getReport();
});
// API VISUAL REPORTS DEFAULT TODAY
router.get('/reports/default/today',(req,res) => {
    const BODY_REPORT_FORM_DATA = {
        'auth_token': AUTH_TOKEN_LIQUIDM,
        'dimensions': 'advertiser_account,campaign,ad',
        'metrics': 'bids,ais,clicks,video_firstquartile,video_midpoint,video_thirdquartile,video_complete,earnings,earnings_with_margin',
        'granularity': 'all',
        'currency': 'USD',
        'time_zone': 'Bogota',
        'name': null,
        'date_range': 'Today'
    };
    const REQ_PARAMS_REPORT = 'dimensions=advertiser_customer%2Ccampaign%2Cad&metrics=bids%2Cais%2Cclicks%2Cvideo_firstquartile%2Cvideo_midpoint%2Cvideo_thirdquartile%2Cvideo_complete%2Cearnings%2Cearnings_with_margin&granularity=all&currency=USD&time_zone=Bogota&name=&date_range=Today';
    const BASE_URL_REPORT = 'https://platform.liquidm.com/visual_reports.json?auth_token=' + AUTH_TOKEN_LIQUIDM + '&' + REQ_PARAMS_REPORT;
    const getReport = async () => {
        await axios.get(BASE_URL_REPORT)
        .then(AXIOS_RESPONSE => res.send(AXIOS_RESPONSE.data))
        .catch(error => res.status(400).json(error))
    };
    getReport();
});

// GET CAMPAIGN BULK
router.get('/campaigns/:campaignID', (req, res, next) => next());
//API GET CAMPAIGN BULK
router.get('/campaigns/:campaignID', (req,res) => {
    const METHOD_CAMPAIGN = 'GET';
    const BASE_URL_CAMPAIGN = 'https://platform.liquidm.com/api/v1/campaigns';
    const CAMPAIGN_ID = req.params.campaignID;
    let CAMPAIGN_IDS = CAMPAIGN_ID.split(",");
    const HEADERS_CAMPAIGN = { 'cache-control': 'no-cache', authorization: AUTH_TOKEN_LIQUIDM };
    let PARAMS_CAMPAIGNS = [];
    CAMPAIGN_IDS.forEach( (value,i) => {
        PARAMS_CAMPAIGNS.push({ embed: 'ads(embed(targeting,setting,supply))', id: value });
    });

    let campaigns = { "campaigns": [] };
    let promises = [];
    for (let i = 0; i < PARAMS_CAMPAIGNS.length; i++) {
        const newPromise = axios({
            method: METHOD_CAMPAIGN,
            url: BASE_URL_CAMPAIGN,
            params: PARAMS_CAMPAIGNS[i],
            headers: HEADERS_CAMPAIGN
        });
        promises.push(newPromise);
    }
    axios
    .all(promises)
    .then(axios.spread( (...responses) => {
        responses.forEach( AXIOS_RESPONSE => {
            ((((AXIOS_RESPONSE || {}).data || {}).campaigns[0] || {}).id) ? 
                campaigns.campaigns.push(AXIOS_RESPONSE.data.campaigns[0]) : null;
        })
    }))
    .then(() => res.send(campaigns))
    .catch(error => res.status(400).json(error))
});

// PUT EDIT CAMPAIGN
router.patch('/campaigns/edit/:campaignID/budget/:budgetID', (req, res, next) => {
    next();
});
// API PUT EDIT CAMPAIGN
router.put('/campaigns/edit/:budgetID',function(req,res){
    const BUDGET_ID = req.params.budgetID;
    let BUDGET_IDS = BUDGET_ID.split(",");
    let BASE_URL_CONFIG_BULK = [];
    BUDGET_IDS.forEach( (value,i) => {
        BASE_URL_CONFIG_BULK.push('https://platform.liquidm.com/api/v1/budgets/' + value);
    });
    const HEADERS_CONFIG = { 'Accept': 'application/json, text/javascript, */*; q=0.01', 
        'cache-control': 'no-cache', 
        'Content-Type': 'application/json; charset=UTF-8', 
        authorization: AUTH_TOKEN_LIQUIDM };
    const REQUEST_BODY = req.body;
    let CAMPAIGN_IDS= [];
    let CONFIG_CONFIG = [];
    REQUEST_BODY.forEach( (value,i) => {
        CONFIG_CONFIG.push({
            headers: REQUEST_BODY[i]
        });
        CAMPAIGN_IDS.push(REQUEST_BODY[i].budget.campaign_id);
    });

    let campaigns = { "campaigns": [] };
    let promises = [];
    for (let i = 0; i < BUDGET_IDS.length; i++) {
        const newPromise = axios.put(BASE_URL_CONFIG_BULK[i],REQUEST_BODY[i],{headers: HEADERS_CONFIG});
        promises.push(newPromise);
    }
    axios
    .all(promises)
    .then(axios.spread( (...responses) => {
        responses.forEach( (AXIOS_RESPONSE,i) => {
            //console.log('AXIOS_RESPONSE: ', AXIOS_RESPONSE);
            console.log('AXIOS_RESPONSE: ');
            (AXIOS_RESPONSE) ? 
                (campaigns.campaigns.push({campaign_id: CAMPAIGN_IDS[i], budget: AXIOS_RESPONSE.data.budget})) : null;
        })
    }))
    .then(() => res.send(campaigns))
    .catch(error => res.status(400).json(error))
});

module.exports = router;