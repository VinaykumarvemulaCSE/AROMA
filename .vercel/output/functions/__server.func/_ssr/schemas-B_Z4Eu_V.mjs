import { a as numberType, i as literalType, n as booleanType, o as objectType, r as enumType, s as stringType, t as arrayType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/schemas-B_Z4Eu_V.js
var normalizedPhone = stringType().transform((v) => v.replace(/\D/g, "")).pipe(stringType().regex(/^[6-9]\d{9}$/, "Invalid 10-digit phone number"));
var normalizedPin = stringType().transform((v) => v.replace(/\s/g, "")).pipe(stringType().regex(/^\d{6}$/, "Invalid 6-digit pincode"));
var orderItemSchema = objectType({
	id: stringType().min(1, "Item ID is required"),
	qty: numberType().int().positive("Quantity must be greater than 0")
});
var contactSchema = objectType({
	name: stringType().min(2, "Name must be at least 2 characters").max(100),
	email: stringType().email("Invalid email address").optional().or(literalType("")),
	phone: normalizedPhone,
	method: enumType([
		"phone",
		"email",
		"whatsapp"
	]),
	note: stringType().max(500).optional(),
	cutlery: booleanType().default(false)
});
var addressSchema = objectType({
	line1: stringType().min(5, "Address line 1 is too short"),
	line2: stringType().max(200).optional(),
	landmark: stringType().max(100).optional(),
	city: stringType().min(2),
	pin: normalizedPin,
	phone: normalizedPhone,
	type: enumType([
		"Home",
		"Work",
		"Other"
	]).catch("Other"),
	notes: stringType().max(500).optional()
});
var orderSchema = objectType({
	items: arrayType(orderItemSchema).min(1, "Order must contain at least one item"),
	couponCode: stringType().optional(),
	addr: addressSchema,
	contact: contactSchema,
	idToken: stringType().optional()
});
var reservationSchema = objectType({
	customer: objectType({
		name: stringType().min(2, "Name must be at least 2 characters").max(100),
		email: stringType().email("Invalid email address").optional().or(literalType("")),
		phone: normalizedPhone
	}),
	reservation: objectType({
		date: stringType().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
		timeSlot: stringType().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
		guests: numberType().int().min(1).max(20),
		occasion: stringType().optional(),
		seat: stringType().optional(),
		notes: stringType().optional()
	}),
	location: objectType({
		address: stringType().optional(),
		latitude: numberType().optional(),
		longitude: numberType().optional(),
		placeId: stringType().optional()
	}).optional(),
	tableConfigId: stringType().min(1)
});
var contactMessageSchema = objectType({
	name: stringType().min(2, "Name is required").max(100),
	email: stringType().email("Invalid email address"),
	message: stringType().min(10, "Message is too short").max(2e3)
});
//#endregion
export { orderSchema as n, reservationSchema as r, contactMessageSchema as t };
