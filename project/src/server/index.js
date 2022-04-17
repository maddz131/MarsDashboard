require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get(/\/*(.js)$/, express.static(path.join(__dirname, '../public')))
app.get(/\/*(.css)$/, express.static(path.join(__dirname, '../public')))

app.get('/apod', async (req, res) => {
    try {
        let image = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`,  { 
            mode: 'no-cors' // 'cors' by default
        })
            .then(res => res.json())
        res.send({ image })
    } catch (err) {
        console.log('error:', err);
    }
})

// your API calls
app.get(/\/*\/(data)$/, async (req, res) => {
    let rover = req.url.slice(0, -4)
    try {
        let data = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${rover}?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send({ data })
    } catch (err) {
        console.log('error:', err);
    }
})


app.get(/\/*\/(photos)$/, async (req, res) => {
    let rover = req.url.slice(0, -6)
    //let date = req.
    try {
        let images = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/latest_photos?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send({ images })
    } catch (err) {
        console.log('error:', err);
    }
})


app.get('/*', async (req, res) => {
    res.sendFile(path.resolve(__dirname, "../public", "index.html"))
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))