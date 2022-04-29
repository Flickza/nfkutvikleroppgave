import path from 'path';
import xlsx from 'xlsx';

const convertxlsx = (file_name) => {
    // const filePath = path.resolve(__dirname, "test.xlsx");
    const filePath = path.resolve(process.cwd() + "/orgliste/", file_name)
    const workbook = xlsx.readFile(filePath);
    const sheetNames = workbook.SheetNames;

    // Get the data of "Sheet1"
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetNames[0]])

    /// Do what you need with the received data
    var orgliste = data.map(org => org.ORGNR);
    return orgliste;
}

export default convertxlsx;
