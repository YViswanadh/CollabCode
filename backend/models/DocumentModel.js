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
            type: Buffer,
            required: [true, 'Yjs Document State is required'],
            // Yjs returns Uint8Array; convert explicitly so Mongoose accepts it
            set: (v) => (v instanceof Uint8Array ? Buffer.from(v) : v),
        }
    },
    {
        timestamps:true
    }
)

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;