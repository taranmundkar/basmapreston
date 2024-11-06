import { google } from 'googleapis'
import { NextResponse } from 'next/server'
import { GoogleAuth } from 'google-auth-library'

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

export async function POST(req: Request) {
    try {
        const body = await req.json()

        const auth = new GoogleAuth({
            scopes: SCOPES,
            projectId: process.env.GOOGLE_PROJECT_ID,
        })

        const client = await auth.getClient()
        const sheets = google.sheets({ version: 'v4', auth: client })

        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'Form Responses!A1',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [
                    [
                        new Date().toISOString(),
                        body.userType,
                        body.budget,
                        body.homeType,
                        body.bedrooms,
                        body.bathrooms,
                        body.location,
                        body.timeline,
                        body.preApproval,
                        body.agentContract,
                    ],
                ],
            },
        })

        return NextResponse.json({ success: true, data: response.data })
    } catch (error) {
        console.error('Error submitting to Google Sheet:', error)
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
    }
}