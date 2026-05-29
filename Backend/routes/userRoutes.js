const express = require("express");
const router = express.Router();
<<<<<<< HEAD
const { searchUsers } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.get("/search", protect, searchUsers);
=======
const { searchUsers, updateAvatar } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.get("/search", protect, searchUsers);
router.put("/avatar", protect, updateAvatar);
>>>>>>> main

module.exports = router;