# Bangaru Kutumbam Tracking System

A comprehensive Google Apps Script application for tracking Bangaru Kutumbam program data with secure login, data entry, filtering, and reporting capabilities.

## Features

- **Secure Login System**: Username/password authentication for Mandal-specific access
- **Data Entry Form**: Comprehensive form for entering all required fields
- **Dynamic Filtering**: Filter data by Mandal, Secretariat, Employee, etc.
- **Pagination**: Efficient handling of large datasets
- **Statistics Dashboard**: Visual representation of key metrics
- **Edit/Delete Functionality**: Full CRUD operations on data entries
- **Responsive Design**: Mobile-friendly interface

## Setup Instructions

1. **Create a new Google Apps Script Project**:
   - Go to [script.google.com](https://script.google.com/)
   - Click "+ New Project"

2. **Replace the default code** with the content from `Code.gs`

3. **Create HTML files**:
   - Create a new HTML file named `Index.html` with the provided content
   - Create another HTML file named `Login.html` with the login content

4. **Add the manifest file**:
   - Replace the default `appsscript.json` with the provided content

5. **Deploy the Web App**:
   - Click "Deploy" → "New Deployment"
   - Select type "Web Application"
   - Configure execution as "Execute as me" and "Anyone"

## Data Fields

The system tracks the following fields:

- DistrictName
- MandalName
- SecretariatID
- SecretraiatName
- EmployeeID
- EmployeeName
- ClusterID
- Total Bangaru Kutumbam
- No. of Bangaru Kutumbam adopted
- No. of Margadarsi Mobilized
- BKs verified by GSWS
- Margadarsis contacted by GSWS
- No. of BKs new Needs captured
- No. of Margadarsis agreed to address the BK needs (Engagement)
- No. of BK needs closed
- No. of Delinking requests raised

## Login Credentials

Default test credentials:
- Username: `mandal1`, Password: `password1`
- Username: `mandal2`, Password: `password2`
- Username: `mandal3`, Password: `password3`

## Usage

1. Access the deployed URL to see the login screen
2. Enter valid credentials to access the dashboard
3. Use the "Add New Entry" button to enter new data
4. Apply filters to view specific subsets of data
5. Edit or delete existing entries as needed

## Security Notes

- Store actual passwords securely (hashed) in production
- Implement proper session management
- Consider adding role-based access controls
- Review permissions regularly

## Customization

- Modify the CSS styles in the HTML files for branding
- Adjust the dashboard layout and statistics as needed
- Add additional validation rules to the data entry forms
- Extend the filtering options based on requirements

## Troubleshooting

- If login doesn't work, ensure the LoginCredentials sheet exists in the spreadsheet
- Check the Apps Script execution logs for errors
- Verify that all required permissions are granted
- Ensure the spreadsheet ID is correctly configured

## Dependencies

- Google Sheets API (built into Apps Script)
- HTML Service (built into Apps Script)
- V8 runtime for modern JavaScript features