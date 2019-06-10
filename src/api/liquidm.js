const express = require('express');
const router = express.Router();
const axios = require('axios');
const url = require('url');
const cache = require('memory-cache');

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
      ]},
      {'Targeting': [
        {'Targeting': 'POST /targeting'}
      ]}
    ]);
});

// LIQUIDM_AUTH
let AUTH_TOKEN_LIQUIDM = (process.env.LIQUIDM_AUTH_TOKEN) ? 
process.env.LIQUIDM_AUTH_TOKEN : '';
const getAuth = async () => {
    const BASE_URL = 'https://platform.liquidm.com/api/auth';
    const REQ_PARAMS_EMAIL = process.env.LIQUIDM_AUTH_EMAIL;
    const REQ_PARAMS_PASSWORD = process.env.LIQUIDM_AUTH_PASSWORD;
    const HEADERS = { 'cache-control': 'no-cache' };
    const PARAMS = { email: REQ_PARAMS_EMAIL, password: REQ_PARAMS_PASSWORD, api: 'true' };
    const CONFIG = Object.assign({}, {headers: HEADERS}, {params: PARAMS});
    return await axios.get(BASE_URL,CONFIG)
    .then(AXIOS_RESPONSE => {
        AXIOS_RESPONSE.data.auth_token;
        AUTH_TOKEN_LIQUIDM = AXIOS_RESPONSE.data.auth_token;
        cache.put('AUTH_TOKEN_LIQUIDM', AUTH_TOKEN_LIQUIDM);
    })
    .catch(error => error);
};
//console.log(AUTH_TOKEN_LIQUIDM);
cache.put('AUTH_TOKEN_LIQUIDM', AUTH_TOKEN_LIQUIDM);
//console.log("CACHE: ",cache.get('AUTH_TOKEN_LIQUIDM'));

axios.defaults.headers.common['authorization'] = cache.get('AUTH_TOKEN_LIQUIDM');

// PARAM email
router.param('email', (req,res, next, email) => next());
// PARAM password
router.param('password', (req,res, next, password) => next());
// PARAM visualReports
router.param('visualReports', (req,res, next, visualReports) => next());
// PARAM campaignID
router.param('campaignID', (req,res, next, campaignID) => next());
// PARAM budgetID
router.param('budgetID', (req,res, next, budgetID) => next());
// PARAM campaignName
router.param('campaignName', (req,res, next, campaignName) => next());
// PARAM adID
router.param('adID', (req,res, next, adID) => next());
// PARAM targetingID
router.param('targetingID', (req,res, next, targetingID) => next());
// PARAM creativeID
router.param('creativeID', (req,res, next, creativeID) => next());
// PARAM settingsID
router.param('settingsID', (req,res, next, settingsID) => next());
// PARAM uploadFile
router.param('uploadFile', (req,res, next, uploadFile) => next());

// UPDATE AUTH
router.get('/auth/renew', async (req,res) => {
    await getAuth()
    .then(AXIOS_RESPONSE => res.send(AXIOS_RESPONSE))
    .catch(error => res.status(400).json(error));
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
// VISUAL REPORTS
const getReport = async (REQ_PARAMS) => {
    const BASE_URL_REPORT = 'https://platform.liquidm.com/visual_reports.json?auth_token=' + cache.get('AUTH_TOKEN_LIQUIDM') + '&' + REQ_PARAMS;
    return await axios.get(BASE_URL_REPORT)
        .then(AXIOS_RESPONSE => AXIOS_RESPONSE.data)
        .catch(error => error);
};
// GET VISUAL REPORTS
router.get('/reports/:visualReports', (req, res, next) => next());
// API VISUAL REPORTS
router.get('/reports/:visualReports', async (req,res) => {
    const REQ_PARAMS = req.params.visualReports;
    await getReport(REQ_PARAMS)
    .then(AXIOS_RESPONSE => res.send(AXIOS_RESPONSE))
    .catch(error => res.status(400).json(error));
});
// API VISUAL REPORTS DEFAULT TODAY
router.get('/reports/default/today', async (req,res) => {
    const REQ_PARAMS = 'dimensions=advertiser_customer%2Ccampaign%2Cad&metrics=bids%2Cais%2Cclicks%2Cvideo_firstquartile%2Cvideo_midpoint%2Cvideo_thirdquartile%2Cvideo_complete%2Cearnings%2Cearnings_with_margin&granularity=all&currency=USD&time_zone=Bogota&name=&date_range=Today';
    await getReport(REQ_PARAMS)
    .then(AXIOS_RESPONSE => res.send(AXIOS_RESPONSE))
    .catch(error => res.status(400).json(error));
});

// CAMPAIGNS
const getCampaign = async (CAMPAIGN_ID) => {
    const METHOD = 'GET';
    const BASE_URL = 'https://platform.liquidm.com/api/v1/campaigns';
    const PARAMS = { embed: 'ads(embed(targeting,setting,supply))', id: CAMPAIGN_ID };
    const HEADERS = { 'cache-control': 'no-cache', authorization: cache.get('AUTH_TOKEN_LIQUIDM') };
    return await axios({
        method: METHOD,
        url: BASE_URL,
        params: PARAMS,
        headers: HEADERS
    })
    .then(AXIOS_RESPONSE => AXIOS_RESPONSE.data.campaigns)
    .catch(error => error);
};
// GET CAMPAIGN BULK
router.get('/campaigns/:campaignID', (req, res, next) => next());
//API GET CAMPAIGN BULK
router.get('/campaigns/:campaignID', (req,res) => {
    const METHOD = 'GET';
    const BASE_URL = 'https://platform.liquidm.com/api/v1/campaigns';
    const CAMPAIGN_ID = req.params.campaignID;
    let CAMPAIGN_IDS = CAMPAIGN_ID.split(",");
    const HEADERS = { 'cache-control': 'no-cache', authorization: cache.get('AUTH_TOKEN_LIQUIDM') };
    let PARAMS = [];
    CAMPAIGN_IDS.forEach( CAMPAIGN => PARAMS.push({ embed: 'ads(embed(targeting,setting,supply))', id: CAMPAIGN }));
    let RESPONSE_JSON = { "campaigns": [] };
    let promises = [];
    for (let i = 0; i < PARAMS.length; i++) {
        const newPromise = axios({
            method: METHOD,
            url: BASE_URL,
            params: PARAMS[i],
            headers: HEADERS
        });
        promises.push(newPromise);
    }
    axios
    .all(promises)
    .then(axios.spread( (...responses) => {
        responses.forEach( AXIOS_RESPONSE => {
            ((((AXIOS_RESPONSE || {}).data || {}).campaigns[0] || {}).id) ? 
            RESPONSE_JSON.campaigns.push(AXIOS_RESPONSE.data.campaigns[0]) : null;
        })
    }))
    .then(() => res.send(RESPONSE_JSON))
    .catch(error => res.status(400).json(error));
});

// PUT EDIT CAMPAIGNS BULK
router.put('/campaigns/:campaignID', (req, res, next) => next());
// API PUT EDIT CAMPAIGNS BULK
router.put('/campaigns/:campaignID', (req,res) => {
    const CAMPAIGN_ID = req.params.campaignID;
    let CAMPAIGN_IDS = CAMPAIGN_ID.split(",");
    let BASE_URL= [];
    CAMPAIGN_IDS.forEach( CAMPAIGN => BASE_URL.push('https://platform.liquidm.com/api/v1/campaigns/' + CAMPAIGN + '?embed=salesforce_opportunities'));
    const HEADERS = { 'Accept': 'application/json, text/javascript, */*; q=0.01', 
        'cache-control': 'no-cache', 
        'Content-Type': 'application/json; charset=UTF-8', 
        authorization: cache.get('AUTH_TOKEN_LIQUIDM') };
    const REQUEST_BODY = req.body;

    let campaigns = { "campaigns": [] };
    let promises = [];
    for (let i = 0; i < CAMPAIGN_IDS.length; i++) {
        const newPromise = axios.put(BASE_URL[i],REQUEST_BODY[i],{headers: HEADERS});
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
    let BASE_URL = [];
    BUDGET_IDS.forEach( (value,i) => {
        BASE_URL.push('https://platform.liquidm.com/api/v1/budgets/' + value);
    });
    const HEADERS = { 'Accept': 'application/json, text/javascript, */*; q=0.01', 
        'cache-control': 'no-cache', 
        'Content-Type': 'application/json; charset=UTF-8', 
        authorization: cache.get('AUTH_TOKEN_LIQUIDM') };
    const REQUEST_BODY = req.body;
    let CAMPAIGN_IDS= [];
    REQUEST_BODY.forEach( (value,i) => CAMPAIGN_IDS.push(REQUEST_BODY[i].budget.campaign_id));

    let campaigns = { "campaigns": [] };
    let promises = [];
    for (let i = 0; i < BUDGET_IDS.length; i++) {
        const newPromise = axios.put(BASE_URL[i],REQUEST_BODY[i],{headers: HEADERS});
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
    const BASE_URL = 'https://platform.liquidm.com/api/v1/ads';
    const HEADERS = { 'Accept': 'application/json, text/javascript, */*; q=0.01', 
        'cache-control': 'no-cache', 
        'Content-Type': 'application/json; charset=UTF-8', 
        authorization: cache.get('AUTH_TOKEN_LIQUIDM') };
    const REQUEST_BODY = req.body;

    let ads = { ads: [] };
    let promises = [];
    for (let i = 0; i < REQUEST_BODY.length; i++) {
        const newPromise = axios.post(BASE_URL,REQUEST_BODY[i],{headers: HEADERS});
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
        authorization: cache.get('AUTH_TOKEN_LIQUIDM') };

    // POST MASS CREATE
    const BASE_URL_MASSCREATE = 'https://platform.liquidm.com/api/v1/geo_locations/mass_create';
    let HEADERS_MASSCREATE = { 'Accept': 'application/json, text/javascript, */*; q=0.01', 
        'cache-control': 'no-cache', 
        'content-type': 'application/json; charset=UTF-8', 
        authorization: cache.get('AUTH_TOKEN_LIQUIDM') };

    // PUT TARGETING
    const HEADERS_TARGETING = { 'Accept': 'application/json, text/javascript, */*; q=0.01', 
        'cache-control': 'no-cache', 
        'content-type': 'application/json; charset=UTF-8', 
        authorization: cache.get('AUTH_TOKEN_LIQUIDM') };

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

// CREATIVES
// PATCH CREATIVE: SCRIPT-TAGS
//router.patch('/creatives/script-tags/:creativeID', (req, res, next) => next());
// API PATCH CREATIVE: SCRIPT-TAGS
router.patch('/creatives/script-tags', (req,res) => {
    const CREATIVE_IDS = [];
    const REQUEST_BODY = req.body;
    REQUEST_BODY.forEach( (value,i) => CREATIVE_IDS.push(REQUEST_BODY[i].data.id));
    let BASE_URL = [];
    CREATIVE_IDS.forEach( (value,i) => BASE_URL.push('https://platform.liquidm.com/api/v2/script-tags/' + CREATIVE_IDS[i]));
    const HEADERS = { 'Accept': 'application/vnd.api+json', 
        'cache-control': 'no-cache', 
        'Content-Type': 'application/vnd.api+json', 
        authorization: cache.get('AUTH_TOKEN_LIQUIDM') };

    let creatives = { "creatives": [] };
    let promises = [];
    for (let i = 0; i < CREATIVE_IDS.length; i++) {
        const newPromise = axios.patch(BASE_URL[i],REQUEST_BODY[i],{headers: HEADERS});
        promises.push(newPromise);
    }
    axios
    .all(promises)
    .then(axios.spread( (...responses) => {
        responses.forEach( AXIOS_RESPONSE => {
            (AXIOS_RESPONSE) ? 
                (creatives.creatives.push({data: AXIOS_RESPONSE.data})) : null;
        })
    }))
    .then(() => res.send(creatives))
    .catch(error => res.status(400).json(error))
});

module.exports = router;