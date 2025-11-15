const express = require('express');
const multer = require('multer');
const mysql = require('mysql2/promise');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Ensure evidence directory exists
if (!fs.existsSync('evidence_files')) {
  fs.mkdirSync('evidence_files');
}

// MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '@riya123', // Change this
  database: 'court_evidences', // Change this
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'evidence_files');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// Middleware
app.use(express.static('public'));
app.use(express.json());

function calculateFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

// Route: Submit evidence
app.post('/submit-evidence', upload.single('evidenceFile'), async (req, res) => {
  let connection;
  try {
    const { caseId, evidenceId, fileName, fileType, officerId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    // Calculate hash of uploaded file
    const filePath = req.file.path;
    const evidenceHash = calculateFileHash(filePath);

    // Insert into database
    connection = await pool.getConnection();
    const [result] = await connection.execute(
      `INSERT INTO evidence (case_id, evidence_id, file_name, file_type, evidence_hash, officer_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [caseId, evidenceId,  fileName || req.file.originalname, fileType, evidenceHash, officerId]
      );

    res.json({
      success: true,
      evidenceId,
      hash: evidenceHash,
      message: 'Evidence submitted successfully'
    });

  } catch (error) {
    console.error('Error submitting evidence:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// Route: Verify evidence
app.post('/verify-evidence', upload.single('verifyFile'), async (req, res) => {
  let connection;
  try {
    const { caseId, evidenceId } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    // Calculate hash of uploaded file
    const filePath = req.file.path;
    const calculatedHash = calculateFileHash(filePath);

    // Get stored hash from database
    connection = await pool.getConnection();
    const [rows] = await connection.execute(
      `SELECT evidence_hash, file_name, upload_date, officer_id 
       FROM evidence 
       WHERE case_id = ? AND evidence_id = ?`,
      [caseId, evidenceId]
    );

    // Clean up uploaded verification file
    fs.unlinkSync(filePath);

    if (rows.length === 0) {
      return res.json({
        success: false,
        error: 'Evidence not found in database'
      });
    }

    const storedHash = rows[0].evidence_hash;
    const isValid = calculatedHash === storedHash;

    res.json({
      success: true,
      isValid,
      storedHash,
      calculatedHash,
      evidenceDetails: {
        fileName: rows[0].file_name,
        uploadDate: rows[0].upload_date,
        officerId: rows[0].officer_id
      }
    });

  } catch (error) {
    console.error('Error verifying evidence:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// Route: Get evidence list
app.get('/evidence-list', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.execute(
      `SELECT evidence_id, case_id, file_name, file_type, upload_date, officer_id 
       FROM evidence 
       ORDER BY upload_date DESC 
       LIMIT 100`
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching evidence:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.listen(PORT, () => {
  console.log(`Evidence Management System running on http://localhost:${PORT}`);
  console.log(`Submit Evidence: http://localhost:${PORT}/`);
  console.log(`Admin Verification: http://localhost:${PORT}/admin.html`);
});