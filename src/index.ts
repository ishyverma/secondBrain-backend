import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { contentModel, linkModel, userModel } from "./db";
import mongoose from "mongoose";
import dotenv from "dotenv"
import { JWT_SECRET } from "./config";
import { userMiddleware } from "./middleware";
import { linkGenerator } from "./link";
import cors from "cors"

const app = express()
app.use(express.json())
app.use(cors())

dotenv.config()

const connectMongo = async () => {
    await mongoose.connect(`${process.env.MONGO_URL}/SecondBrain`)
    console.log('Database Connected')
}
connectMongo()

app.post("/api/v1/signup", async (req, res) => {
    const { username, password } = req.body
    try {
        const user = await userModel.create({ username, password })
        res.json({
            message: 'User is signed up'
        })
    } catch (err) {
        res.status(411).json({
            err
        })
    }
})

app.post("/api/v1/signin", async (req, res) => {
    const { username, password } = req.body
    try {
        const user = await userModel.findOne({ username, password })
        if (user) {
            const token = jwt.sign({ username, id: user._id }, JWT_SECRET)
            res.json({
                token
            })
        } else {
            res.status(411).json({
                message: 'Invalid username'
            })
        }

    } catch (err) {
        res.status(411).json({
            message: "User Not Exists"
        })
    }
})

app.get("/api/v1/brain/:shareLink", async (req, res) => {
    const { shareLink } = req.params
    const link = await linkModel.findOne({ hash: shareLink })
    if (!link) {
        res.status(411).json({
            message: "No brain exists"
        })
        return 
    }
    const user = await userModel.findOne({ _id: link.userId})
    const content = await contentModel.find({ userId: link.userId})
    res.json({
        username: user?.username,
        content
    })
})

app.use(userMiddleware)

app.post("/api/v1/content", async (req, res) => {
    const { title, link, type } = req.body
    try {
        // @ts-ignore
        const content = await contentModel.create({ title, link, userId: req.userId, tags: [], type })
        res.json({
            content
        })
    } catch (err) {
        res.json({
            message: err
        })
    }
})

app.get("/api/v1/content", async (req, res) => {
    // @ts-ignore
    const userId = req.userId
    try {
        const content = await contentModel.find({ userId: userId }).populate("userId", "username")
        res.json({ content })
    } catch (err) {
        res.status(411).json({
            message: err
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
                message: 'Content is deleted'
            })
        } else {
            res.status(411).json({
                message: "Content is not there"
            })
        }
    } catch (err) {
        res.status(411).json({
            message: err
        })
    }
})

app.post("/api/v1/brain/share", async (req, res) => {
    const { share }   = req.body
    // @ts-ignore
    const userId = req.userId
    if (share) {
        const isLink = await linkModel.findOne({ userId })
        if (isLink) {
            res.json({
                link: isLink.hash
            })
            return 
        }
        const link = await linkModel.create({
            userId,
            hash: linkGenerator(10)
        })
        res.json({
            link: link.hash
        })
    } else {
        await linkModel.deleteOne({ userId })
        res.json({
            message: "Link removed successfully"
        })
    }
    
})

app.listen(process.env.PORT)