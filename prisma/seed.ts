import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { encryptField } from "../src/utils/encryption";
import { slugFromEmail } from "../src/utils/slug";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@medrecords.app";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return;

  const user = await prisma.user.create({
    data: {
      username: "demo",
      email,
      passwordHash: await bcrypt.hash("Demo@123", 10),
      publicAccessPasswordHash: await bcrypt.hash("Public@123", 10),
      publicProfileSlug: slugFromEmail(email),
      publicProfileEnabled: true
    }
  });

  await prisma.clinicalProfile.create({
    data: {
      userId: user.id,
      firstNameEnc: encryptField("John"),
      lastNameEnc: encryptField("Doe"),
      sexEnc: encryptField("male"),
      emergencyContactNameEnc: encryptField("Jane Doe"),
      emergencyContactPhoneEnc: encryptField("+55 11 90000-0000"),
      emergencyContactEmailEnc: encryptField("jane@doe.com"),
      bloodTypeEnc: encryptField("O+"),
      allergiesEnc: encryptField("Penicillin"),
      medicationsEnc: encryptField("Ibuprofen"),
      diseasesEnc: encryptField("Hypertension"),
      surgeriesEnc: encryptField("Appendectomy"),
      notesEnc: encryptField("Patient carries inhaler.")
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
