const SHEET_NAME = 'Replies';

function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    return output_(e, {
      ok: true,
      reply: {
        updatedAt: '',
        message: '',
        page: ''
      }
    });
  }

  const values = sheet.getRange(2, 1, 1, 3).getValues()[0];
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
  const sheet = getReplySheet_();
  const params = e && e.parameter ? e.parameter : {};
  const body = parseBody_(e);
  const message = String(params.message || body.message || '').trim();
  const page = String(params.page || body.page || 'story.html').trim();

  if (!message) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: 'Message is required.' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const now = new Date();
  sheet.getRange(2, 1, 1, 3).setValues([[now, message, page]]);

  return ContentService
    .createTextOutput(JSON.stringify({
      ok: true,
      reply: {
        updatedAt: now.toISOString(),
        message: message,
        page: page
      }
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getReplySheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
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
