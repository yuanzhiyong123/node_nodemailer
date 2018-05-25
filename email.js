'use strict';
const nodemailer = require('nodemailer');

// Generate test SMTP service account from ethereal.email
// Only needed if you don't have a real mail account for testing
module.exports = function(email,code) {
    console.log('hello');
    nodemailer.createTestAccount((err, account) => {
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            service: 'qq',  //使用qq服务
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: 'xxxx@qq.com', // 自己的邮箱
                pass: 'xxx' // 这个
            }
        });
    
        // setup email data with unicode symbols
        let mailOptions = {
            from: 'xxx@qq.com', // sender address
            to: `${email}`, // list of receivers
            subject: '邮箱验证', // Subject line
            text: 'Hello world?', // plain text body
            html: '<h2>恭喜您注册成功！请点击下面链接进行激活！</h2>' // html body
        };
    
        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('发送成功');
            console.log('Message sent: %s', info.messageId);
            // Preview only available when sending through an Ethereal account
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    
            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
        });
    });
}


