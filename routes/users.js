const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/protect");

const {
  login,
  logout,
  resetPassword,
  refreshToken,
  getUser,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  currentUser,
} = require("../controller/users");

router.route("/").get(protect, getUsers).post(createUser);
router
  .route("/:id")
  .get(protect, getUser)
  .put(protect, updateUser)
  .delete(protect, deleteUser);
router.route("/current/user").get(protect, currentUser);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/reset-password").post(resetPassword);
router.route("/refresh-token").post(refreshToken);

module.exports = router;
