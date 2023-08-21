const tasks = require("../models/model.task");
const stringMatch = require("../utils/stringMatch");
const Users = require("../models/model.user");

applierDetails = {
  fullName: 1,
  email: 1,
  city: 1,
  scoreTotal: 1,
  _id: 1,
};
TasksOwner = {
  fullName: 1,
  city: 1,
  picture: 1,
};
TasksDetails = {
  name: 1,
  requirements: 1,
  publishedDate: 1,
  ExpireDate: 1,
  description: 1,
  nombre: 1,
  score: 1,
  websiteUrl: 1,
  appliers: 1,
};
const addtask = async (req, res) => {
  try {
    console.log(req.id);
    const newtask = new tasks({
      ...req.body,
      owner: req.id,
    });
    await newtask.save();
    newtask.populate({ path: "owner", select: TasksOwner });
    return res.status(201).json(newtask);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err.message });
  }
};
const updatetask = (id) => async (req, res) => {
  try {
    await tasks.findByIdAndUpdate(req.params[id], req.body).exec();
    return res.status(200).json("updated");
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
const updateURI = (id) => async (req, res) => {
  try {
    console.log(req.body);
    const task = await tasks.findById(req.params[id]).exec();
    if (!task.valid) return res.status(400).json("task not valid");
    const user = req.body.body.user;
    console.log(task.appliers);
    const index = task.appliers.findIndex((e) => e.user?.toString() === user);
    console.log(index);
    task.appliers[index].uri = req.body.body.uri;
    await task.save();
    return res.status(200).json(" applied");
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
const validtask = (id) => async (req, res) => {
  try {
    await tasks.findByIdAndUpdate(req.params[id], { valid: true }).exec();
    return res.status(200).json("valid");
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
const invalidtask = (id) => async (req, res) => {
  try {
    await tasks.findByIdAndUpdate(req.params[id], { valid: false }).exec();
    return res.status(200).json("invalid");
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
const deletetask = (id) => async (req, res) => {
  try {
    await tasks.findByIdAndDelete(req.params[id]).exec();
    return res.status(200).json("deleted");
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
const applytask = (id) => async (req, res) => {
  try {
    const task = await tasks.findById(req.params[id]).exec();
    if (!task.valid) return res.status(400).json("task not valid");
    const index = task.appliers.findIndex(
      (e) => e.user.toString?.() === req.body.id.toString?.()
    );
    if (index !== -1) return res.status(400).json("already applied");
    task.appliers.push({
      user: req.body.id,
    });
    await task.save();
    return res.status(200).json(" applied");
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
const unapplytask = (id) => async (req, res) => {
  try {
    const task = await tasks.findById(req.params[id]).exec();
    const index = task.appliers.findIndex(
      (e) => e.user.toString?.() === req.body.id.toString?.()
    );
    if (index === -1) return res.status(200).json("already not applied");
    task.appliers.splice(index, 1);
    await task.save();
    return res.status(200).json(" unapplied");
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
const getAppliers = (taskId) => async (req, res) => {
  console.log(req.params[taskId]);
  try {
    const task = await tasks
      .findById(req.params[taskId])
      .populate({ path: "appliers.user", select: applierDetails })
      .select({ appliers: 1 })
      .lean()
      .exec();
    if (task.appliers.length === 0) return res.status(204).json(task.appliers);
    return res.status(200).json(task.appliers);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
const acceptApplier = (taskId, userId) => async (req, res) => {
  try {
    const task = await tasks.findById(req.body.taskId).exec();
    const score = req.body.score;
    const date1 = task.publishedDate;
    const date2 = task.ExpireDate;
    const diffInMilliseconds = date2 - date1;
    const diffInHours = diffInMilliseconds / 1000 / 60 / 60;
    const diffInJours = diffInHours / 24;
    const totscore = parseInt(score) * parseInt(diffInJours);

    const index = task?.appliers.findIndex(
      (e) => e.user.toString?.() === req.params[userId]
    );
    if (index === -1) return res.status(400).json("invalid params");
    task.appliers.splice(index, 1, {
      user: req.params[userId],
      accepted: true,
      Classment: req.body.Classment,
    });
    const user = await Users.findById(req.params[userId]);
    user.scoreTotal += totscore;
    user.save();
    await task.save();
    return res.status(200).json("accepted");
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
const unacceptApplier = (taskId, userId) => async (req, res) => {
  try {
    const task = await tasks.findById(req.body.taskId).exec();
    console.log("tesk", task);
    const index = task?.appliers.findIndex(
      (e) => e.user.toString?.() === req.params[userId]
    );
    if (index === -1) return res.status(400).json("invalid params");

    task.appliers.splice(index, 1, {
      user: req.params[userId],
      accepted: false,
    });
    await task.save();
    return res.status(200).json("unaccepted");
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getAlltasks = async (req, res) => {
  try {
    const Tasks = await tasks
      .find({})
      .populate({
        path: "owner",
        populate: { path: "listofRates" },
      })
      .sort("-owner.averageRating")
      .select(TasksDetails)
      .lean()
      .exec();
    if (tasks.length === 0) return res.status(204).json(tasks);
    return res.status(200).json(Tasks);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
const getOneTask = async (req, res) => {
  try {
    const id = req.params.taskId;
    const Tasks = await tasks
      .findById({ _id: id })
      .populate({
        path: "owner",
        populate: { path: "listofRates" },
      })
      .sort("-owner.averageRating")
      .select(TasksDetails)
      .lean()
      .exec();
    if (tasks.length === 0) return res.status(204).json(tasks);
    return res.status(200).json(Tasks);
  } catch (error) {}
};
const searchtasks = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    limit = isNaN(limit) ? 10 : parseInt(limit);
    page = isNaN(page) ? 1 : parseInt(page);
    const tasks = await tasks
      .find({
        valid: true,
        ...req.body,
      })
      .populate({ path: "owner", select: TasksOwner })
      .select(TasksDetails)
      .lean()
      .exec();
    if (tasks.length === 0) return res.status(204).json(tasks);
    const data = tasks.filter(
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
const getCompanyTask = async (req, res) => {
  try {
    const Tasks = await tasks
      .find({ owner: req.id })
      .populate({ path: "owner", select: TasksOwner })
      .select(TasksDetails)
      .lean()
      .exec();
    if (tasks.length === 0) return res.status(204).json(Tasks);
    return res.status(200).json(Tasks);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addtask,
  updatetask,
  deletetask,
  applytask,
  getAppliers,
  unapplytask,
  acceptApplier,
  unacceptApplier,

  validtask,
  invalidtask,
  getAlltasks,
  getOneTask,
  searchtasks,
  getCompanyTask,
  updateURI,
};
