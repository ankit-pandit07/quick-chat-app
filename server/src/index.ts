import express, { Application } from "express"
import dotenv from "dotenv"
import cors from "cors"
import Routes from "./routes/index.js"
import { Server } from "socket.io"
import { createServer } from "http"
import { createAdapter } from "@socket.io/redis-streams-adapter"
import { setupSocket } from "./socket.js"
import redis from "./config/redis.config.js"
import { instrument } from "@socket.io/admin-ui"


const app:Application=express()
const server=createServer(app)
const io=new Server(server,{
    cors:{
        origin:["http://localhost:3000","https://admin.socket.io"],
        credentials:true
    },
    adapter:createAdapter(redis)
})


instrument(io,{
    auth:false,
    mode:"development"
})

setupSocket(io)
export {io}

const PORT=process.env.PORT || 7000;
dotenv.config();

//Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({
    extended:false
}))

//Routes
app.use("/api",Routes)

app.get("/",(req,res)=>{
    return res.send("ankit pandit")
})

server.listen(PORT,()=>console.log(`Server is running on PORT ${PORT}`))