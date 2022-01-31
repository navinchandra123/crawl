import mongoose from 'mongoose';

const databaseSchema = new mongoose.Schema({
    link: {
        type:String, 
        required: true,
        default: "",
        
    },
    questionName: {
        type:String , 
        default: "",
    },
    Viewed: {
        type:String,
        default: "",
    },
    upvoteCount: {
        type:String,
        default: "",
    },
    answerCount: {
        type:String,
        default: "",
    },
});

const database = mongoose.model('DATABASE', databaseSchema);
export default database ;