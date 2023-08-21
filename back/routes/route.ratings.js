const express = require("express");
const User = require("../models/model.user");
const Rating = require("../models/model.rating");
const { authorize, AUTH_ROLES } = require("../middleware/auth");
const { USER, COMPANY } = AUTH_ROLES;
const router = express.Router();
const { check, validationResult } = require("express-validator");
const {
  addCompanyRating,
  addUserRating,
  addCourseRating,
  getCourseAverageRating,
  getListOfCourseRatings, 
  getCompanyAverageRating,
  getListOfCompanyRatings,
  getUserAverageRating,
  getListOfUserRatings,
  getRating,
  getRater,
  getReleted
} = require("../controller/controller.ratings");
;

// Route pour ajouter une note à une entreprise
router.post(
  "/company/:id/ratings",
  [
    check("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("La note doit être entre 1 et 5."),
    check("comment")
      .isLength({ max: 500 })
      .withMessage("Le commentaire ne doit pas dépasser 500 caractères."),
  ],
  addCompanyRating
);

// Route pour ajouter une note à un utilisateur
router.post(
  "/user/:id/ratings",
  [
    check("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("La note doit être entre 1 et 5."),
    check("comment")
      .isLength({ max: 500 })
      .withMessage("Le commentaire ne doit pas dépasser 500 caractères."),
  ],
  addUserRating
);

// Route pour récupérer la moyenne des notes de l'entreprise
router.get("/company/:id/average", getCompanyAverageRating);
router.get("/company/:id/ratings", getListOfCompanyRatings);
// Route pour récupérer la moyenne des notes de l'utilisateur
router.get("/user/:id/average", getUserAverageRating);
router.get("/user/:id/ratings", getListOfUserRatings);
router.get("/Rate/:id", getRating);
router.get("/Rater/:id", getRater);
// Route pour ajouter une note à un cours
router.post('/course/:id/ratings', [
  check('rating').isInt({ min: 1, max: 5 }).withMessage('La note doit être entre 1 et 5.'),
  check('comment').isLength({ max: 500 }).withMessage('Le commentaire ne doit pas dépasser 500 caractères.')
], addCourseRating);
// Route pour récupérer la moyenne des notes de cour
router.get("/course/:id/average", getCourseAverageRating);
router.get("/course/:id/ratings", getListOfCourseRatings);
router.get('/ratings/:courseId', async (req, res) => {
  try {
    const courseRatingsData = await Rating.find({ subjectId: req.params.courseId })
      .populate('rater', 'name') // populer le champ "rater" avec le champ "name" de la collection "users"
      .exec();
    res.status(200).json(courseRatingsData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});
router.get('/related',authorize([USER]),getReleted)


module.exports = router;
