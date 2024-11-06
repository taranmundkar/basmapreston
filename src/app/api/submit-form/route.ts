import { google, sheets_v4 } from 'googleapis';
import { NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Initialize the Google Auth client with Workload Identity Federation
const auth = new GoogleAuth({
  scopes: SCOPES,
  // Use the GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '{}'),
});

let sheetsApi: sheets_v4.Sheets | null = null;

async function getSheets(): Promise<sheets_v4.Sheets> {
  if (!sheetsApi) {
    const authClient = await auth.getClient();
    sheetsApi = google.sheets({ version: 'v4', auth: authClient });
  }
  return sheetsApi;
}

export async function POST(req: Request) {
  console.log('Received form submission request');

  try {
    // Parse the request body
    const body = await req.json();
    console.log('Received form data:', JSON.stringify(body, null, 2));

    // Validate required environment variables
    if (!process.env.GOOGLE_SHEET_ID) {
      throw new Error('Missing required environment variable: GOOGLE_SHEET_ID');
    }

    // Get the Sheets API client
    const sheets = await getSheets();

    // Prepare the data for the spreadsheet
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

    // Log detailed error information
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
