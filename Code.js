// Retrieve script properties
const scriptProps = PropertiesService.getScriptProperties();
const userID = scriptProps.getProperty('userID');
const token = scriptProps.getProperty('token');

// Connect with Google Sheet
const timeSheetEndpoint = `https://api.harvestapp.com/v2/time_entries?access_token=${token}&account_id=${userID}`;
const spreadSheetID = '1bKdMc0Pby_e76cgW9hT75hoMtQ_ou6Ia44zwNoDyyvc';
const spreadSheetURL = 'https://docs.google.com/spreadsheets/d/1bKdMc0Pby_e76cgW9hT75hoMtQ_ou6Ia44zwNoDyyvc/edit#gid=0'
const outputSheet = 'timeSheetEntries';
const workbook = SpreadsheetApp.openByUrl(spreadSheetURL);
const sheet = workbook.setActiveSheet(workbook.getSheetByName(outputSheet));

// Retreive all timesheet entries from Harvest: 
// https://help.getharvest.com/api-v2/timesheets-api/timesheets/time-entries/

const getTimeSheetEntries = (requestUrl = timeSheetEndpoint, timeSheetEntries = []) => {
  var request = UrlFetchApp.fetch(requestUrl);
  var content = request.getContentText();
  var json = JSON.parse(content);
  timeSheetEntries = [...timeSheetEntries, ...json.time_entries];
  if (json.links.next != null) {
    console.log('Getting more entries...')
    return getTimeSheetEntries(json.links.next, timeSheetEntries)
  }
  return timeSheetEntries;
}

const getExistingSheetData = () => {
    const range = sheet.getRange("A:A");
    const values = range.getValues();
    const existingEntryIds = values.slice(1).flat();
    const text = existingEntryIds[1];
    return existingEntryIds;
}

const writeToSheets = (data) => {
    existingEntryIds = getExistingSheetData();
    for (const entryData in data) {
        const entry = [data[entryData]][0];
        // console.log(entry)
        console.log(existingEntryIds.indexOf(entry.id))
        if (existingEntryIds.indexOf(entry.id) > -1) {
            console.log(`Entry ${entry.id} already exists...`)
        } else {
            sheet.appendRow([entry.id, entry.hours])
        }
    }
}


const updateTimeSheetEntries = async () => {
    let responseData = await getTimeSheetEntries();
    writeToSheets(responseData);
}

updateTimeSheetEntries();