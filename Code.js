/**
 * Main Google Apps Script Code
 */

// Spreadsheet configuration
const SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
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
  // Check if user is logged in
  const isLoggedIn = checkLoginStatus();
  
  if (isLoggedIn) {
    // User is logged in, show main dashboard
    return HtmlService.createTemplateFromFile('Index').evaluate()
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } else {
    // Show login page
    return HtmlService.createTemplateFromFile('Login').evaluate()
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}

/**
 * Check if user is logged in
 */
function checkLoginStatus() {
  const template = HtmlService.createTemplateFromFile('Index');
  const isLoggedIn = template.isLoggedIn || false;
  return isLoggedIn;
}

/**
 * Login function
 */
function login(username, password) {
  try {
    // Get mandal-specific credentials
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const loginSheet = ss.getSheetByName('LoginCredentials') || ss.insertSheet('LoginCredentials');
    
    // Sample login credentials (in real scenario, store hashed passwords)
    const data = loginSheet.getDataRange().getValues();
    
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === username && data[i][1] === password) {
        // Store user session info
        const userSession = {
          username: username,
          mandal: data[i][2], // Mandal associated with user
          role: data[i][3] || 'user'
        };
        
        return { success: true, user: userSession };
      }
    }
    
    return { success: false, message: 'Invalid credentials' };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Error during login: ' + error.message };
  }
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
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
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
 * Initialize spreadsheet with sample data and login credentials
 */
function initializeSpreadsheet() {
  try {
    // Create or get the spreadsheet
    let ss;
    const existingId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
    
    if (existingId) {
      ss = SpreadsheetApp.openById(existingId);
    } else {
      ss = SpreadsheetApp.create('BangaruKutumbamTrackingSystem');
      PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());
    }
    
    // Create main data sheet
    let mainSheet = ss.getSheetByName(SHEET_NAME);
    if (!mainSheet) {
      mainSheet = ss.insertSheet(SHEET_NAME);
      mainSheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    }
    
    // Create login credentials sheet
    let loginSheet = ss.getSheetByName('LoginCredentials');
    if (!loginSheet) {
      loginSheet = ss.insertSheet('LoginCredentials');
      loginSheet.getRange(1, 1, 1, 4).setValues([['Username', 'Password', 'Mandal', 'Role']]);
      
      // Add sample credentials
      loginSheet.getRange(2, 1, 3, 4).setValues([
        ['mandal1', 'password1', 'Mandal1', 'admin'],
        ['mandal2', 'password2', 'Mandal2', 'user'],
        ['mandal3', 'password3', 'Mandal3', 'user']
      ]);
    }
    
    // Add sample data if needed
    if (mainSheet.getLastRow() <= 1) {
      const sampleData = [
        ['District1', 'Mandal1', 'SEC001', 'Secretariat1', 'EMP001', 'John Doe', 'CL001', 50, 45, 30, 25, 20, 15, 10, 8, 5],
        ['District2', 'Mandal2', 'SEC002', 'Secretariat2', 'EMP002', 'Jane Smith', 'CL002', 40, 35, 25, 20, 18, 12, 9, 7, 3],
        ['District3', 'Mandal3', 'SEC003', 'Secretariat3', 'EMP003', 'Bob Johnson', 'CL003', 60, 55, 40, 35, 30, 20, 15, 12, 8]
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