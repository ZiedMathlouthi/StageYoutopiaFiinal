const Offres = require("../models/model.offre");
const stringMatch = require("../utils/stringMatch");
applierDetails = {
  fullName: 1,
  email: 1,
  city: 1,
  _id: 1,
};
offerOwner = {
  fullName: 1,
  city: 1,
  picture: 1,
};
offerDetails = {
  name: 1,
  requirements: 1,
  publishedDate: 1,
  mode: 1,
  description: 1,
  nombre: 1,
  category: 1,
  appliers: 1,
  ConditionScore: 1,
};
const addOffre = async (req, res) => {
  try {
    console.log(req.id);
    const newOffre = new Offres({
      ...req.body,
      owner: req.id,
    });
    await newOffre.save();
    newOffre.populate({ path: "owner", select: offerOwner });
    return res.status(201).json(newOffre);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err.message });
  }
};
const updateOffre = (id) => async (req, res) => {
  try {
    await Offres.findByIdAndUpdate(req.params[id], req.body).exec();
    return res.status(200).json("updated");
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
const validOffre = (id) => async (req, res) => {
  try {
    await Offres.findByIdAndUpdate(req.params[id], { valid: true }).exec();
    return res.status(200).json("valid");
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
const invalidOffre = (id) => async (req, res) => {
  try {
    await Offres.findByIdAndUpdate(req.params[id], { valid: false }).exec();
    return res.status(200).json("invalid");
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
const deleteOffre = (id) => async (req, res) => {
  try {
    await Offres.findByIdAndDelete(req.params[id]).exec();
    return res.status(200).json("deleted");
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
const applyOffre = (id) => async (req, res) => {
  try {
    const offre = await Offres.findById(req.params[id]).exec();
    if (!offre.valid) return res.status(400).json("offer not valid");
    const index = offre.appliers.findIndex(
      (e) => e.user.toString?.() === req.body.id.toString?.()
    );
    if (index !== -1) return res.status(400).json("already applied");
    offre.appliers.push({
      user: req.body.id,
    });
    await offre.save();
    return res.status(200).json(" applied");
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
const unapplyOffre = (id) => async (req, res) => {
  try {
    const offre = await Offres.findById(req.params[id]).exec();
    const index = offre.appliers.findIndex(
      (e) => e.user.toString?.() === req.body.id.toString?.()
    );
    if (index === -1) return res.status(200).json("already not applied");
    offre.appliers.splice(index, 1);
    await offre.save();
    return res.status(200).json(" unapplied");
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
const getAppliers = (offerId) => async (req, res) => {
  console.log(req.params[offerId]);
  try {
    const offre = await Offres.findById(req.params[offerId])
      .populate({ path: "appliers.user", select: applierDetails })
      .select({ appliers: 1 })
      .lean()
      .exec();
    if (offre.appliers.length === 0)
      return res.status(204).json(offre.appliers);
    return res.status(200).json(offre.appliers);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
const acceptApplier = (offerId, userId) => async (req, res) => {
  try {
    const offre = await Offres.findById(req.body.offerId).exec();

    const index = offre?.appliers.findIndex(
      (e) => e.user.toString?.() === req.params[userId]
    );
    if (index === -1) return res.status(400).json("invalid params");
    offre.appliers.splice(index, 1, {
      user: req.params[userId],
      accepted: true,
    });
    await offre.save();
    return res.status(200).json("accepted");
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
const unacceptApplier = (offerId, userId) => async (req, res) => {
  try {
    const offre = await Offres.findById(req.body.offerId).exec();
    console.log("offer", offre);
    const index = offre?.appliers.findIndex(
      (e) => e.user.toString?.() === req.params[userId]
    );
    if (index === -1) return res.status(400).json("invalid params");

    offre.appliers.splice(index, 1, {
      user: req.params[userId],
      accepted: false,
    });
    await offre.save();
    return res.status(200).json("unaccepted");
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getAllOffers = async (req, res) => {
  try {
    const offers = await Offres.find({})
      .populate({
        path: "owner",
        populate: { path: "listofRates" },
      })
      .sort("-owner.averageRating")
      .select(offerDetails)
      .lean()
      .exec();
    if (offers.length === 0) return res.status(204).json(offers);
    return res.status(200).json(offers);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
const searchOffers = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    limit = isNaN(limit) ? 10 : parseInt(limit);
    page = isNaN(page) ? 1 : parseInt(page);
    const offers = await Offres.find({
      valid: true,
      ...req.body,
    })
      .populate({ path: "owner", select: offerOwner })
      .select(offerDetails)
      .lean()
      .exec();
    if (offers.length === 0) return res.status(204).json(offers);
    const data = offers.filter(
      (e) =>
        stringMatch(req.body.name, e.name) &&
        (e.owner.country === req.body.country || !req.body.country)
    );
    const count = data.length;
    const totalPages = Math.ceil(count / limit);
    if (count === 0) return res.status(204).json(data);
    if (page > totalPages) return res.status(204).json(data);
    return res.status(200).json({
      data: data.slice((page - 1) * limit, page * limit),
      currentPage: page,
      perviousPage: page - 1 || null,
      totalPages,
      nextPage: page < totalPages ? page + 1 : null,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
const getCompanyOffer = async (req, res) => {
  try {
    const offers = await Offres.find({ owner: req.id })
      .populate({ path: "owner", select: offerOwner })
      .select(offerDetails)
      .lean()
      .exec();
    if (offers.length === 0) return res.status(204).json(offers);
    return res.status(200).json(offers);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addOffre,
  updateOffre,
  deleteOffre,
  applyOffre,
  getAppliers,
  unapplyOffre,
  acceptApplier,
  unacceptApplier,

  validOffre,
  invalidOffre,
  getAllOffers,
  searchOffers,
  getCompanyOffer,
};
