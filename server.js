const http = require("http");
const express = require ("express");
const {Server} = require('socket.io');
const path = require('path');
const mongoose =require ('mongoose');

// Connect to MongoDB
mongoose.set('strictQuery', true);



const connection =  async () => {

    try {
          await mongoose.connect("mongodb+srv://bk:143@socket.vq4kb3r.mongodb.net/?retryWrites=true&w=majority", {
    useUnifiedTopology: true,
    useNewUrlParser: true
 });
 console.log("database connected successfully");
} catch (error){
    console.log("error while connecting with db",error.message);
}
}

// Define a Mongoose schema for the form data
const FormDataSchema = new mongoose.Schema({
  name: String,
  email: String,
  status: Number,
});

const FormData = mongoose.model('FormData', FormDataSchema);




const app = express();

const server = http.createServer(app);
const io = new Server(server);

//socket.io
io.on("connection", (socket) =>{
    console.log("a new user connected to socket" + socket.id);
    socket.on('user-data',(emailValue,nameValue,statusValue) =>{
        console.log(emailValue,nameValue,statusValue);

         // Create a new FormData document
    const formData = new FormData({
        name: nameValue,
        email:emailValue ,
        status: statusValue
      });
  
      // Save the form data to MongoDB
      formData.save((err, savedData) => {
        if (err) {
          console.error('Error saving form data:', err);
          return;
        }
  
        console.log('Form data saved successfully:', savedData);
  
        // Increment the status and emit it back to the client
        const newStatus = savedData.status + 1;
       // io.emit("data", emailValue,nameValue);
        socket.emit("data", emailValue,nameValue,newStatus);
    })
});
})

app.use(express.static(path.join(__dirname,"/public")));

app.get('/',(req,res)=>{
    res.sendFile("../public/index.js");
})

const PORT = process.env.PORT || 8000;

connection();
server.listen(PORT,()=>{
    console.log(`server is ruuning on port ${PORT}`);
})

