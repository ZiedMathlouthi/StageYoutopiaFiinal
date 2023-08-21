const Post = require("../models/model.post.js");
const UserModel = require("../models/model.user.js")
const mongoose = require('mongoose')

const commentDetails = {
  fullName: 1,
  picture: 1,
  _id: 1
};

const createPost = async (req,res)=>{
   
  const newPost = new Post({...req.body , image:req.file?.filename})
 try {
  await newPost.save()
  res.status(200).json(newPost)
 } catch (error) {
  res.status(500).json(error)
 }
}

const getPost = async(req,res)=>{
  const id =req.params.id
  try {
    const post =await Post.findById(id).populate({ path: "comments.user", select: commentDetails });
    res.status(200).json(post)
  } catch (error) {
    res.status(500).json(error) 
  }
}

const updatePost = async (req,res)=>{
  const postId = req.params.id
  const {userId} =req.body
  try {
    const post =await Post.findById(postId)
    if(post.userId === userId)
    {
      await post.updateOne({$set : req.body})
      res.status(200).json("Post updated")
    }else{
      res.status(403).json("action forbidden")
    }
  } catch (error) {
    res.status(500).json(error) 
  }
}

const deletePost = async (req,res)=>{
  const id =req.params.id
  const {userId} = req.body
  
  try {
    const post =await Post.findById(id)
    if(post.userId ===userId)
    {
      await post.deleteOne()
      res.status(200).json("Post deleted")
    }else{
      res.status(403).json("action forbidden")
    }
  } catch (error) {
    res.status(500).json(error)
  }
}

const likePost = async(req,res)=>{
  const id = req.params.id
  const {userId} = req.body
  try {
    const post = await Post.findById(id)
    if(!post.likes.includes(userId))
    {
      await post.updateOne({$push : {likes :userId}})
      res.status(200).json("Post liked")
    }else{
      await post.updateOne({$pull : {likes :userId}})
      res.status(200).json("Post unliked")
    }
  } catch (error) {
    res.status(500).json(error)
  }
}
const getTimelinePosts = async (req,res)=>{
  const userId = req.params.id
  try {
    const currentUserPosts = await Post.find({userId : userId})
    const followingPosts =await UserModel.aggregate([
      {
        $match : {
          _id : new mongoose.Types.ObjectId(userId)
        }
      },
      {
        $lookup:{
          from : "post",
          localField : "following",
          foreignField : "userId",
          as :"followingPosts"
        }
      },
      {
        $project:{
          followingPosts : 1,
          _id:0
        }
      }
    ])
    res.status(200).json(currentUserPosts.concat(...followingPosts[0].followingPosts)
    .sort((a,b)=>{
      return b.createdAt - a.createdAt
    }))
  } catch (error) {
    res.status(500).json(error)
  }
}
const getAllPost = async (req, res) => {
	try {
		const posts = await Post.find({}).populate([{ path: "comments.user", select: commentDetails }, 
    { path: "userId", select: commentDetails }]);
		;
		res.status(200).json({ status: true, message: 'All Posts', posts });
	} catch (error) {
		res.status(500).json({
			status: false,
			message: 'Error in Fetching All Posts',
			error,
		});
	}
};
const getUserByID =async(req,res)=>{
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({status : true , name : user.fullName , picture : user.picture, userId : user._id});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }

}
const addComent = async (req, res) => {
	const postId = req.params.id;
	const { user, fullName, comment } = req.body;

	try {
		const post = await Post.findById(postId);
		if (!post) {
			return res
				.status(404)
				.json({ status: false, message: 'Post not found' });
		}
		const newComment = { user, fullName, comment };
		post.comments.push(newComment);
		await post.save();

		return res.status(201).json({
			status: true,
			message: 'Comment added successfully',
			comment: newComment,
		});
	} catch (error) {
		console.error(error);
		return res
			.status(500)
			.json({ status: false, message: 'Failed to add comment' });
	}
};

const getAllComents = async (req, res) => {
	const postId = req.params.id;
	try {
		const post = await Post.findById(postId).populate({ path: "comments.user", select: commentDetails });
		if (!post) {
			return res
				.status(404)
				.json({ status: false, message: 'Post not found' });
		}
		const comments = post.comments;
		return res
			.status(200)
			.json({ status: true, message: 'All Coments : ', comments });
	} catch (error) {
		console.error(error);
		return res
			.status(500)
			.json({ status: false, message: 'Failed to get comments' });
	}
};

const deleteComment = async (req, res) => {
	const postId = req.params.id;
	const commentId = req.params.commentId;
	const userrId = req.userId;
	try {
		const post = await Post.findOneAndUpdate(
			{ _id: postId, userrId },
			{ $pull: { comments: { _id: commentId } } },
			{ new: true }
		);

		if (!post) {
			return res.status(404).json({
				status: false,
				message: 'Post not found or unauthorized',
			});
		}
		return res
			.status(200)
			.json({ message: 'Comment deleted successfully' });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Failed to delete comment' });
	}
};
const getAllPostsByUserId =async ( req,res)=>{
  const userId = req.params.id;
	try {
		const allPosts = await Post.find({userId}).populate({ path: "comments.user", select: commentDetails });
    ;
		if (!allPosts) {
			return res
				.status(404)
				.json({ status: false, message: 'All posts of users not found' });
		}
		res.status(200).json({
			status: true,
			message: 'All Posts',
			allPosts,
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			status: false,
			message: 'problem with fetching all user posts',
		});
	}
}



module.exports={getAllPostsByUserId,createPost ,getUserByID,getAllComents,addComent, getPost,updatePost,deletePost,likePost,getTimelinePosts,getAllPost,deleteComment}
