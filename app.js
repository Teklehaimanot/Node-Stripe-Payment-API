const express = require('express')
require("dotenv").config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_TEST)
const cors = require('cors')
const app = express()

app.use(express.json())
app.use(cors())

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