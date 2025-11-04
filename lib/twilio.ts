/**
 * Twilio SDK initialization for SMS & WhatsApp
 */
import twilio from "twilio"

export const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

export async function sendSMS(to: string, message: string, mediaUrl?: string) {
  try {
    const response = await twilioClient.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
      body: message,
      mediaUrl: mediaUrl ? [mediaUrl] : undefined,
    })
    return response
  } catch (error) {
    console.error("SMS sending failed:", error)
    throw error
  }
}

export async function sendWhatsApp(to: string, message: string, mediaUrl?: string) {
  try {
    const response = await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
      to: `whatsapp:${to}`,
      body: message,
      mediaUrl: mediaUrl ? [mediaUrl] : undefined,
    })
    return response
  } catch (error) {
    console.error("WhatsApp sending failed:", error)
    throw error
  }
}
