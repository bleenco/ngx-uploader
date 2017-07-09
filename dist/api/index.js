"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var express = require("express");
var multer = require("multer");
var rimraf = require("rimraf");
var cors = require("cors");
var bodyParser = require("body-parser");
var fs_1 = require("fs");
var config = require('../../config.json');
var uploadsDir = path.resolve(__dirname, 'uploads');
if (!fs_1.existsSync(uploadsDir)) {
    fs_1.mkdirSync(uploadsDir);
}
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        var ext = path.extname(file.originalname);
        cb(null, "" + Math.random().toString(36).substring(7) + ext);
    }
});
var upload = multer({ storage: storage });
exports.uploadRouter = express.Router();
exports.uploadRouter.post('/upload', upload.any(), function (req, res) {
    rimraf.sync(uploadsDir + "/**/*");
    res.status(200).json(req.files);
});
function index(req, res) {
    return res.status(200).sendFile(path.resolve(__dirname, '../index.html'));
}
var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(exports.uploadRouter);
app.use('/css', express.static(path.resolve(__dirname, '../css'), { index: false }));
app.use('/js', express.static(path.resolve(__dirname, '../js'), { index: false }));
app.use('/images', express.static(path.resolve(__dirname, '../images'), { index: false }));
app.use('/css/fonts', express.static(path.resolve(__dirname, '../fonts'), { index: false }));
app.get('/', index);
app.listen(config.port, function () { return console.log("Server running on port " + config.port + "..."); });
