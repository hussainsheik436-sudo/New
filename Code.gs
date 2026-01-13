/**
 * Bangaru Kutumbam Tracking System
 * Google Apps Script Backend
 */

// Spreadsheet configuration - Using provided public sheet
const SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSpMCNX2udiabhT_dvQY7qwcGupBUCAysVod3tZErMC8JLEy2QCWH_brQGeVGGb6-gh0G6a-YCOadEo/pub?output=csv';
const SPREADSHEET_ID = '2PACX-1vSpMCNX2udiabhT_dvQY7qwcGupBUCAysVod3tZErMC8JLEy2QCWH_brQGeVGGb6-gh0G6a-YCOadEo'; // Extracted from the URL
const SHEET_NAME = 'Sheet1';

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
  // Always show the main page (login will be handled in the HTML)
  return HtmlService.createTemplateFromFile('Index').evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Get data from the external CSV
 */
function getExternalData() {
  try {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv`;
    const response = UrlFetchApp.fetch(csvUrl);
    const csvText = response.getContentText();
    const csvData = Utilities.parseCsv(csvText);
    
    // Remove header row if it exists in the CSV
    const headersInCSV = csvData[0];
    const dataRows = csvData.slice(1); // Skip header row
    
    // Convert to objects with proper headers
    const result = dataRows.map(row => {
      const obj = {};
      HEADERS.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
    
    return result;
  } catch (error) {
    console.error('Error fetching external data:', error);
    return [];
  }
}

/**
 * Get unique values for filters from external data
 */
function getFilterOptions() {
  try {
    const allData = getExternalData();
    
    const mandalNames = [...new Set(allData.map(row => row.MandalName))].filter(val => val !== '');
    const secretraiatNames = [...new Set(allData.map(row => row.SecretraiatName))].filter(val => val !== '');
    const employeeIds = [...new Set(allData.map(row => row.EmployeeID))].filter(val => val !== '');
    const employeeNames = [...new Set(allData.map(row => row.EmployeeName))].filter(val => val !== '');
    const clusterIds = [...new Set(allData.map(row => row.ClusterID))].filter(val => val !== '');
    
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
    let allData = getExternalData();
    
    // Apply filters
    let filteredData = allData.filter(row => {
      // Apply each filter if present
      if (filters.mandalName && row.MandalName !== filters.mandalName) return false;
      if (filters.secretraiatName && row.SecretraiatName !== filters.secretraiatName) return false;
      if (filters.employeeId && row.EmployeeID !== filters.employeeId) return false;
      if (filters.employeeName && row.EmployeeName !== filters.employeeName) return false;
      if (filters.clusterId && row.ClusterID !== filters.clusterId) return false;
      
      return true;
    });
    
    // Calculate pagination
    const totalRows = filteredData.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);
    
    // Convert back to array format for the frontend
    const dataArray = paginatedData.map(row => {
      return HEADERS.map(header => row[header]);
    });
    
    return {
      data: dataArray,
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
  // Since we're using a read-only external sheet, we cannot save data
  return { 
    success: false, 
    message: 'Data saving is disabled for external read-only sheets. Please contact the administrator to update the source spreadsheet.' 
  };
}

/**
 * Update existing data entry
 */
function updateDataEntry(rowNumber, entryData) {
  // Since we're using a read-only external sheet, we cannot update data
  return { 
    success: false, 
    message: 'Data updating is disabled for external read-only sheets. Please contact the administrator to update the source spreadsheet.' 
  };
}

/**
 * Delete data entry
 */
function deleteDataEntry(rowNumber) {
  // Since we're using a read-only external sheet, we cannot delete data
  return { 
    success: false, 
    message: 'Data deletion is disabled for external read-only sheets. Please contact the administrator to update the source spreadsheet.' 
  };
}

/**
 * Function to get the current spreadsheet ID for reference
 */
function getSpreadsheetId() {
  return SPREADSHEET_ID;
}