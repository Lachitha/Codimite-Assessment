import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
    {
        firstname:{ 
            type: String,
            maxLenght: 50, 
            required: true
         },
        lastname:{
            type: String,
            maxLenght: 50,
            required: true
        },
        email:{
            type: String,
            required: true,
            unique: true
        },
        password:{
            type: String,
            minLenght : 6,
            required: true
        },
        phoneNo:{
            type: String,
            maxLenght: 10,
            required: true
        }
    },
);
    export default mongoose.model("Customer", customerSchema);