const csv = require('csvtojson');
const path = require('path');


async function importCSVData() {
    // await connectDB();

    const csvFilePath = path.join(__dirname, './Data/laptops.csv'); // update the path as needed

    // Convert CSV to JSON
    const jsonArray = await csv().fromFile(csvFilePath);

    // console.log(jsonArray);

    return jsonArray;
  
}

module.exports = {importCSVData}

