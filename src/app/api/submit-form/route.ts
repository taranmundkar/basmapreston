import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

export async function POST(req: Request) {
  console.log('Received form submission request');

  try {
    // Parse the request body
    const body = await req.json();
    console.log('Received form data:', JSON.stringify(body, null, 2));

    // Validate required environment variables
    const requiredEnvVars = ['GOOGLE_PROJECT_ID', 'GOOGLE_SHEET_ID'];
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    }

    // Initialize Google Auth
    const auth = new GoogleAuth({
      scopes: SCOPES,
      projectId: process.env.GOOGLE_PROJECT_ID,
    });

    console.log('Authenticating with Google...');
    const client = await auth.getClient();
    console.log('Authentication successful');

    // Initialize Google Sheets API
    const sheets = google.sheets('v4');

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
      auth: client,
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

    // Log detailed error information (but don't send it to the client)
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
