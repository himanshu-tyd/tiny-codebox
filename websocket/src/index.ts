import express ,{ type Request, type Response } from "express";
import WebSocket, { WebSocketServer } from "ws";
import http from "http"




const app=express()


app.get('/', (req: Request , res: Response)=>{
    res.send("hello there")
})

const server=http.createServer(app)

const ws=new WebSocketServer({server})


let user=0

ws.on('connection', (socket, id)=>{

    console.log('socket', socket)

    user++
    socket.on('error', (e)=>console.log(e)); 

    console.log('user is connect', user)

    socket.on('message', (data, isBinary)=>{
        ws.clients.forEach((client)=>{
            if(client.readyState===WebSocket.OPEN){
                
                client.send(data, {binary: isBinary})
            }
        })  
    })

})

server.listen(8000, ()=>{
    console.log('server is running')
})


