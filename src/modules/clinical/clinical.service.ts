import { prisma } from "../../config/prisma";
import { decryptField, encryptField } from "../../utils/encryption";
import { AppError } from "../../utils/errors";

type ClinicalInput = {
  firstName: string;
  lastName: string;
  sex: "male" | "female" | "other" | "prefer_not_to_say";
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactEmail?: string;
  bloodType: string;
  allergies: string;
  medications: string;
  diseases: string;
  surgeries: string;
  notes?: string;
};

export async function upsertClinicalProfile(userId: string, input: ClinicalInput) {
  const profile = await prisma.clinicalProfile.upsert({
    where: { userId },
    create: {
      userId,
      firstNameEnc: encryptField(input.firstName),
      lastNameEnc: encryptField(input.lastName),
      sexEnc: encryptField(input.sex),
      emergencyContactNameEnc: encryptField(input.emergencyContactName),
      emergencyContactPhoneEnc: encryptField(input.emergencyContactPhone),
      emergencyContactEmailEnc: input.emergencyContactEmail ? encryptField(input.emergencyContactEmail) : null,
      bloodTypeEnc: encryptField(input.bloodType),
      allergiesEnc: encryptField(input.allergies),
      medicationsEnc: encryptField(input.medications),
      diseasesEnc: encryptField(input.diseases),
      surgeriesEnc: encryptField(input.surgeries),
      notesEnc: input.notes ? encryptField(input.notes) : null
    },
    update: {
      firstNameEnc: encryptField(input.firstName),
      lastNameEnc: encryptField(input.lastName),
      sexEnc: encryptField(input.sex),
      emergencyContactNameEnc: encryptField(input.emergencyContactName),
      emergencyContactPhoneEnc: encryptField(input.emergencyContactPhone),
      emergencyContactEmailEnc: input.emergencyContactEmail ? encryptField(input.emergencyContactEmail) : null,
      bloodTypeEnc: encryptField(input.bloodType),
      allergiesEnc: encryptField(input.allergies),
      medicationsEnc: encryptField(input.medications),
      diseasesEnc: encryptField(input.diseases),
      surgeriesEnc: encryptField(input.surgeries),
      notesEnc: input.notes ? encryptField(input.notes) : null
    }
  });

  return { id: profile.id, updatedAt: profile.updatedAt };
}

export async function getClinicalProfile(userId: string) {
  const profile = await prisma.clinicalProfile.findUnique({ where: { userId } });
  if (!profile) throw new AppError("Clinical profile not found.", 404);

  return {
    firstName: decryptField(profile.firstNameEnc),
    lastName: decryptField(profile.lastNameEnc),
    sex: decryptField(profile.sexEnc),
    emergencyContactName: decryptField(profile.emergencyContactNameEnc),
    emergencyContactPhone: decryptField(profile.emergencyContactPhoneEnc),
    emergencyContactEmail: profile.emergencyContactEmailEnc
      ? decryptField(profile.emergencyContactEmailEnc)
      : null,
    bloodType: decryptField(profile.bloodTypeEnc),
    allergies: decryptField(profile.allergiesEnc),
    medications: decryptField(profile.medicationsEnc),
    diseases: decryptField(profile.diseasesEnc),
    surgeries: decryptField(profile.surgeriesEnc),
    notes: profile.notesEnc ? decryptField(profile.notesEnc) : null,
    updatedAt: profile.updatedAt
  };
}
