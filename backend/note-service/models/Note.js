const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
    authorId:       { type: String, required: true },
    authorRole:     { type: String, enum: ['lecturer', 'admin'], required: true },
    type:           { type: String, enum: ['announcement'], default: 'announcement' },
    visibility:     { type: String, enum: ['class'], default: 'class' },
    linkedTo:       { type: { type: String }, id: { type: String } },
    title:          { type: String, required: true },
    body:           { type: String, default: '' },
    attachmentUrl:  { type: String, default: '' },
    attachmentName: { type: String, default: '' },
    views:          [{ type: String }]
}, { timestamps: true });

NoteSchema.index({ authorId: 1 });
NoteSchema.index({ 'linkedTo.id': 1 });

module.exports = mongoose.model('Note', NoteSchema);
