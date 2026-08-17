const SHEET_NAME = 'Replies';
const SPREADSHEET_ID = '1uWD22Vt0hyEDZziK53ISgcP2qBjnswyCTgRdffpydSo';
const TARGET_SHEET_ID = 1409516766;

function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};
  if (params.action === 'health') {
    return healthCheck_(e);
  }

  if (params.action === 'save') {
    return saveReply_(e, params);
  }

  const sheet = getReplySheet_();

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return output_(e, {
      ok: true,
      reply: {
        updatedAt: '',
        message: '',
        page: ''
      }
    });
  }

  const values = sheet.getRange(lastRow, 1, 1, 3).getValues()[0];
  return output_(e, {
    ok: true,
    reply: {
      updatedAt: values[0] || '',
      message: values[1] || '',
      page: values[2] || ''
    }
  });
}

function doPost(e) {
  const params = e && e.parameter ? e.parameter : {};
  const body = parseBody_(e);
  return saveReply_(e, {
    message: params.message || body.message || '',
    page: params.page || body.page || 'story.html'
  });
}

function saveReply_(e, params) {
  const sheet = getReplySheet_();
  const message = String(params.message || '').trim();
  const page = String(params.page || 'story.html').trim();

  if (!message) {
    return output_(e, { ok: false, error: 'Message is required.' });
  }

  const now = new Date();
  sheet.appendRow([now, message, page]);
  sheet.autoResizeColumns(1, 3);

  return output_(e, {
    ok: true,
    reply: {
      updatedAt: now.toISOString(),
      message: message,
      page: page
    }
  });
}

function getReplySheet_() {
  const spreadsheet = openSpreadsheet_();
  let sheet = findReplySheet_(spreadsheet);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  const headerValues = sheet.getRange(1, 1, 1, 3).getValues()[0];
  if (headerValues.join('') === '') {
    sheet.getRange(1, 1, 1, 3).setValues([['Updated At', 'Message', 'Page']]);
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, 3);
  }

  return sheet;
}

function findReplySheet_(spreadsheet) {
  const sheets = spreadsheet.getSheets();
  const targetSheetId = Number(TARGET_SHEET_ID);

  for (let i = 0; i < sheets.length; i += 1) {
    if (sheets[i].getSheetId() === targetSheetId) {
      return sheets[i];
    }
  }

  return spreadsheet.getSheetByName(SHEET_NAME) || sheets[0] || null;
}

function openSpreadsheet_() {
  if (SPREADSHEET_ID) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }

  return SpreadsheetApp.getActiveSpreadsheet();
}

function healthCheck_(e) {
  const spreadsheet = openSpreadsheet_();
  const sheet = findReplySheet_(spreadsheet);
  const sheets = spreadsheet.getSheets().map(function(currentSheet) {
    return {
      name: currentSheet.getName(),
      sheetId: currentSheet.getSheetId(),
      lastRow: currentSheet.getLastRow()
    };
  });

  return output_(e, {
    ok: true,
    spreadsheetId: spreadsheet.getId(),
    spreadsheetUrl: spreadsheet.getUrl(),
    configuredSheetName: SHEET_NAME,
    targetSheetId: TARGET_SHEET_ID,
    activeWriteSheetName: sheet ? sheet.getName() : '',
    activeWriteSheetId: sheet ? sheet.getSheetId() : '',
    sheetExists: !!sheet,
    lastRow: sheet ? sheet.getLastRow() : 0,
    sheets: sheets
  });
}

function parseBody_(e) {
  try {
    if (e && e.postData && e.postData.contents) {
      return JSON.parse(e.postData.contents);
    }
  } catch (error) {}
  return {};
}

function output_(e, payload) {
  const callback = e && e.parameter ? e.parameter.callback : '';

  if (callback && /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) {
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(payload) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}