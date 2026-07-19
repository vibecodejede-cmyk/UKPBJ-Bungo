import { Secret, TOTP } from 'otpauth'
import QRCode from 'qrcode'

// Nama issuer yang tampil di aplikasi Google Authenticator.
const ISSUER = 'Portal UKPBJ Bungo'

// Generate a new random TOTP secret (base32 string).
export function generateTotpSecret() {
  return new Secret({ size: 20 }).base32
}

// Build an otpauth:// URI that can be rendered as a QR / barcode for Google
// Authenticator and other compatible TOTP apps.
export function buildTotpUri(secret, accountEmail, accountName) {
  const totp = new TOTP({
    issuer: ISSUER,
    label: accountName || accountEmail,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(secret),
  })
  return totp.toString()
}

// Render the otpauth URI as a data-URL PNG (barcode) for display.
export async function buildQrDataUrl(secret, accountEmail, accountName) {
  const uri = buildTotpUri(secret, accountEmail, accountName)
  return QRCode.toDataURL(uri, {
    width: 240,
    margin: 2,
    color: { dark: '#1B1B1F', light: '#FFFFFF' },
  })
}

// Verify a 6-digit code against the stored secret. Allows a small window
// (±1 step) to tolerate clock drift between server and the user's device.
export function verifyTotp(secret, token) {
  if (!secret || !token) return false
  try {
    const totp = new TOTP({
      issuer: ISSUER,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: Secret.fromBase32(secret),
    })
    const delta = totp.validate({ token, window: 1 })
    return delta !== null
  } catch {
    return false
  }
}
