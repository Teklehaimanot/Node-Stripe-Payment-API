const express = require('express')
const path = require('path')
const axios = require("axios").default
require('dotenv/config')
const secreteKey = process.env.STRIPE_SECRET_TEST
const stripe = require('stripe')(secreteKey)
// const PORT = process.env.PORT || 4400
const cors = require('cors')
const app = express()

const CHAPA_URL = process.env.CHAPA_URL || "https://api.chapa.co/v1/transaction/initialize"
const CHAPA_AUTH = process.env.CHAPA_AUTH // || register to chapa and get the key

app.use(express.json())
app.use(cors())

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, 'myshop/build')));

// req header with chapa secret key
const config = {
    headers: {
        Authorization: `Bearer ${CHAPA_AUTH}`
    }
}

app.get('/', (req, res) => {
    res.json({ message: 'Hello from server' })
})


// initial payment endpoint
app.post("/api/pay", async (req, res) => {

    // chapa redirect you to this url when payment is successful
    const CALLBACK_URL = "http://localhost:5000/api/success/"

    // a unique reference given to every transaction
    const TEXT_REF = "tx-gebeyashop-" + Date.now()

    const { amount, email, first_name, last_name } = req.body
    // form data
    const data = {
        amount: amount,
        currency: 'ETB',
        email: email,
        first_name: first_name,
        last_name: last_name,
        tx_ref: TEXT_REF,
        callback_url: CALLBACK_URL + TEXT_REF
    }
    // post request to chapa
    await axios.post(CHAPA_URL, data, config)
        .then((response) => {
            // res.redirect(response.data.data.checkout_url)
            res.json(response.data)
        })
        .catch((err) => {
            res.json({ message: 'payment faild' })
        })
})

// verification endpoint
app.get("/api/success/:id", async (req, res) => {

    //verify the transaction 
    await axios.get("https://api.chapa.co/v1/transaction/verify/" + req.params.id, config)
        .then((response) => {
            console.log(response)
            res.json(response.data)
            // res.render("success") //redirect to success page
        })
        .catch((err) => console.log("Payment can't be verfied", err))
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