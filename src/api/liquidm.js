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
router.get('/reports/:visualReports', (req, res, next) => {
    next();
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

// GET CAMPAIGN COMPLETE
router.get('/campaign/complete/:campaignID', (req, res, next) => {
    next();
});
//API GET CAMPAIGN COMPLETE
router.get('/campaign/complete/:campaignID', (req,res) => {
    const METHOD_CAMPAIGN = 'GET';
    const BASE_URL_CAMPAIGN = 'https://platform.liquidm.com/api/v1/campaigns';
    const CAMPAIGN_ID = req.params.campaignID;
    const HEADERS_CAMPAIGN = { 'cache-control': 'no-cache', authorization: AUTH_TOKEN_LIQUIDM };
    const PARAMS_CAMPAIGN = { embed: 'ads(embed(targeting,setting,supply))', id: CAMPAIGN_ID };
    const getCampaign = async () => {
        await axios({
            method: METHOD_CAMPAIGN,
            url: BASE_URL_CAMPAIGN,
            params: PARAMS_CAMPAIGN,
            headers: HEADERS_CAMPAIGN
        })
        .then(AXIOS_RESPONSE => res.send(AXIOS_RESPONSE.data))
        .catch(error => res.status(400).json(error))
    };
    getCampaign();
});

// GET CAMPAIGN BULK
router.get('/campaign/bulk/:campaignID', (req, res, next) => {
    next();
});
//API GET CAMPAIGN BULK
router.get('/campaign/bulk/:campaignID', (req,res) => {
    const METHOD_CAMPAIGN = 'GET';
    const BASE_URL_CAMPAIGN = 'https://platform.liquidm.com/api/v1/campaigns';
    const CAMPAIGN_ID = req.params.campaignID;
    let CAMPAIGN_IDS = CAMPAIGN_ID.split("&");
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
            console.log(`AXIOS_RESPONSE: ${AXIOS_RESPONSE}`);
            const boolData = (((AXIOS_RESPONSE || {}).data || {}).campaigns[0] || {}).id ? true : false;
            console.log(`boolData: ${boolData}`);
            const boolCampaigns = (campaigns || {}).campaigns[0] ? true : false;
            console.log(`boolCampaigns: ${boolCampaigns}`);
            const withTernary = ({
                conditionA, conditionB
            }) => (
                (!conditionA)
                    ? campaigns.campaigns.push(AXIOS_RESPONSE.data.campaigns[0])
                    : (conditionB)
                    ? console.log("both true")
                    : console.log("hola")
            );
            withTernary(boolData, boolCampaigns);
        })
    }))
    .then(() => res.send(campaigns))
    .catch(error => res.status(400).json(error))
});

// GET CAMPAIGN
router.get('/campaign/:campaignID', (req, res, next) => {
    next();
});
//API GET CAMPAIGN
router.get('/campaign/:campaignID', (req,res) => {
    var METHOD_CAMPAIGN = 'GET';
    var BASE_URL_CAMPAIGN = 'https://platform.liquidm.com/api/v1/campaigns';
    var CAMPAIGN_ID = req.params.campaignID;
    var HEADERS_CAMPAIGN = { 'cache-control': 'no-cache', authorization: AUTH_TOKEN_LIQUIDM };
    var PARAMS_CAMPAIGN = { embed: 'ads(embed(targeting,setting,supply))', id: CAMPAIGN_ID };
    const getCampaign = async () => {
        await axios({
            method: METHOD_CAMPAIGN,
            url: BASE_URL_CAMPAIGN,
            params: PARAMS_CAMPAIGN,
            headers: HEADERS_CAMPAIGN
        })
        .then(AXIOS_RESPONSE => {
            let resp
            try {
                resp = AXIOS_RESPONSE.data;
                if (('campaigns' in resp) == true) {
                    if (('id' in resp.campaigns[0]) == true) {
                        if (resp.campaigns[0].id.toString() === CAMPAIGN_ID) {
                            var CAMPAIGNS_ROOT = resp.campaigns[0];
                            var CAMPAIGN_NAME = CAMPAIGNS_ROOT.name;
                            var ACCOUNT_ID = CAMPAIGNS_ROOT.account_id;
                            var CAMPAIGN_UNIT_TYPE = CAMPAIGNS_ROOT.unit_type;
                            var CAMPAIGN_CURRENCY = CAMPAIGNS_ROOT.currency;
                            var CAMPAIGN_TIMEZONE = CAMPAIGNS_ROOT.timezone;
                            var CAMPAIGN_ADS = CAMPAIGNS_ROOT.ads;
                            var CAMPAIGN_ADS_VALUES = {};
                            var CAMPAIGN_ADS_INFO = {};
                            Object.keys(CAMPAIGN_ADS).forEach(function (adsKey) {
                                if(!!CAMPAIGN_ADS[adsKey]['campaign_id']) {
                                    if(CAMPAIGN_ADS[adsKey]['campaign_id'].toString() === CAMPAIGN_ID) {
                                        CAMPAIGN_ADS_INFO[CAMPAIGN_ADS[adsKey]['id'].toString()] = {
                                            campaign_id: CAMPAIGN_ADS[adsKey]['campaign_id'],
                                            ad_id: CAMPAIGN_ADS[adsKey]['id'],
                                            creative_id: CAMPAIGN_ADS[adsKey]['creative_id'],
                                            targeting_id: CAMPAIGN_ADS[adsKey]['targeting']['id'],
                                            setting_id: CAMPAIGN_ADS[adsKey]['setting']['id'],
                                            supply_id: CAMPAIGN_ADS[adsKey]['supply']['id'],
                                            targeting: CAMPAIGN_ADS[adsKey]['targeting'],
                                            setting: CAMPAIGN_ADS[adsKey]['setting'],
                                            supply: CAMPAIGN_ADS[adsKey]['supply']
                                        };
                                        CAMPAIGN_ADS_VALUES[adsKey] = CAMPAIGN_ADS[adsKey]['name'].toString();
                                        CAMPAIGN_ADS_VALUES = JSON.parse(
                                            JSON.stringify(CAMPAIGN_ADS_VALUES)
                                                .split('\"' + adsKey +'\":')
                                                .join('\"' + CAMPAIGN_ADS[adsKey]['id'].toString() + '\":')
                                        );      
                                    };            
                                };
                            });
                            var dataJSON = {
                                account_id: ACCOUNT_ID,
                                campaignID: CAMPAIGN_ID,
                                name: CAMPAIGN_NAME,
                                unit_type: CAMPAIGN_UNIT_TYPE,
                                currency: CAMPAIGN_CURRENCY,
                                timezone: CAMPAIGN_TIMEZONE,
                                summary: CAMPAIGN_ADS_VALUES,
                                ads: CAMPAIGN_ADS_INFO
                            };AXIOS_RESPONSE.data = dataJSON;
                            res.send(dataJSON);
                        } else {
                        console.log('CAMPAIGN_ID does not match');
                        res.status(404).json({ error: 'CAMPAIGN_ID does not match' });                        
                        };
                    } else {
                        console.log('CAMPAIGN_ID not found');
                        res.status(404).json({ error: 'CAMPAIGN_ID' + CAMPAIGN_ID + ' not found' });
                    };
                } else {
                    console.log('CAMPAIGN_ID not found');
                    res.status(404).json({ error: 'CAMPAIGN_ID' + CAMPAIGN_ID + ' not found' });
                };
            } catch (error) {
                console.log('CAMPAIGN_ID not found');
                res.status(404).json({ error: 'CAMPAIGN_ID' + CAMPAIGN_ID + ' not found' });
            }
        })
        .catch(error => res.status(400).json(error))
    };
    getCampaign();
});

module.exports = router;