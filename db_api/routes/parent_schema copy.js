const express = require("express");
const router = express.Router();
const DiseaseNode = require("../Schema/disease_node");
const Q = require("./Queries");
var VerifyToken = require('../auth/verify_token');

//TODO: chain verifyToken for all requests

router.get("/", VerifyToken, async (req, res) => {
    try {
        var query = {};

        // Query by location, keep first
        if (req.query.location) {
            query = Q.LocationQuery(req.query.location);
        }

        // Query by disesase
        if (req.query.disease) {
            query["reports.diseases"] = req.query.disease;
        }

        // Ensure request has a start and end time
        Flag = Q.datesProvided(req.query.startDate, req.query.endDate, res);

        if (Flag == 1) {
            return res.status(400).json({
                status: "failure",
                message:
                    "both startDate and endDate must be selected in the query string\n Otherwise omit both.",
            });
        } else if (Flag == 2) {
            return res.status(400).json({
                status: "failure",
                message: "startDate must be less than endDate",
            });
        }

        // Build query to get dates
        Q.DateQuery(query, req);

        // Send query
        // return res.send(query);
        let result;
        let order = req.query.order;
        if (req.query.projection) {
            result = await DiseaseNode.find(query)
                .select(req.query.projection)
                .sort(order);
        } else {
            result = await DiseaseNode.find(query).sort(order);
        }

        // console.log(result)
        // console.log(type(result))

        if (result.length == 0) {
            return res.status(404).json({
                status: "No Content",
                message: "The request has gone through, but no matches were found",
            });
        }
        const timeElapsed = Date.now();
        const today = new Date(timeElapsed);
        res.status(200).json({
            status: "success",
            log: `Served by Team Cracked Pepper, Requested at ${today.toUTCString()}, Data Source: outbreaks.globalincidentmap.com`,
            data: result,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: "failure",
            error: error.message,
        });
    }
});

// Post a disease
router.post("/addEntry", (req, res) => {
    const disease = new DiseaseNode({
        url:
            "https://www.who.int/csr/don/17-january-2020-novel-coronavirus-japan-ex-china/en/",
        date_of_publication: "2020-01-17 11:12:12",
        headline: "ANovel Coronavirus – Japan (ex-China)",
        main_text:
            "On 15 January 2020, the Ministry of Health, Labour and Welfare, Japan (MHLW) reported an imported case of laboratory-confirmed 2019-novel coronavirus (2019-nCoV) from Wuhan, Hubei Province, China. The case-patient is male, between the age of 30-39 years, living in Japan. The case-patient travelled to Wuhan, China in late December and developed fever on 3 January 2020 while staying in Wuhan. He did not visit the Huanan Seafood Wholesale Market or any other live animal markets in Wuhan. He has indicated that he was in close contact with a person with pneumonia. On 6 January, he traveled back to Japan and tested negative for influenza when he visited a local clinic on the same day.",
        reports: [
            {
                locations: [
                    {
                        country: "China",
                        location: "Wuhan, Hubei Province",
                    },
                    {
                        country: "Japan",
                        location: "",
                    },
                ],
                diseases: ["yes"],
            },
        ],
    });

    disease
        .save()
        .then((result) => {
            res.status(200).send(result);
        })
        .catch((err) => {
            console.log(err);
        });
});

module.exports = router;