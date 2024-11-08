import { google, sheets_v4 } from 'googleapis';
import { NextResponse } from 'next/server';
import { JWT } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

let auth: JWT | null = null;

async function initializeGoogleAuth() {
  try {
    const keyString = process.env.GOOGLE_APPLICATION_CREDENTIALS || '{}';
    const keyFile = JSON.parse(keyString as string);

    // Create a JWT client
    auth = new google.auth.JWT({
      email: keyFile.client_email,
      key: keyFile.private_key,
      scopes: SCOPES,
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

const SHEET_IDS = {
  buy: '1DO_gLNJnUKK5aRSW7NeuFurWUbC6_mq7O_R4YoN1vI4',
  sell: '1WjcZ1h_a9DUZv-RvKe6Gx6Hy8TF4AVyA-reKFOBgaYg',
  rent: '15egXqR6RUnYU_OB_olzgmq93qeAagj8J94GK7xcmwc4'
};

export async function POST(req: Request) {
  console.log('Received form submission request');

  try {
    const body = await req.json();
    console.log('Received form data:', JSON.stringify(body, null, 2));

    console.log('Getting Sheets API...');
    const sheets = await getSheets();
    console.log('Sheets API obtained successfully');

    const { userType, name, email, phoneNumber, ...otherData } = body;

    if (!userType || !SHEET_IDS[userType as keyof typeof SHEET_IDS]) {
      throw new Error('Invalid or missing user type');
    }

    const sheetId = SHEET_IDS[userType as keyof typeof SHEET_IDS];

    const values = [
      [
        new Date().toISOString(),
        name,
        email,
        phoneNumber,
        ...Object.values(otherData)
      ],
    ];

    console.log(`Appending data to Google Sheet for ${userType}...`);

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });

    console.log(`Data successfully appended to Google Sheet for ${userType}`);
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
