const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads");
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname); // расширение
        const name = path.basename(file.originalname, ext); // имя без расширения
        cb(null, `${name}-${Date.now()}${ext}`); // уникальное имя
    }
});


const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, 
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif|jfif|doc|docx/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true); // 
        }
        cb(new Error("Можно загружать только картинки!")); 
    }
});

app.use(express.static(__dirname));

let filelist = [];
app.post("/upload", upload.single("filedata"), function (req, res) {
    let filedata = req.file;
    console.log(filedata);
    if (!filedata) {
        res.status(400).send("Ошибка при загрузке файла");
    } else {
        filelist.push(filedata.filename);
        res.send("Файл загружен");
        console.log(filelist);
    }
});



//app.get("/", (req, res) => {
//    let files = document.getElementById('files');
//    for (let i = 0; i < filelist.length; i++) {
//        let f = filelist[i].name;
//        let imgElement = `<img src="uploads/${f}" alt="${f}">`; 
//        files.innerHTML += imgElement;
//    }

//})



app.get("/images", (req, res) => {
    fs.readdir(path.join(__dirname, 'uploads'), (err, files) => {
        if (err) {
            return res.status(500).send("Error reading uploads directory");
        }
        // Filter for image files only
        const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif|jfif)$/.test(file));
        res.json(imageFiles); // Send the list of image filenames as JSON
    });
});





app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});

