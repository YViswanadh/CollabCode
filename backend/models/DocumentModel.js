const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
    {
        roomId:{
            type : String,
            required : [true, 'roomId is required'],
            unique : true,
            index : true, 
            trim : true
        },

        yjsDocumentState : {
            type:Buffer,
            required:[true, 'Yjs Document State is required']
        }
    },
    {
        timestamps:true
    }
)

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;