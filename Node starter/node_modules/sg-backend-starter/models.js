const mongoose = require('mongoose')

// Egy a többhöz kapcsolat - OneToMany join
// A kapcsolatot az _id és a foreignId biztosítja

const OneSideSchema = new mongoose.Schema({
  _id: {
    type: Number,
    required: true
  },
  nev: {
    type: String,
    required: true,
    unique: true,
    maxlength: [30, 'A név nem tartalmazhat 30 karakternél többet!'],
  }
})


const ManySideSchema = new mongoose.Schema({
    _id: {
        type: Number,
        required: [true, 'Az azonosító megadása kötelező!']
    },
    nev: {
        type: String,
        required: [true, 'A név megadása kötelező!'],
        unique: true,
        maxlength: [50, 'A név nem lehet hosszabb 50 karakternél!']
    },
    ar: {
        type: Number,
        default: 0
    },
    szin: {
        type: String,
        default: "fekete"
    },
    foreignId: {
        type: Number,
        ref: 'OneSide'
    }
})

module.exports.OneSide = mongoose.model('OneSide', OneSideSchema, 'onesides')
module.exports.ManySide = mongoose.model('ManySide', ManySideSchema, 'manysides') // manysides névvel lesz létrehozva a kollekció (kis és nagy betű számít!!!).