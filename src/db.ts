import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    username: { type: String, unique: true },
    password: String
})

const contentSchema = new Schema({
    title: String,
    link: String,
    tags: [{type: mongoose.Types.ObjectId, ref: 'Tag'}],
    userId: {type: mongoose.Types.ObjectId, ref: 'User'},
    authorId: {type: mongoose.Types.ObjectId, ref: 'User'}
})

export const userModel = mongoose.model('User', userSchema)
export const contentModel = mongoose.model('Content', contentSchema)