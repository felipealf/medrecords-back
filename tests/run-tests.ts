import assert from "node:assert/strict";
import { decryptField, encryptField } from "../src/utils/encryption";
import { slugFromEmail } from "../src/utils/slug";

function testEncryption() {
  const original = "Clinical data sample";
  const encrypted = encryptField(original);
  assert.notEqual(encrypted, original, "Encrypted value should differ from original");
  const decrypted = decryptField(encrypted);
  assert.equal(decrypted, original, "Decrypted value should match original");
}

function testSlug() {
  const slug = slugFromEmail("john.doe@medrecords.app");
  assert.equal(slug.startsWith("johndoe-"), true, "Slug should include sanitized local-part");
}

function run() {
  testEncryption();
  testSlug();
  console.log("All tests passed.");
}

run();
