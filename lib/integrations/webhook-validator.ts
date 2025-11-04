/**
 * Webhook signature validation for Twilio
 */
import crypto from "crypto"

export function validateTwilioWebhook(url: string, params: Record<string, any>, twilioSignature: string): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN
  if (!authToken) return false

  // Sort parameters and build the data string
  const data =
    url +
    Object.keys(params)
      .sort()
      .map((key) => key + params[key])
      .join("")

  // Compute HMAC-SHA1
  const computedSignature = crypto.createHmac("sha1", authToken).update(data).digest("Base64")

  return computedSignature === twilioSignature
}
