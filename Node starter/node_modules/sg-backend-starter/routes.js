const express = require('express');
const { OneSide, ManySide } = require('./models');

const router = express.Router()

router.post('/new', async (req, res) => {
    try{
        const ujTelefon = await ManySide.create(req.body);
        res.status(201).json({"_id": ujTelefon._id})
    }
    catch(error){
        if (error.name === 'ValidationError') {
            return res.status(400).json({message: "Hiányos vagy érvénytelen adatok"})
        }

        if (error.code === 11000) {
            return res.status(409).json({message: "Már létezik ilyen telefon"})
        }

        console.error(error)
        res.status(500).json({message: "Szerver hiba"})
    }
})

router.get('/manyside', async (req, res) => {
    try{
        const data = await ManySide.find().populate('foreignId', '-_id');
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

router.get('/manyside/:id', async (req, res) => {
    try{
        const data = await ManySide.findById(req.params.id)
        .populate('foreignId', '-_id')
        if (data) {
            res.json(data)
        } else {
            res.status(404).json({message: 'Nincs ilyen azonosítóval rendelkező elem.'})
        }
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

router.patch('/manyside/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updatedData = req.body;
        const options = { returnDocument: 'after', runValidators: true }; 
        // hogy a frissítés utáni dokumentumot kapjuk vissza
        const result = await ManySide.findByIdAndUpdate(
            id, updatedData, options
        )
        if (result) {
            res.send(result)
        } else {
            res.status(404).json({ message: `${id} azonosítóval nem létezik elem!`  })
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

router.delete('/manyside/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const data = await ManySide.findByIdAndDelete(id)
        res.send(`A ${data.nev} nevű elem törölve lett.`)
	// Ha csak a 204-es státuszkódot akarod visszaküldeni, akkor: res.sendStatus(204)!
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

module.exports = router;