const sgMail = require("@sendgrid/mail");

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

sgMail.setApiKey(SENDGRID_API_KEY);

// Send welcome Email //

const sendWelcomeEmail = (name , email) => {
  const mailContent = {
    to: "saad.amjad2983035@gmail.com",
    from: email,
    subject: "welcome to profile-wishlist-application",
    text: `Hello ${name} , 
                         this is the welcome email at the time of profile creation`
   
  };

  sgMail.send(mailContent);
};

// Send Good bye Email //

const sendGoodByeEmail = (name , email) => {
    const mailContent = {
      to: "saad.amjad2983035@gmail.com",
      from: email,
      subject: "Good bye from profile-wishlist-application",
      text: `Hello ${name} , 
                           Hope to see you soon`
     
    };
  
    sgMail.send(mailContent);
  };


module.exports = {sendWelcomeEmail , sendGoodByeEmail}