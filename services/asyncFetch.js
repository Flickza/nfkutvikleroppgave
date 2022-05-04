import fetch from 'node-fetch';


//fetch all data from api for list
async function asyncFetch(orgliste) {
    let batch = [];
    var requests = 0;
    console.time("time");
    for (let orgnr of orgliste) {
        requests = 0;
        var data = fetch(`https://data.brreg.no/enhetsregisteret/api/enheter/${orgnr}`)
            .then(async res => {
                if (res.ok) return res.json();
                // check for error response
                if (!res.ok) {
                    // get error message from body or default to response status
                    const error = res.status;
                    return Promise.resolve({});
                }
            })
            .then(res => {
                requests++;
                console.log("getting data...", requests);
                return Promise.resolve(res);
            })
            .catch(error => {
                requests++;
                console.error('There was an error!', requests);
            });
        batch.push(data);
    }
    console.timeEnd("time");
    let batchResults = await Promise.all(batch);

    let undefinedResult = batchResults.filter(element => element == undefined);
    let result = batchResults.filter(element => element != undefined);
    console.log("undefinedResult", undefinedResult.length);
    console.log("result", result.length);
    return result;
}

export { asyncFetch };