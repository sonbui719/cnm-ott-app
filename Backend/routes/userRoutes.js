const express = require("express");
const router = express.Router();
const { searchUsers, updateAvatar, getPublicUser } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.get("/search", protect, searchUsers);
router.put("/avatar", protect, updateAvatar);
router.get("/:userId", protect, getPublicUser);

module.exports = router;
