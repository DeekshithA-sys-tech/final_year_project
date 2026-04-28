const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        // Create a test ethereal account if no real credentials are provided
        let transporter;

        if (process.env.SMTP_HOST) {
            transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                auth: {
                    user: process.env.SMTP_EMAIL,
                    pass: process.env.SMTP_PASSWORD,
                },
            });
        } else {
            // Mock email for local testing
            let testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
        }

        const message = {
            from: `${process.env.FROM_NAME || 'TB Detect Pro'} <${process.env.FROM_EMAIL || 'noreply@tbdetect.com'}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html,
        };

        const info = await transporter.sendMail(message);

        console.log("Message sent: %s", info.messageId);
        if (!process.env.SMTP_HOST) {
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }

    } catch (error) {
        console.error("Email sending failed: ", error);
        throw new Error('Email could not be sent');
    }
};

module.exports = sendEmail;
