"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import path from 'path';
// import cors from 'cors';
// import fs from 'fs';
const fs = require("fs");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const express = require("express");
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const getUploadsPath = () => {
    const today = new Date();
    const year = today.getFullYear().toString();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return path.join(__dirname, 'uploads', year, month, day);
};
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadsPath = getUploadsPath();
        if (!fs.existsSync(uploadsPath)) {
            fs.mkdirSync(uploadsPath, { recursive: true });
        }
        cb(null, uploadsPath);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
const upload = multer({
    storage,
    limits: {
        fileSize: 1024 * 1024 * 2, // 2 MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/txt'];
        if (!allowedTypes.includes(file.mimetype)) {
            const error = new Error('Invalid file type');
            return cb(error);
        }
        cb(null, true);
    },
});
const checkReferer = (req, res, next) => {
    const allowedReferers = ['https://example.com', 'https://www.example.com'];
    const referer = req.get('referer');
    if (referer && allowedReferers.includes(referer)) {
        next();
    }
    res.status(401).send('Unauthorized');
};
app.post('/api/upload', checkReferer, upload.single('file'), (req, res) => {
    const file = req.file;
    if (!file) {
        const error = new Error('File upload failed');
        throw error;
    }
    res.json({ filename: file.originalname });
});
app.get('/uploads/:year/:month/:day/:filename', (req, res) => {
    const { year, month, day, filename } = req.params;
    const filePath = path.join(getUploadsPath(), filename);
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    }
    else {
        const error = new Error('File not found');
        throw error;
    }
});
app.listen(3000, () => {
    console.log(`Example app listening on port ${3000}`);
});
