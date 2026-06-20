export const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export const cafeInfo = {
  name: "Aroma Cafe & Restaurant",
  tagline: "Brewed with love in Nalgonda",
  phone: "+91 80195 51015",
  whatsapp: "918019551015",
  email: "hello@aromacafe.in",
  address: "Clock Tower Road, Nalgonda, Telangana 508001",
  hours: "Mon–Sun · 8:00 AM – 11:00 PM",
  rating: 4.7,
  reviewCount: 1284,
  instagram: "https://instagram.com",
  facebook: "https://facebook.com",
  mapsUrl: "https://maps.google.com/?q=Nalgonda",
};
