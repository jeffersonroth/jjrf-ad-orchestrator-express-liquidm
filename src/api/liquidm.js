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
      {'Auth': '/auth/email/:email/password/:password'}, 
      {'Reports': [
        {'Reports': 'GET /reports/:visualReports'},
        {'ReportsDefaultToday': 'GET /reports/default/today'}
      ]}, 
      {'Campaigns': [
        {'Campaigns': 'GET /campaigns/:campaignID'},
        {'Edit': 'PUT /campaigns/:campaignID'},
        {'Budgets': 'PUT /campaigns/edit/:budgetID'}
      ]},
      {'Ads': [
        {'Ads': 'POST /ads'}
      ]}
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
router.param('email', (req,res, next, email) => { next(); });
// PARAM password
router.param('password', (req,res, next, password) => { next(); });
// PARAM visualReports
router.param('visualReports', (req,res, next, visualReports) => { next(); });
// PARAM campaignID
router.param('campaignID', (req,res, next, campaignID) => { next(); });
// PARAM budgetID
router.param('budgetID', (req,res, next, budgetID) => { next(); });
// PARAM campaignName
router.param('campaignName', (req,res, next, campaignName) => { next(); });
// PARAM adID
router.param('adID', (req,res, next, adID) => { next(); });
// PARAM targetingID
router.param('targetingID', (req,res, next, targetingID) => { next(); });
// PARAM creativeID
router.param('creativeID', (req,res, next, creativeID) => { next(); });
// PARAM settingsID
router.param('settingsID', (req,res, next, settingsID) => { next(); });
// PARAM uploadFile
router.param('uploadFile', (req,res, next, uploadFile) => { next(); });

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
            .then((AXIOS_RESPONSE) => {
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

/**
 * @api {get} /reports/:visualReports Request Visual Report
 * @apiName GetReports
 * @apiGroup Reports
 *
 * @apiParam {visualReports} Report query.
 *
 * @apiSuccess {String} responseQuery Response of the Query.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       //responseQuery
 *     }
 *
 * @apiError BadRequest It was not possible to request the given query.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Bad Request"
 *     }
 */
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

// PUT EDIT CAMPAIGNS BULK
router.put('/campaigns/:campaignID', (req, res, next) => next());
// API PUT EDIT CAMPAIGNS BULK
router.put('/campaigns/:campaignID', (req,res) => {
    const CAMPAIGN_ID = req.params.campaignID;
    let CAMPAIGN_IDS = CAMPAIGN_ID.split(",");
    let BASE_URL_CONFIG_BULK = [];
    CAMPAIGN_IDS.forEach( (value,i) => {
        BASE_URL_CONFIG_BULK.push('https://platform.liquidm.com/api/v1/campaigns/' + value + '?embed=salesforce_opportunities');
    });
    const HEADERS_CONFIG = { 'Accept': 'application/json, text/javascript, */*; q=0.01', 
        'cache-control': 'no-cache', 
        'Content-Type': 'application/json; charset=UTF-8', 
        authorization: AUTH_TOKEN_LIQUIDM };
    const REQUEST_BODY = req.body;
    let CONFIG_CONFIG = [];
    REQUEST_BODY.forEach( (value,i) => {
        CONFIG_CONFIG.push({
            headers: REQUEST_BODY[i]
        });
    });

    let campaigns = { "campaigns": [] };
    let promises = [];
    for (let i = 0; i < CAMPAIGN_IDS.length; i++) {
        const newPromise = axios.put(BASE_URL_CONFIG_BULK[i],REQUEST_BODY[i],{headers: HEADERS_CONFIG});
        promises.push(newPromise);
    }
    axios
    .all(promises)
    .then(axios.spread( (...responses) => {
        responses.forEach( (AXIOS_RESPONSE,i) => {
            (AXIOS_RESPONSE) ? 
                (campaigns.campaigns.push(AXIOS_RESPONSE.data)) : null;
        })
    }))
    .then(() => res.send(campaigns))
    .catch(error => res.status(400).json(error))
});

// PUT EDIT CAMPAIGN BUDGETS
router.put('/campaigns/budgets/:budgetID', (req, res, next) => next());
// API PUT EDIT CAMPAIGN BUDGETS
router.put('/campaigns/budgets/:budgetID', (req,res) => {
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
            (AXIOS_RESPONSE) ? 
                (campaigns.campaigns.push({campaign_id: CAMPAIGN_IDS[i], budget: AXIOS_RESPONSE.data.budget})) : null;
        })
    }))
    .then(() => res.send(campaigns))
    .catch(error => res.status(400).json(error))
});

// POST ADS BULK
//router.post('/ads/campaignID/:campaignID/campaignName/:campaignName', (req, res, next) => next());
// API POST ADS BULK
router.post('/ads',(req,res) => {
    const BASE_URL_ADS = 'https://platform.liquidm.com/api/v1/ads';
    const HEADERS_CONFIG = { 'Accept': 'application/json, text/javascript, */*; q=0.01', 
        'cache-control': 'no-cache', 
        'Content-Type': 'application/json; charset=UTF-8', 
        authorization: AUTH_TOKEN_LIQUIDM };
    const REQUEST_BODY = req.body;
    let CONFIG_CONFIG = [];
    REQUEST_BODY.forEach( (value,i) => {
        CONFIG_CONFIG.push({
            headers: REQUEST_BODY[i]
        });
    });

    let ads = { ads: [] };
    let promises = [];
    for (let i = 0; i < REQUEST_BODY.length; i++) {
        const newPromise = axios.post(BASE_URL_ADS,REQUEST_BODY[i],{headers: HEADERS_CONFIG});
        promises.push(newPromise);
    }
    axios
    .all(promises)
    .then(axios.spread( (...responses) => {
        responses.forEach( AXIOS_RESPONSE => {
            (AXIOS_RESPONSE) ? 
                (ads.ads.push(AXIOS_RESPONSE.data.ad)) : null;
        })
    }))
    .then(() => res.send(ads))
    .catch(error => res.status(400).json(error))
});

// POST TARGETING BULK
// API POST TARGETING BULK
router.post('/targeting',(req,res) => {
    const REQUEST_BODY = req.body;

    // POST GEOCODE
    const BASE_URL_GEOCODE = 'https://platform.liquidm.com/api/v1/geo_locations/geocode';
    const HEADERS_GEOCODE = { 'Accept': 'application/json, text/javascript, */*; q=0.01', 
        'cache-control': 'no-cache', 
        'content-type': 'application/json; charset=UTF-8', 
        authorization: AUTH_TOKEN_LIQUIDM };

    // POST MASS CREATE
    const BASE_URL_MASSCREATE = 'https://platform.liquidm.com/api/v1/geo_locations/mass_create';
    let HEADERS_MASSCREATE = { 'Accept': 'application/json, text/javascript, */*; q=0.01', 
        'cache-control': 'no-cache', 
        'content-type': 'application/json; charset=UTF-8', 
        authorization: AUTH_TOKEN_LIQUIDM };

    // PUT TARGETING
    const HEADERS_TARGETING = { 'Accept': 'application/json, text/javascript, */*; q=0.01', 
        'cache-control': 'no-cache', 
        'content-type': 'application/json; charset=UTF-8', 
        authorization: AUTH_TOKEN_LIQUIDM };

    // REQUEST BODY
    let BODY_GEOCODE = [];
    let BODY_MASSCREATE = [];
    let BASE_URL_TARGETING = [];
    let BODY_TARGETING = [];
    REQUEST_BODY.forEach( (value,i) => {
        if ('geo_locations' in REQUEST_BODY[i]) {
            BODY_MASSCREATE.push({ "geo_locations": REQUEST_BODY[i].geo_locations });    // POST MASS CREATE BODY_MASSCREATE
            Object.keys(REQUEST_BODY[i].geo_locations).forEach( (geoKey) => {
                if(!!REQUEST_BODY[i].geo_locations[geoKey]['lat'] && !!REQUEST_BODY[i].geo_locations[geoKey]['lng']) {
                    const COORD_GEOKEY = REQUEST_BODY[i].geo_locations[geoKey]['lat'] + ',' + REQUEST_BODY[i].geo_locations[geoKey]['lng'];
                    // POST GEOCODE BODY_GEOCODE
                    BODY_GEOCODE.push({ "address": [] });
                    BODY_GEOCODE[geoKey].address.push(COORD_GEOKEY);          
                };
            });
        };
        // PUT TARGETING BASE_URL_TARGETING
        ('targeting_id' in REQUEST_BODY[i]) ? BASE_URL_TARGETING.push('https://platform.liquidm.com/api/v1/targetings/' + REQUEST_BODY[i].targeting_id) : null;
        // PUT TARGETING BODY_TARGETING
        let REQUEST_BODY_TARGETING_VAR = {
            min_age,
            max_age,
            gender,
            min_age,
            targeting_type,
            regions,
            country,
            geo_location_ids,
            ad_ids
        } = REQUEST_BODY[i];
        let REQUEST_BODY_TARGETING = [
            min_age || null,
            max_age || null,
            gender || "all",
            min_age || null,
            targeting_type || [],
            regions || [],
            country || [],
            geo_location_ids || [],
            ad_ids || []
        ];
        REQUEST_BODY_TARGETING_VAR = REQUEST_BODY_TARGETING;
        REQUEST_BODY[i].min_age = min_age || null,
        REQUEST_BODY[i].max_age = max_age || null,
        REQUEST_BODY[i].gender = gender || "all",
        REQUEST_BODY[i].min_age = min_age || null,
        REQUEST_BODY[i].targeting_type = targeting_type || [],
        REQUEST_BODY[i].regions = regions || [],
        REQUEST_BODY[i].country = country || [],
        REQUEST_BODY[i].geo_location_ids = geo_location_ids || [],
        REQUEST_BODY[i].ad_ids = ad_ids || []
        BODY_TARGETING.push({
            "targeting": {
                "min_age": REQUEST_BODY[i].min_age,
                "max_age": REQUEST_BODY[i].max_age,
                "gender": REQUEST_BODY[i].gender,
                "targeting_type": REQUEST_BODY[i].targeting_type,
                "geographic_ids": REQUEST_BODY[i].regions,
                "country_ids": REQUEST_BODY[i].country,
                "geo_location_ids": REQUEST_BODY[i].geo_location_ids,
                "ad_ids": REQUEST_BODY[i].ad_ids
            }
        });
    });

    // REQUESTS
    let answer;
    let targetings = { targetings: [] };
    let promises = [];
    for (let i = 0; i < REQUEST_BODY.length; i++) {
        const newPromise = axios.post(BASE_URL_MASSCREATE,BODY_MASSCREATE[i],{headers: HEADERS_MASSCREATE});
        promises.push(newPromise);
    }
    axios
    .all(promises)
    .then(axios.spread( (...responses) => {
        responses.forEach( (AXIOS_RESPONSE_MASSCREATE,i) => {
            targetings.targetings.push({"AXIOS_RESPONSE_MASSCREATE": AXIOS_RESPONSE_MASSCREATE});
            let GEO_LOCATIONS_IDS = [];
            if ('geo_locations' in AXIOS_RESPONSE_MASSCREATE.data) {
                Object.keys(AXIOS_RESPONSE_MASSCREATE.data.geo_locations).forEach( (geoKey) => {
                    if(!!AXIOS_RESPONSE_MASSCREATE.data.geo_locations[geoKey]['id']) {
                        const COORD_GEOKEY = AXIOS_RESPONSE_MASSCREATE.data.geo_locations[geoKey]['id'];
                        GEO_LOCATIONS_IDS.push(COORD_GEOKEY.toString());
                    };
                });
            };
            BODY_TARGETING[i].targeting.geo_location_ids = ('geo_location_ids' in BODY_TARGETING[i].targeting) ? 
                GEO_LOCATIONS_IDS : [];
            return axios.put(BASE_URL_TARGETING[i],BODY_TARGETING[i],{headers: HEADERS_TARGETING})
            .then( AXIOS_RESPONSE_TARGETING => {
                targetings.targetings.push({"AXIOS_RESPONSE_TARGETING": AXIOS_RESPONSE_TARGETING});
            })
        })
    }))
    .then(() => res.send(targeting))
    .catch(error => res.status(400).json(error))
});

module.exports = router;