const { Storage } = require('@google-cloud/storage');

let storage;
let bucket;

function initStorage() {
  if (bucket) return bucket;

  // Sokong 2 cara bagi credentials:
  // 1) GOOGLE_CREDENTIALS_JSON = seluruh isi fail JSON (untuk Render - senang copy-paste)
  // 2) GOOGLE_APPLICATION_CREDENTIALS = path ke fail JSON (untuk local dev)
  let storageConfig = {};
  if (process.env.GOOGLE_CREDENTIALS_JSON) {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
    storageConfig = {
      projectId: credentials.project_id,
      credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key
      }
    };
  }

  storage = new Storage(storageConfig);
  bucket = storage.bucket(process.env.GCS_BUCKET_NAME);
  return bucket;
}

/**
 * Upload satu fail (buffer) ke Google Cloud Storage.
 * Pulangkan public URL gambar tu.
 */
function uploadBufferToGCS(fileBuffer, originalName, mimetype) {
  return new Promise((resolve, reject) => {
    const bucket = initStorage();
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${originalName.replace(/\s+/g, '_')}`;
    const blob = bucket.file(uniqueName);
    const stream = blob.createWriteStream({
      resumable: false,
      contentType: mimetype
    });

    stream.on('error', (err) => reject(err));
    stream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${uniqueName}`;
      resolve(publicUrl);
    });
    stream.end(fileBuffer);
  });
}

/**
 * Padam fail dari Google Cloud Storage guna public URL-nya (pilihan, untuk cleanup).
 */
async function deleteFromGCS(publicUrl) {
  try {
    if (!publicUrl || !publicUrl.includes('storage.googleapis.com')) return;
    const bucket = initStorage();
    const fileName = publicUrl.split(`${process.env.GCS_BUCKET_NAME}/`)[1];
    if (fileName) await bucket.file(fileName).delete({ ignoreNotFound: true });
  } catch (err) {
    console.error('Gagal padam gambar dari GCS:', err.message);
  }
}

module.exports = { uploadBufferToGCS, deleteFromGCS };
