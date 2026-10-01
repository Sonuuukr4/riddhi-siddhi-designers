/** Shared enquiry validation — used by the form (client) and the API route (server). */

export type Enquiry = {
  name: string;
  phone: string;
  email: string;
  projectType: string;
  location: string;
  message: string;
};

export type EnquiryErrors = Partial<Record<keyof Enquiry, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[+()\-\s\d]{8,20}$/;

export function validateEnquiry(input: Partial<Record<keyof Enquiry, unknown>>): {
  data: Enquiry;
  errors: EnquiryErrors;
} {
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const data: Enquiry = {
    name: str(input.name, 120),
    phone: str(input.phone, 30),
    email: str(input.email, 160),
    projectType: str(input.projectType, 60),
    location: str(input.location, 160),
    message: str(input.message, 2000),
  };

  const errors: EnquiryErrors = {};
  if (data.name.length < 2) errors.name = "Please enter your name.";
  if (!PHONE.test(data.phone)) errors.phone = "Please enter a phone number we can call.";
  if (data.email && !EMAIL.test(data.email)) errors.email = "That email address doesn’t look complete.";

  return { data, errors };
}
