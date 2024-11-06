import { google, sheets_v4 } from 'googleapis';
import { NextResponse } from 'next/server';
import { GoogleAuth, OAuth2Client } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

let auth: GoogleAuth | null = null;

function initializeGoogleAuth() {
  try {
    const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON 
      ? JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)
      : {};

    auth = new GoogleAuth({
      scopes: SCOPES,
      credentials,
    });
  } catch (error) {
    console.error('Error initializing GoogleAuth:', error);
    auth = null;
  }
}

// Initialize auth outside of the request handler
initializeGoogleAuth();

let sheetsApi: sheets_v4.Sheets | null = null;

async function getSheets(): Promise<sheets_v4.Sheets> {
  if (!sheetsApi) {
    try {
      if (!auth) {
        throw new Error('GoogleAuth not initialized');
      }
      console.log('Getting auth client...');
      const authClient = await auth.getClient() as OAuth2Client;
      console.log('Auth client obtained successfully');
      
      console.log('Initializing Google Sheets API...');
      sheetsApi = google.sheets({ version: 'v4', auth: authClient });
      console.log('Google Sheets API initialized successfully');
    } catch (error) {
      console.error('Error in getSheets:', error);
      throw new Error('Failed to initialize Google Sheets API');
    }
  }
  return sheetsApi;
}

export async function POST(req: Request) {
  console.log('Received form submission request');

  try {
    const body = await req.json();
    console.log('Received form data:', JSON.stringify(body, null, 2));

    if (!process.env.GOOGLE_SHEET_ID) {
      throw new Error('Missing required environment variable: GOOGLE_SHEET_ID');
    }

    console.log('Getting Sheets API...');
    const sheets = await getSheets();
    console.log('Sheets API obtained successfully');

    const values = [
      [
        new Date().toISOString(),
        body.userType,
        Array.isArray(body.budget) ? body.budget.join(', ') : body.budget,
        Array.isArray(body.homeType) ? body.homeType.join(', ') : body.homeType,
        body.bedrooms,
        body.bathrooms,
        body.location,
        body.timeline,
        body.preApproval,
        body.agentContract,
      ],
    ];

    console.log('Appending data to Google Sheet...');
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Form Responses!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });

    console.log('Data successfully appended to Google Sheet');
    return NextResponse.json({ success: true, data: response.data });

  } catch (error: unknown) {
    console.error('Error in form submission:', error);

    let errorMessage = 'An unexpected error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    console.error('Detailed error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));

    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal Server Error', 
        message: errorMessage
      }, 
      { status: 500 }
    );
  }
}
