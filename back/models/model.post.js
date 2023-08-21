const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const postSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user" || "company",
      required: true,
    },
    fullName: {
      type: String,
    },

    desc: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    video: {
      type: String,
    },
    likes: [],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
          required: true,
        },
        fullName: {
          type: String,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const Posts = mongoose.model("post", postSchema, "post");
module.exports = Posts;

/*const Schema = mongoose.Schema;
const postSchema = new Schema(
  {
    user:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    title :{
        type: String,
        required: true,
    },
    image :{
        type: String,
        required: true,
    },
    video :{
        type: String,
    },
    like:{
        type: Array,
    },
    dislike:{
        type: Array,
    },
    comments:[{
        user :{
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        fullName:{
            type: String,
            required: true,
        },
        comment:{
            type: String,
            required: true,
        },
    }]
  }
);

const Posts = mongoose.model("post", postSchema, "post");
module.exports = Posts;
*/
