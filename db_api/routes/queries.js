// diseaseQuery = { "reports.diseases": req.query.disease };

function LocationQuery(data) {
    return {
        $or: [
            {
                "reports.locations.Country": data,
            },
            {
                "reports.locations.City": data,
            },
        ],
    };
}

function DateQuery(Query, req) {
    if (req.query.startDate && req.query.endDate) {
        Query.date_of_publication = {
            $gte: new Date(new Date(req.query.startDate).setHours(00, 00, 00)),
            $lt: new Date(new Date(req.query.endDate).setHours(23, 59, 59)),
        };
    }
}

function datesProvided(startDate, endDate, res) {
    if (
        (startDate && !endDate) ||
        (!startDate && endDate) ||
        (startDate == "" && endDate == "")
    ) {
        return 1;
    }

    if (startDate > endDate) {
        return 2;
    }
}

module.exports = { LocationQuery, datesProvided, DateQuery };