import { google, sheets_v4 } from 'googleapis';
import { NextResponse } from 'next/server';
import { JWT } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

let auth: JWT | null = null;

async function initializeGoogleAuth() {
  try {
    const keyString = process.env.GOOGLE_APPLICATION_CREDENTIALS || '{}';
    const keyFile = JSON.parse(keyString as string);

    // 2. Create a JWT client
    auth = new google.auth.JWT({
      email: keyFile.client_email,
      key: keyFile.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  } catch (error) {
    console.error('Error initializing GoogleAuth:', error);
    auth = null;
  }
}

// Initialize auth outside of the request handler
initializeGoogleAuth();

let sheets: sheets_v4.Sheets | PromiseLike<sheets_v4.Sheets>

async function getSheets(): Promise<sheets_v4.Sheets> {
  if (!sheets) {
    try {
      if (!auth) {
        throw new Error('GoogleAuth not initialized');
      }
      console.log('Getting auth client...');
      await auth.authorize();
      console.log('Auth client authorized successfully');

      console.log('Initializing Google Sheets API...');
      sheets = google.sheets({ version: 'v4', auth });
      console.log('Google Sheets API initialized successfully');
    } catch (error) {
      console.error('Error in getSheets:', error);
      throw new Error('Failed to initialize Google Sheets API');
    }
  }
  return sheets;
}

export async function POST(req: Request) {
  console.log('Received form submission request');

  try {
    const body = await req.json();
    console.log('Received form data:', JSON.stringify(body, null, 2));

    // if (!process.env.GOOGLE_SHEET_ID) {
    //   throw new Error('Missing required environment variable: GOOGLE_SHEET_ID');
    // }

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
      spreadsheetId: '1DO_gLNJnUKK5aRSW7NeuFurWUbC6_mq7O_R4YoN1vI4',
      range: 'A1:A10',
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
