/**
 * סהר — קבלת תשובות שאלון ושמירתן ל-Google Drive
 *
 * מבנה השמירה:
 *   My Drive / קליניקה / טיפולים / <שם המשיב> / <שם השאלון> <תאריך ושעה>.txt (+ .json)
 *
 * פריסה: Deploy > New deployment > Web app
 *   Execute as: Me
 *   Who has access: Anyone
 * מעתיקים את ה-Web app URL ומזריקים אותו ל-GAS_URL בקובץ index.html.
 */

var BASE_PATH = ['קליניקה', 'טיפולים'];
var TZ = 'Asia/Jerusalem';

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    var name = (data.respondent || '').toString().trim();
    if (!name) name = 'ללא שם';
    var safeName = name.replace(/[\\\/:*?"<>|]/g, '-').replace(/\s+/g, ' ').slice(0, 100);

    var folder = getOrCreateFolderPath(BASE_PATH.concat([safeName]));

    var stamp = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH-mm');
    var q = (data.questionnaire || 'שאלון').toString().replace(/[\\\/:*?"<>|]/g, '-');
    var base = q + ' ' + stamp;

    var readable = (data.summaryText || JSON.stringify(data, null, 2)).toString();
    folder.createFile(base + '.txt', readable, MimeType.PLAIN_TEXT);
    folder.createFile(base + '.json', JSON.stringify(data, null, 2), MimeType.PLAIN_TEXT);

    return json({ ok: true, folder: safeName, file: base });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doGet() {
  return json({ ok: true, service: 'sahar-questionnaires', message: 'השירות פעיל' });
}

function getOrCreateFolderPath(parts) {
  var folder = DriveApp.getRootFolder(); // My Drive
  for (var i = 0; i < parts.length; i++) {
    var it = folder.getFoldersByName(parts[i]);
    folder = it.hasNext() ? it.next() : folder.createFolder(parts[i]);
  }
  return folder;
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
