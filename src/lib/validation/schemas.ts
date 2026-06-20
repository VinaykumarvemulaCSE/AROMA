import { z } from "zod";

// Phone validation for Indian numbers (10 digits)
const phoneRegex = /^[6-9]\d{9}$/;

export const orderItemSchema = z.object({
  id: z.string().min(1, "Item ID is required"),
  qty: z.number().int().positive("Quantity must be greater than 0"),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().regex(phoneRegex, "Invalid 10-digit phone number"),
  method: z.enum(["phone", "email", "whatsapp"]),
  note: z.string().max(500).optional(),
  cutlery: z.boolean().default(false),
});

export const addressSchema = z.object({
  line1: z.string().min(5, "Address line 1 is too short"),
  line2: z.string().max(200).optional(),
  landmark: z.string().max(100).optional(),
  city: z.string().min(2),
  pin: z.string().regex(/^\d{6}$/, "Invalid 6-digit pincode"),
  phone: z.string().regex(phoneRegex, "Invalid phone number"),
  type: z.enum(["Home", "Work", "Other"]).catch("Other"),
  notes: z.string().max(500).optional(),
});

export const orderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "Order must contain at least one item"),
  couponCode: z.string().optional(),
  addr: addressSchema,
  contact: contactSchema,
  userId: z.string().optional(),
});

export const reservationSchema = z.object({
  customer: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phone: z.string().regex(phoneRegex, "Invalid 10-digit phone number"),
  }),
  reservation: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
    timeSlot: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
    guests: z.number().int().min(1).max(20),
    occasion: z.string().optional(),
    seat: z.string().optional(),
    notes: z.string().optional(),
  }),
  location: z.object({
    address: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    placeId: z.string().optional(),
  }).optional(),
  tableConfigId: z.string().min(1),
});

export const contactMessageSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message is too short").max(2000),
});
