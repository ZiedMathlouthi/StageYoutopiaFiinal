yup = require("yup");

const taskValidator = yup.object().shape({
  ExpireDate: yup.date().required(),
  description: yup.string().required(),
  requirements: yup.array().of(yup.string()).min(1),
  nombre: yup.number().required().min(1).max(30),
  // score: yup.number().min(30).max(100),
  name: yup.string().required(),
});
const taskSearch = yup.object().shape({
  name: yup.string(),
});
module.exports = { taskValidator, taskSearch };
