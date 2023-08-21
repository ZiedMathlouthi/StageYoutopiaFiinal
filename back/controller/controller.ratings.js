const mongoose = require("mongoose");
const Offre = require("../models/model.offre");
const User = require("../models/model.user");
const Company = require("../models/model.company");
const Course = require("../models/courses/model.course");
const Rating = require("../models/model.rating");
// Liste de toutes les notes pour les utilisateurs
let listOfRatesUser = [];
// Liste de toutes les notes pour les entreprises
let listOfRatesCompany = [];
// Liste de toutes les notes pour les cours
let listOfRatesCourse = [];

// Fonction pour ajouter une note à une entreprise
exports.addCompanyRating = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: "Entreprise introuvable." });
    }
    console.log(company);
    const rating = new Rating({
      subject: "company",
      subjectId: req.params.id,
      rater: req.body.user || req.body.company,
      rating: req.body.rating,
      comment: req.body.comment,
    });

    const r = await rating.save();
    listOfRatesCompany = company.listofRates;
    listOfRatesCompany.push(r);
    await Company.findByIdAndUpdate(req.params.id, {
      listofRates: listOfRatesCompany,
    });

    // Ajouter la note à la liste des notes pour les entreprises

    res.status(201).json({ message: "Rating added successfully." });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error." });
  }
};

exports.getListOfCompanyRatings = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await Company.findById(id);

    console.log({ company, id });
    const l = company.listofRates;

    res.status(200).send(l);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error." });
  }
};
exports.getRating = async (req, res) => {
  try {
    const id = req.params.id;
    const rating = await Rating.findById(id).populate("rater");

    res.status(200).send(rating);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error." });
  }
};
exports.getRater = async (req, res) => {
  try {
    const id = req.params.id;
    const rater = (await User.findById(id)) || (await Company.findById(id));
    console.log("rater", rater);
    res.status(200).send(rater);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error." });
  }
};

// Fonction pour calculer la moyenne des notes d'une entreprise
exports.getCompanyAverageRating = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: "Entreprise introuvable." });
    }

    const ratings = await Rating.find({
      subject: "company",
      subjectId: req.params.id,
    });

    if (ratings.length === 0) {
      return res
        .status(400)
        .json({ message: "Aucune note pour cette entreprise." });
    }

    let totalRating = 0;
    ratings.forEach((rating) => {
      totalRating += rating.rating;
    });

    const averageRating = totalRating / ratings.length;

    res.status(200).json({ averageRating });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error." });
  }
};

// Fonction pour ajouter une note à un utilisateur
exports.addUserRating = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    const rating = new Rating({
      subject: "user",
      subjectId: req.params.id,
      rater: req.body.company || req.body.user,
      rating: req.body.rating,
      comment: req.body.comment,
    });

    const r = await rating.save();
    listOfRatesUser = user.listofRates;
    listOfRatesUser.push(r);
    await User.findByIdAndUpdate(req.params.id, {
      listofRates: listOfRatesUser,
    });

    // Ajouter la note à la liste des notes pour l'utilisateur

    res.status(201).json({ message: "Rating added successfully." });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error." });
  }
};

// Fonction pour obtenir la liste des notes d'un utilisateur
exports.getListOfUserRatings = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.params.id).populate("listofRates");
    const l = user.listofRates.sort((a, b) => b.rating - a.rating);

    res.status(200).send(l);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error." });
  }
};

// Fonction pour calculer la moyenne des notes d'un utilisateur
exports.getUserAverageRating = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    const ratings = await Rating.find({
      subject: "user",
      subjectId: req.params.id,
    });

    if (ratings.length === 0) {
      return res
        .status(404)
        .json({ message: "Aucune note pour cet utilisateur." });
    }

    let totalRating = 0;
    ratings.forEach((rating) => {
      totalRating += rating.rating;
    });

    const averageRating = totalRating / ratings.length;

    res.status(200).json({ averageRating });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error." });
  }
};
// Fonction pour ajouter une note à un cours
exports.addCourseRating = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Cours introuvable." });
    }

    const userId = req.userId; // obtenir l'ID de l'utilisateur connecté
    const courseId = req.params.id;

    // // Vérifier si l'utilisateur a déjà noté ce cours
    // const hasRated = await userHasRatedCourse(userId, courseId);
    // if (hasRated) {
    //   return res.status(400).json({ message: "Vous avez déjà noté ce cours." });
    // }

    const rating = new Rating({
      subject: "course",
      subjectId: courseId,
      rater: req.body.user || req.body.company,
      rating: req.body.rating,
      comment: req.body.comment,
    });
    const r = await rating.save();
    let listOfRatesCourse = course.listofRates || [];
    listOfRatesCourse.push(r);
    await Course.findByIdAndUpdate(courseId, {
      listofRates: listOfRatesCourse,
    });

    // Ajouter la note à la liste des notes pour les cours

    res.status(201).json({ message: "Rating added successfully." });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error." });
  }
};

exports.getListOfCourseRatings = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate("listofRates");
    const ratings = course.listofRates;
    const average =
      ratings.reduce((acc, rating) => acc + rating.rating, 0) / ratings.length;
    const sortedRatings = ratings.sort((a, b) => b.rating - a.rating);
    console.log({ sortedRatings, average });
    res.status(200).json({ ratings: sortedRatings, average });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error." });
  }
};

// exports.getRating = async (req, res) => {
//   try {
//     const id = req.params.id;
//     const rating = await Rating.findById(id);
//     res.status(200).send(rating);
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ message: "Erreur serveur." });
//   }
// };

// Fonction pour calculer la moyenne des notes d'un cours
exports.getCourseAverageRating = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Cours introuvable." });
    }
    const ratings = await Rating.find({
      subject: "course",
      subjectId: req.params.id,
    });

    if (ratings.length === 0) {
      return res.status(400).json({ message: "Aucune note pour ce cours." });
    }

    let totalRating = 0;
    ratings.forEach((rating) => {
      totalRating += rating.rating;
    });

    const averageRating = totalRating / ratings.length;

    res.status(200).json({ averageRating });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error." });
  }
};
offerOwner = {
  fullName: 1,
};
exports.getReleted = async (req, res) => {
  try {
    console.log(req.id);
    const offers = await Offre.find({
      appliers: { $all: [{ $elemMatch: { user: req.id.toString() } }] },
    }).populate({ path: "owner", select: offerOwner });
    return res.status(200).json(offers.map((offer) => offer.owner));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
