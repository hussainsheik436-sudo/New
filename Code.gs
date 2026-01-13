/**
 * Bangaru Kutumbam Tracking System
 * Google Apps Script Backend
 */

// Spreadsheet configuration
const SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || 'YOUR_SPREADSHEET_ID_HERE';
const SHEET_NAME = 'BangaruKutumbamData';

// Headers for the data
const HEADERS = [
  'DistrictName',
  'MandalName', 
  'SecretariatID',
  'SecretraiatName',
  'EmployeeID',
  'EmployeeName',
  'ClusterID',
  'Total Bangaru Kutumbam',
  'No. of Bangaru Kutumbam adopted',
  'No. of Margadarsi Mobilized',
  'BKs verified by GSWS',
  'Margadarsis contacted by GSWS',
  'No. of BKs new Needs captured',
  'No. of Margadarsis agreed to address the BK needs (Engagement)',
  'No. of BK needs closed',
  'No. of Delinking requests raised'
];

/**
 * doGet function - Entry point for web app
 */
function doGet(e) {
  // Check if setup is needed
  if (!SPREADSHEET_ID || SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID_HERE') {
    initializeSpreadsheet();
  }
  
  // Always show the main page (login will be handled in the HTML)
  return HtmlService.createTemplateFromFile('Index').evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Get unique values for filters
 */
function getFilterOptions() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      // Create sheet if it doesn't exist
      const newSheet = ss.insertSheet(SHEET_NAME);
      newSheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
      return {
        mandalNames: [],
        secretraiatNames: [],
        employeeIds: [],
        employeeNames: [],
        clusterIds: []
      };
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      // Return empty options if no data
      return {
        mandalNames: [],
        secretraiatNames: [],
        employeeIds: [],
        employeeNames: [],
        clusterIds: []
      };
    }
    
    const data = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
    
    const mandalNames = [...new Set(data.map(row => row[1]))].filter(val => val !== '');
    const secretraiatNames = [...new Set(data.map(row => row[3]))].filter(val => val !== '');
    const employeeIds = [...new Set(data.map(row => row[4]))].filter(val => val !== '');
    const employeeNames = [...new Set(data.map(row => row[5]))].filter(val => val !== '');
    const clusterIds = [...new Set(data.map(row => row[6]))].filter(val => val !== '');
    
    return {
      mandalNames: mandalNames,
      secretraiatNames: secretraiatNames,
      employeeIds: employeeIds,
      employeeNames: employeeNames,
      clusterIds: clusterIds
    };
  } catch (error) {
    console.error('Error getting filter options:', error);
    return {
      mandalNames: [],
      secretraiatNames: [],
      employeeIds: [],
      employeeNames: [],
      clusterIds: []
    };
  }
}

/**
 * Get data with filters
 */
function getData(filters = {}, page = 1, pageSize = 10) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return { data: [], totalRows: 0 };
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { data: [], totalRows: 0 };
    }
    
    const allData = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
    
    // Apply filters
    let filteredData = allData.filter(row => {
      // Skip empty rows
      if (row.every(cell => cell === '')) return false;
      
      // Apply each filter if present
      if (filters.mandalName && row[1] !== filters.mandalName) return false;
      if (filters.secretraiatName && row[3] !== filters.secretraiatName) return false;
      if (filters.employeeId && row[4] !== filters.employeeId) return false;
      if (filters.employeeName && row[5] !== filters.employeeName) return false;
      if (filters.clusterId && row[6] !== filters.clusterId) return false;
      
      return true;
    });
    
    // Calculate pagination
    const totalRows = filteredData.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);
    
    return {
      data: paginatedData,
      totalRows: totalRows,
      totalPages: Math.ceil(totalRows / pageSize),
      currentPage: page
    };
  } catch (error) {
    console.error('Error getting data:', error);
    return { data: [], totalRows: 0 };
  }
}

/**
 * Save new data entry
 */
function saveDataEntry(entryData) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      // Create sheet if it doesn't exist
      const newSheet = ss.insertSheet(SHEET_NAME);
      newSheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
      sheet = newSheet;
    }
    
    // Add header if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    }
    
    // Prepare row data in correct order
    const rowData = [
      entryData.districtName || '',
      entryData.mandalName || '',
      entryData.secretariatID || '',
      entryData.secretraiatName || '',
      entryData.employeeID || '',
      entryData.employeeName || '',
      entryData.clusterID || '',
      entryData.totalBangaruKutumbam || 0,
      entryData.noOfBangaruKutumbamAdopted || 0,
      entryData.noOfMargadarsiMobilized || 0,
      entryData.bksVerifiedByGSWS || 0,
      entryData.margadarsisContactedByGSWS || 0,
      entryData.noOfBksNewNeedsCaptured || 0,
      entryData.noOfMargadarsisAgreedToAddressBkNeeds || 0,
      entryData.noOfBkNeedsClosed || 0,
      entryData.noOfDelinkingRequestsRaised || 0
    ];
    
    // Append new row
    const nextRow = sheet.getLastRow() + 1;
    sheet.getRange(nextRow, 1, 1, HEADERS.length).setValues([rowData]);
    
    return { success: true, message: 'Data saved successfully' };
  } catch (error) {
    console.error('Error saving data:', error);
    return { success: false, message: 'Error saving data: ' + error.message };
  }
}

/**
 * Update existing data entry
 */
function updateDataEntry(rowNumber, entryData) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return { success: false, message: 'Sheet not found' };
    }
    
    // Prepare row data in correct order
    const rowData = [
      entryData.districtName || '',
      entryData.mandalName || '',
      entryData.secretariatID || '',
      entryData.secretraiatName || '',
      entryData.employeeID || '',
      entryData.employeeName || '',
      entryData.clusterID || '',
      entryData.totalBangaruKutumbam || 0,
      entryData.noOfBangaruKutumbamAdopted || 0,
      entryData.noOfMargadarsiMobilized || 0,
      entryData.bksVerifiedByGSWS || 0,
      entryData.margadarsisContactedByGSWS || 0,
      entryData.noOfBksNewNeedsCaptured || 0,
      entryData.noOfMargadarsisAgreedToAddressBkNeeds || 0,
      entryData.noOfBkNeedsClosed || 0,
      entryData.noOfDelinkingRequestsRaised || 0
    ];
    
    // Update the specific row
    sheet.getRange(rowNumber, 1, 1, HEADERS.length).setValues([rowData]);
    
    return { success: true, message: 'Data updated successfully' };
  } catch (error) {
    console.error('Error updating data:', error);
    return { success: false, message: 'Error updating data: ' + error.message };
  }
}

/**
 * Delete data entry
 */
function deleteDataEntry(rowNumber) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet || rowNumber <= 1) {
      return { success: false, message: 'Invalid row number or sheet not found' };
    }
    
    // Delete the specific row
    sheet.deleteRow(rowNumber);
    
    return { success: true, message: 'Data deleted successfully' };
  } catch (error) {
    console.error('Error deleting data:', error);
    return { success: false, message: 'Error deleting data: ' + error.message };
  }
}

/**
 * Initialize spreadsheet with sample data
 */
function initializeSpreadsheet() {
  try {
    // Create or get the spreadsheet
    let ss;
    
    // Check if we already have a spreadsheet ID stored
    let spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
    
    if (spreadsheetId && spreadsheetId !== 'YOUR_SPREADSHEET_ID_HERE') {
      ss = SpreadsheetApp.openById(spreadsheetId);
    } else {
      ss = SpreadsheetApp.create('BangaruKutumbamTrackingSystem');
      PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());
      
      // Create main data sheet
      const mainSheet = ss.insertSheet(SHEET_NAME);
      mainSheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
      
      // Add sample data
      const sampleData = [
        ['Hyderabad', 'Secunderabad', 'SEC001', 'Jubilee Hills Secretariat', 'EMP001', 'Rajesh Kumar', 'CL001', 150, 140, 120, 100, 90, 75, 65, 50, 10],
        ['Hyderabad', 'Charminar', 'SEC002', 'Charminar Secretariat', 'EMP002', 'Suresh Reddy', 'CL002', 200, 180, 150, 140, 130, 100, 85, 70, 15],
        ['Ranga Reddy', 'LB Nagar', 'SEC003', 'LB Nagar Secretariat', 'EMP003', 'Anil Sharma', 'CL003', 180, 160, 140, 120, 110, 90, 80, 65, 12],
        ['Medchal', 'Kompally', 'SEC004', 'Kompally Secretariat', 'EMP004', 'Vijay Singh', 'CL004', 120, 100, 85, 75, 70, 60, 50, 40, 8],
        ['Sangareddy', 'Miyapur', 'SEC005', 'Miyapur Secretariat', 'EMP005', 'Ramesh Rao', 'CL005', 160, 145, 130, 110, 100, 80, 70, 55, 14]
      ];
      
      if (sampleData.length > 0) {
        mainSheet.getRange(2, 1, sampleData.length, HEADERS.length).setValues(sampleData);
      }
    }
    
    console.log('Spreadsheet initialized successfully. ID:', ss.getId());
    return ss.getId();
  } catch (error) {
    console.error('Error initializing spreadsheet:', error);
    throw error;
  }
}

/**
 * Function to get the current spreadsheet ID for reference
 */
function getSpreadsheetId() {
  return SPREADSHEET_ID;
}