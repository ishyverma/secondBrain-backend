import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { contentModel, userModel } from "./db";
import mongoose from "mongoose";
import dotenv from "dotenv"
import { JWT_SECRET } from "./config";
import { userMiddleware } from "./middleware";

const app = express()
app.use(express.json())

dotenv.config()

const connectMongo = async () => {
    await mongoose.connect(`${process.env.MONGO_URL}/SecondBrain`)
    console.log('Database Connected')
}
connectMongo()

app.post("/api/v1/signup", async (req, res) => {
    const { username, password } = req.body
    const hashedPassword = await bcrypt.hash(password, 5)
    try {
        const user = await userModel.create({ username, password: hashedPassword })
        res.json({
            Message: 'User is signed up'
        })
    } catch (err) {
        console.log('Error Creating User: ', err)
        res.status(411).json({
            ErrorMessage: 'User is registered'
        })
    }
})

app.post("/api/v1/signin", async (req, res) => {
    const { username, password } = req.body
    try {
        const user = await userModel.findOne({ username })
        if (user) {
            const token = jwt.sign({ username, id: user._id }, JWT_SECRET)
            res.json({
                Token: token
            })
        } else {
            res.status(411).json({
                ErrorMessage: 'Invalid Credentials'
            })
        }

    } catch (err) {
        console.log('User Not Found: ', err)
        res.status(411).json({
            ErrorMessage: "User Not Exists"
        })
    }
})

app.use(userMiddleware)

app.post("/api/v1/content", async (req, res) => {
    const { title, link } = req.body
    try {
        // @ts-ignore
        const content = await contentModel.create({ title, link, userId: req.userId, tags: []})
        res.json({
            Message: 'Content created successfully'
        })
    } catch (err) {
        res.json({
            ErrorMessage: err
        })
    }
})

app.get("/api/v1/content", async (req, res) => {
    // @ts-ignore
    const userId = req.userId
    try {
        const content = await contentModel.find({ userId: userId }).populate("userId", "username")
        res.send({ content })
    } catch (err) {
        res.status(411).json({
            ErrorMessage: err
        })
    }
})

app.delete("/api/v1/content", async (req, res) => {
    // @ts-ignore
    const userId = req.userId
    const { contentId } = req.body
    try {
        const content = await contentModel.deleteOne({ userId, _id: contentId })
        if ( content.deletedCount ) {
            res.json({
                Message: 'Content is deleted'
            })
        } else {
            res.status(411).json({
                ErrorMessage: "Content is not there"
            })
        }
    } catch (err) {
        res.status(411).json({
            ErrorMessage: err
        })
    }
})

app.post("/api/v1/brain/share", (req, res) => {
    
})

app.get("/api/v1/brain/:shareLink", (req, res) => {

})

app.listen(process.env.PORT)