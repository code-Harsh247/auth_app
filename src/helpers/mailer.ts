import User from "@/models/userModel";
import nodemailer from "nodemailer";
import bcryptjs from "bcryptjs";

interface SendEmailParams {
  email: string;
  emailType: "VERIFY" | "RESET_PASSWORD";
  userId: string; // Assuming userId is a string, adjust the type as necessary
}

export const sendEmail = async ({ email, emailType, userId }: SendEmailParams) => {
  try {
    const hashedToken = await bcryptjs.hash(userId.toString(), 10);

    if (emailType === "VERIFY") {
      await User.findByIdAndUpdate(userId, {
        verificationToken: hashedToken,
        verificationTokenExpiry: Date.now() + 3600000,
      });
    } else if (emailType === "RESET_PASSWORD") {
      await User.findByIdAndUpdate(userId, {
        forgotPasswordToken: hashedToken,
        forgotPasswordTokenExpiry: Date.now() + 3600000,
      });
    }

    const transport = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.MAILTRAP_USERNAME,
        pass: process.env.MAILTRAP_PASSWORD,
      },
    });

    const mailOptions = {
      from: "justharsh2407@gmail.com",
      to: email,
      subject: emailType === "VERIFY" ? "Verify your email" : "Reset your password",
      html: `<p>Click <a href="${process.env.DOMAIN}/verifyemail?token=${hashedToken}">here</a> to ${emailType === "VERIFY" ? "verify your email" : "reset your password"}</p>`
    };

    const mailresponse = await transport.sendMail(mailOptions);
    return mailresponse;

  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    } else {
      throw new Error('An unknown error occurred');
    }
  }
};