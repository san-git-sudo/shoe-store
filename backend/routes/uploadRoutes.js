const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");

router.post("/", upload.array("image", 10), (req, res) => {

    res.json({
        success: true,
        imageUrls: req.files.map(file => file.path),
    });

});

module.exports = router;