var express = require('express')
var router = express.Router()
var nodemailer = require('nodemailer');
var axios = require('axios');
var creds = require('../creds.js');

var SITE_SECRET = process.env.CAPTCHA_SITE_SECRET || creds.CAPTCHA_SITE_SECRET; 
const SECRET_PARAM = "secret";
const RESPONSE_PARAM = "response";
const G_RECAPTCHA_RESPONSE = "g-recaptcha-response";
const SITE_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";


var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: creds.MAIL_USER,
    pass: process.env.MAIL_PASS || creds.MAIL_PASS
  }
});

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  console.log('Time: ', new Date())
  next()
})
// define the home page route
router.post('/contactHandler', function (req, res) {
	var name = req.body.name;
	var email= req.body.email;
	var phone = req.body.phone;
	var message = req.body.message;

  /* code to verify captcha  begin */


  if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null)
  {
   req.flash("danger", "Please select captcha ");
   res.redirect('/contact');
 }
  //const secretKey = SITE_SECRET;

  const verificationURL = "https://www.google.com/recaptcha/api/siteverify?secret=" + SITE_SECRET + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;

  axios({
    method:'get',
    url:verificationURL,
    responseType:'json'
  })
  .then(function(response) {
    if(response.data.success){
      console.log(response.data.success);
      var mailOptions = {
        from: creds.MAIL_USER,
        to: creds.MAIL_TO,
        subject: 'Contact Form subumitted Info',
        html: '<p><b>Name: </b>'+name+'<p/><p><b>Email: </b>'+email+'<p/><p><b>Phone: </b>'+phone+'<p/><p><b>Message: </b>'+message+'<p/>That was easy!'
      };

      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
          req.flash("danger", "Failed to Submit Form");
        } else {
          console.log('Email sent: ' + info.response);
        }
      }); 

      req.flash("success", "Form Submitted Successfully");

      res.redirect('/contact');

    }
    else{
      console.log('Error happned with captcha');
      req.flash("danger", "Server Side Captcha verifcation failed");
      res.redirect('/contact');
    }

});

  /* code to verify captcha ends */

})

module.exports = router