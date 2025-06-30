#!/usr/bin/env node

const { Command } = require("commander");
const jwt = require("jsonwebtoken");

const program = new Command();

program
  .name("jwt-checker")
  .description("Decode and optionally verify a JWT token (like jwt.io)")
  .version("1.0.0")
  .requiredOption("-t, --token <jwt>", "JWT token to decode")
  .option("-s, --secret <key>", "Secret or public key to verify the token");

program.parse(process.argv);
const { token, secret } = program.opts();

// ✅ Handle: jwt-checker --token help
if (token.toLowerCase() === "help") {
  console.log(`
🛠 Usage:
  jwt-checker --token <JWT> [--secret <key>]

📋 Examples:
  jwt-checker --token eyJhbGciOi...             # Decode only
  jwt-checker --token eyJhbGciOi... --secret mysecret  # Decode + Verify signature

💡 Tip:
  You can copy a token from jwt.io and test it here.
  No secret = only decoding, like jwt.io UI.

🔗 Project:
  https://github.com/your-repo/jwt-checker-cli
  `);
  process.exit(0);
}

// ✅ Proceed with normal logic
function decodeJWT(token) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT. Must have 3 parts.");
  }

  const decodeBase64 = (str) => Buffer.from(str, "base64url").toString("utf-8");

  try {
    const header = JSON.parse(decodeBase64(parts[0]));
    const payload = JSON.parse(decodeBase64(parts[1]));
    return { header, payload };
  } catch (err) {
    throw new Error("Failed to decode: " + err.message);
  }
}

try {
  const { header, payload } = decodeJWT(token);

  console.log("\n🔐 Header:\n", JSON.stringify(header, null, 2));
  console.log("\n📦 Payload:\n", JSON.stringify(payload, null, 2));

  if (secret) {
    jwt.verify(token, secret, (err) => {
      if (err) {
        console.error("\n❌ Signature invalid:", err.message);
      } else {
        console.log("\n✅ Signature is valid.");
      }
    });
  } else {
    console.log("\nℹ️ No secret provided, skipping signature verification.");
  }
} catch (err) {
  console.error("\n🚫 Error:", err.message);
}
