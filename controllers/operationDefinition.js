const express = require('express');
const router = express.Router();
const checkJwt = require('../authHelper').checkJwt;
const request = require('request').defaults({ json: true });
const _ = require('underscore');
const fhirHelper = require('../fhirHelper');
const log4js = require('log4js');
const log = log4js.getLogger();

const thisResourceType = 'OperationDefinition';

router.get('/', checkJwt, (req, res) => {
    const queryParams = { _summary: true, _count: 10 };

    if (req.query.name) {
        queryParams['name:contains'] = req.query.name;
    }

    if (req.query.page && parseInt(req.query.page) != 1) {
        queryParams._getpagesoffset = (parseInt(req.query.page) - 1) * 10;
    }

    const options = {
        url: req.getFhirServerUrl(thisResourceType, null, null, queryParams),
        json: true,
        headers: {
            'Cache-Control': 'no-cache'
        }
    };

    request(options, (error, results, body) => {
        if (error) {
            log.error('Error retrieving audit events from FHIR server: ' + error);
            return res.status(500).send('Error retrieving audit events from FHIR server');
        }

        res.send(body);
    });
});

router.post('/', checkJwt, (req, res) => {
   const createUrl = req.getFhirServerUrl(thisResourceType);

   const options = {
       url: createUrl,
       method: 'POST',
       json: true,
       body: req.body
   };

   request(options, (err, results, createBody) => {
       if (err) {
           log.error('Error from FHIR server while creating operation definition: ' + err);
           return res.status(500).send('Error from FHIR server while creating operation definition');
       }

       const location = results.headers.location || results.headers['content-location'];

       if (location) {
           request(location, (err, results, retrieveBody) => {
               if (err) {
                   log.error('Error from FHIR server while retrieving newly created operation definition: ' + err);
                   return res.status(500).send('Error from FHIR server while retrieving newly created operation definition');
               }

               res.send(retrieveBody);
           })
       } else {
           res.status(500).send('FHIR server did not respond with a location to the newly created operation definition');
       }
   });
});


router.put('/:id', checkJwt, (req, res) => {
    const url = req.getFhirServerUrl(thisResourceType, req.params.id);

    const options = {
        url: url,
        method: 'PUT',
        json: true,
        body: req.body
    };

    request(options, (err, results, updateBody) => {
        if (err) {
            log.error('Error from FHIR server while updating operation definition: ' + err);
            return res.status(500).send('Error from FHIR server while updating operation definition');
        }

        const location = results.headers.location || results.headers['content-location'];

        if (location) {
            request(location, (err, results, retrieveBody) => {
                if (err) {
                    log.error('Error from FHIR server while retrieving recently updated operation definition: ' + err);
                    return res.status(500).send('Error from FHIR server while retrieving recently updated operation definition');
                }

                res.send(retrieveBody);
            })
        } else {
            res.status(500).send('FHIR server did not respond with a location to the recently updated operation definition');
        }
    });
});

router.get('/:id', checkJwt, (req, res) => {
    const url = req.getFhirServerUrl(thisResourceType, req.params.id);

    const options = {
        url: url,
        method: 'GET'
    };

    request(options, (err, results, body) => {
        if (err) {
            log.error('Error from FHIR server while retrieving operation definition: ' + err);
            return res.status(500).send('Error from FHIR server while retrieving operation definition');
        }

        res.send(body);
    });
});

router.delete('/:id', checkJwt, (req, res) => {
    const url = req.getFhirServerUrl(thisResourceType, req.params.id);

    const options = {
        url: url,
        method: 'DELETE'
    };

    request(options, (err, results, body) => {
        if (err) {
            log.error('Error from FHIR server while deleting operation definition: ' + err);
            return res.status(500).send('Error from FHIR server while deleting operation definition');
        }

        res.status(204).send();
    });
});

module.exports = router;