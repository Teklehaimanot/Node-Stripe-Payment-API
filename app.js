const express = require('express')
const path = require('path')
require('dotenv/config')
const secreteKey = process.env.STRIPE_SECRET_TEST
const stripe = require('stripe')(secreteKey)
const cors = require('cors')
const app = express()

app.use(express.json())
app.use(cors())


// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, 'myshop/build')));

app.get('/', (req, res) => {
    res.json({ message: 'Hello from server' })
})
app.post('/payment', async (req, res) => {
    let { amount, id } = req.body
    try {
        const payment = await stripe.paymentIntents.create({
            amount,
            currency: "USD",
            description: "Gebeya company",
            payment_method: id,
            confirm: true
        })
        console.log("Payment", payment)
        res.json({
            message: "Payment successful",
            success: true
        })
    } catch (error) {
        console.log("Error", error)
        res.json({
            message: "Payment failed",
            success: false
        })
    }
})

app.listen(process.env.PORT || 5000, () => {
    console.log('server started')
})