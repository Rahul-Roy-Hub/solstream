import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "cryptonite.devv@gmail.com",
    pass: process.env.MAIL_PASS || "http://localhost:3000",
  },
});

export const sendTransactionMail = async (
  to: string,
  amount: number,
  transactionId: string
) => {
  try {
    const payUrl = `${process.env.API_URL}/pay/${transactionId}`;

    const mailOptions = {
      from: `"SolStream" <cryptonite.devv@gmail.com>`,
      to,
      subject: `Payment Request - SolStream`,
      html: `
        <div style="
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #ffffff;
          color: #222;
          padding: 32px;
          max-width: 600px;
          margin: auto;
          border: 1px solid #e5e5e5;
          border-radius: 12px;
        ">
          <h2 style="margin-top: 0; font-weight: 600; font-size: 20px;">
            💸 Payment Request
          </h2>
          <p style="font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
            You've received a new <strong>payment request</strong> from <span style="color:#111;">SolStream</span>.
          </p>
          <div style="
            background: #f9f9f9;
            padding: 16px 20px;
            border-radius: 8px;
            border: 1px solid #e5e5e5;
            margin-bottom: 24px;
          ">
            <p style="margin: 0; font-size: 14px; color: #555;">
              <strong>Requested Amount:</strong>
              <span style="font-size: 16px; font-weight: 600; color: #111;">$${amount}</span>
            </p>
          </div>
          <a href="${payUrl}" 
            style="
              display: inline-block;
              text-decoration: none;
              background-color: #111;
              color: #fff;
              font-size: 14px;
              padding: 12px 20px;
              border-radius: 8px;
              font-weight: 500;
            ">
            👉 Pay with SolStream
          </a>
          <p style="font-size: 12px; color: #888; margin-top: 32px;">
            If you didn’t expect this request, you can safely ignore this email.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
  } catch (err) {
    console.error("Error sending transaction email:", err);
  }
};
export const sendMerchantMail = async (
  merchantMail: string,
  from: string,
  amount: number,
  signature: string,
  chainId?: string
) => {
  try {
    // Determine the correct block explorer URL based on chain
    let explorerUrl: string;
    let explorerName: string;
    
    // Only Solana is supported
    explorerUrl = `https://explorer.solana.com/tx/${signature}`;
    explorerName = "Solana Explorer";

    const mailOptions = {
      from: `"SolStream" <cryptonite.devv@gmail.com>`,
      to: merchantMail,
      subject: `💰 Payment Received - SolStream`,
      html: `
        <div style="
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #ffffff;
          color: #222;
          padding: 32px;
          max-width: 600px;
          margin: auto;
          border: 1px solid #e5e5e5;
          border-radius: 12px;
        ">
          <h2 style="margin-top: 0; font-weight: 600; font-size: 20px; color: #111;">
            ✅ Payment Confirmation
          </h2>
          <p style="font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
            You’ve <strong>received a payment</strong> via <span style="color:#111;">SolStream</span>.
          </p>

          <div style="
            background: #f9f9f9;
            padding: 16px 20px;
            border-radius: 8px;
            border: 1px solid #e5e5e5;
            margin-bottom: 24px;
          ">
            <p style="margin: 0 0 8px; font-size: 14px; color: #555;">
              <strong>Payer:</strong> <span style="color:#111;">${from}</span>
            </p>
            <p style="margin: 0 0 8px; font-size: 14px; color: #555;">
              <strong>Amount:</strong> <span style="font-size: 16px; font-weight: 600; color: #111;">$${amount}</span>
            </p>
            <p style="margin: 0; font-size: 14px; color: #555;">
              <strong>Transaction ID:</strong> <span style="color:#111;">${signature}</span>
            </p>
          </div>

          <a href="${explorerUrl}" 
            style="
              display: inline-block;
              text-decoration: none;
              background-color: #111;
              color: #fff;
              font-size: 14px;
              padding: 12px 20px;
              border-radius: 8px;
              font-weight: 500;
            ">
            🔍 Verify on ${explorerName}
          </a>

          <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />

          <p style="font-size: 14px; color: #555; margin-bottom: 4px;">
            <strong>Invoice Summary</strong>
          </p>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #eee;">Description</td>
              <td style="padding: 8px; border: 1px solid #eee;">Payment from ${from}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #eee;">Amount</td>
              <td style="padding: 8px; border: 1px solid #eee;">$${amount}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #eee;">Transaction</td>
              <td style="padding: 8px; border: 1px solid #eee;">
                <a href="${explorerUrl}" style="color:#0070f3; text-decoration:none;">View on ${explorerName}</a>
              </td>
            </tr>
          </table>

          <p style="font-size: 12px; color: #888; margin-top: 16px;">
            This is an automated payment receipt from SolStream.  
            For any issues, please contact our support team.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Merchant email sent successfully:", {
      messageId: info.messageId,
      to: merchantMail,
      signature,
      chainId,
    });
  } catch (err) {
    console.error("Error sending merchant email:", {
      error: err,
      merchantMail,
      signature,
      chainId,
      details: err instanceof Error ? err.message : String(err),
    });
    // Re-throw to let caller know email failed
    throw err;
  }
};
