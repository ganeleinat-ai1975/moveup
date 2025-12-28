import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

export default Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log("Attempting to get access token for googlesheets...");
    const accessToken = await base44.asServiceRole.connectors.getAccessToken("googlesheets");
    if (!accessToken) {
      console.error("Failed to get access token");
      return Response.json({ error: 'Google Sheets not authorized. Please authorize the app.' }, { status: 400 });
    }
    console.log("Access token retrieved successfully.");

    // 1. Fetch all data
    const [
      globalSettings,
      homeSettings,
      aboutSettings,
      personalSettings,
      corporateSettings,
      testimonialsSettings,
      podcastSettings,
      blogSettings,
      contactSettings,
      blogPosts,
      testimonials,
      workshops,
      lectures,
      episodes
    ] = await Promise.all([
      base44.entities.GlobalSettings.list().then(res => res[0] || {}),
      base44.entities.HomePageSettings.list().then(res => res[0] || {}),
      base44.entities.AboutPageSettings.list().then(res => res[0] || {}),
      base44.entities.PersonalPageSettings.list().then(res => res[0] || {}),
      base44.entities.CorporatePageSettings.list().then(res => res[0] || {}),
      base44.entities.TestimonialsPageSettings.list().then(res => res[0] || {}),
      base44.entities.PodcastPageSettings.list().then(res => res[0] || {}),
      base44.entities.BlogPageSettings.list().then(res => res[0] || {}),
      base44.entities.ContactPageSettings.list().then(res => res[0] || {}),
      base44.entities.BlogPost.list(),
      base44.entities.Testimonial.list(),
      base44.entities.PersonalWorkshop.list(),
      base44.entities.CorporateLecture.list(),
      base44.entities.PodcastEpisode.list(),
    ]);

    // 2. Prepare Sheets Data
    const sheetsData = [];

    // Helper to create a sheet for a single record (Settings)
    const createSettingsSheet = (title, data) => {
      const rows = [['Field', 'Value']];
      for (const [key, value] of Object.entries(data)) {
        if (['id', 'created_date', 'updated_date', 'created_by'].includes(key)) continue;
        let stringValue = value;
        if (typeof value === 'object') {
          stringValue = JSON.stringify(value);
        }
        rows.push([key, stringValue]);
      }
      return { title, rows };
    };

    // Helper to create a sheet for a list of records
    const createListSheet = (title, dataList) => {
      if (!dataList || dataList.length === 0) return { title, rows: [['No Data']] };
      
      const headers = Object.keys(dataList[0]).filter(k => !['id', 'created_date', 'updated_date', 'created_by'].includes(k));
      const rows = [headers];
      
      dataList.forEach(item => {
        const row = headers.map(header => {
          const val = item[header];
          return typeof val === 'object' ? JSON.stringify(val) : val;
        });
        rows.push(row);
      });
      
      return { title, rows };
    };

    sheetsData.push(createSettingsSheet('Global Settings', globalSettings));
    sheetsData.push(createSettingsSheet('Home Page', homeSettings));
    sheetsData.push(createSettingsSheet('About Page', aboutSettings));
    sheetsData.push(createSettingsSheet('Personal Page', personalSettings));
    sheetsData.push(createSettingsSheet('Corporate Page', corporateSettings));
    sheetsData.push(createSettingsSheet('Testimonials Page', testimonialsSettings));
    sheetsData.push(createSettingsSheet('Podcast Page', podcastSettings));
    sheetsData.push(createSettingsSheet('Blog Page', blogSettings));
    sheetsData.push(createSettingsSheet('Contact Page', contactSettings));

    sheetsData.push(createListSheet('Blog Posts', blogPosts));
    sheetsData.push(createListSheet('Testimonials', testimonials));
    sheetsData.push(createListSheet('Workshops', workshops));
    sheetsData.push(createListSheet('Lectures', lectures));
    sheetsData.push(createListSheet('Podcast Episodes', episodes));


    // 3. Create Spreadsheet File using Drive API (Works better with drive.file scope)
    console.log("Creating file via Drive API...");
    const driveCreateRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: `Site Data Backup - ${new Date().toISOString().split('T')[0]}`,
        mimeType: 'application/vnd.google-apps.spreadsheet'
      })
    });

    if (!driveCreateRes.ok) {
      const err = await driveCreateRes.text();
      console.error("Drive API Create Error:", err);
      throw new Error(`Failed to create file (Drive API): ${err}`);
    }

    const driveFile = await driveCreateRes.json();
    const spreadsheetId = driveFile.id;
    console.log("File created via Drive API:", spreadsheetId);

    // 4. Add Sheets (Tabs) using Sheets API batchUpdate
    // Note: A new sheet comes with one default sheet (usually ID 0). We will add ours.
    console.log("Adding sheets...");
    const addSheetsRequests = sheetsData.map(s => ({
      addSheet: {
        properties: {
          title: s.title
        }
      }
    }));

    const addSheetsRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: addSheetsRequests
      })
    });

    if (!addSheetsRes.ok) {
      const err = await addSheetsRes.text();
      console.error("Sheets API Add Sheets Error:", err);
      // Don't fail completely, try to write to default sheet or handle it
      throw new Error(`Failed to add sheets tabs: ${err}`);
    }

    // 5. Populate Data
    console.log("Populating data...");
    const dataToUpdate = sheetsData.map(sheet => ({
      range: `${sheet.title}!A1`,
      values: sheet.rows
    }));

    const updateRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        valueInputOption: 'RAW',
        data: dataToUpdate
      })
    });

    if (!updateRes.ok) {
      const err = await updateRes.text();
      console.error("Sheets API Update Values Error:", err);
      throw new Error(`Failed to update spreadsheet data: ${err}`);
    }

    // Optional: Delete the default "Sheet1" if needed, but keeping it is safer to avoid "no visible sheets" errors.

    return Response.json({ 
      success: true, 
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
    });

  } catch (error) {
    console.error('Export error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});