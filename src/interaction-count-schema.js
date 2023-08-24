const {Schema, model, models} = require("mongoose");

const interactionCountSchema = new Schema({
    _id:{
        type: String,
        required: true
    },
    interactionCount:{
        type: Number,
        required: true
    }
});

const name = "interaction-counts"
module.exports = models[name] || model(name, interactionCountSchema);