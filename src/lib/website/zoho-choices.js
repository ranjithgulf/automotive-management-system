// Public picklists only. Internal Zoho IDs and credentials MUST NOT be imported here.
export const BRANDS = ["Toyota", "Lexus", "Nissan", "Infiniti", "Hyundai", "Kia", "Mitsubishi", "Honda", "Mazda", "Ford", "Chevrolet", "GMC", "Jeep", "Mercedes-Benz", "BMW", "Audi", "Land Rover", "Porsche", "MG", "Geely", "Changan", "Other"];
export const BRANCHES = ["Muscat - Al Khuwair", "Muscat - Ghala", "Sohar", "Salalah", "Dubai - Al Quoz", "Abu Dhabi - Mussafah", "Sharjah - Industrial Area", "Riyadh - Olaya", "Jeddah - Al Rawdah", "Doha - Salwa Road", "Kuwait - Al Rai", "Manama - Sitra"];
export const CONDITIONS = ["New", "Used", "Certified Pre-Owned", "Open to Both"];
export const BODY_TYPES = ["Sedan", "SUV", "Crossover", "Hatchback", "Coupe / Sports", "Pickup", "Van / Bus", "Commercial Truck", "Other"];
export const TIMELINES = ["Immediately", "Within 1 Month", "1-3 Months", "3-6 Months", "Just Exploring"];
export const PAYMENTS = ["Cash", "Bank Finance", "Lease", "Undecided"];
export const CONTACT_METHODS = ["WhatsApp", "Phone Call", "SMS", "Email"];
export const CUSTOMER_TYPES = ["Individual", "Corporate", "Fleet", "Government"];
export const SERVICE_TYPES = ["Periodic Maintenance", "Oil Service", "Brake Inspection", "Tyre Service", "Battery Replacement", "AC Service", "Diagnostics", "General Repair", "Pre-Delivery Inspection", "Reconditioning", "Warranty Repair"];
export const APPOINTMENT_TIMES = Array.from({ length: 21 }, (_, i) => String(7 + Math.floor(i / 2)).padStart(2, "0") + ":" + (i % 2 ? "30" : "00"));
export const LEAD_KINDS = ["contact", "vehicle", "quotation", "drive", "trade-in"];
export const TICKET_CATEGORIES = ["General Enquiry","Vehicle Sales Enquiry","Test Drive Request","Service Appointment","Vehicle Service Issue","Parts Enquiry","Warranty Claim","Service Contract Enquiry","Delivery or Vehicle Handover","Complaint","Feedback","Roadside Assistance"];
export const ARABIC_CHOICES = {
  "branches": {
    "Muscat - Al Khuwair": "مسقط - الخوير",
    "Muscat - Ghala": "مسقط - غلا",
    "Sohar": "صحار",
    "Salalah": "صلالة",
    "Dubai - Al Quoz": "دبي - القوز",
    "Abu Dhabi - Mussafah": "أبوظبي - مصفح",
    "Sharjah - Industrial Area": "الشارقة - المنطقة الصناعية",
    "Riyadh - Olaya": "الرياض - العليا",
    "Jeddah - Al Rawdah": "جدة - الروضة",
    "Doha - Salwa Road": "الدوحة - طريق سلوى",
    "Kuwait - Al Rai": "الكويت - الري",
    "Manama - Sitra": "المنامة - سترة"
  },
  "New_or_Used": {
    "New": "جديدة",
    "Used": "مستعملة",
    "Certified Pre-Owned": "مستعملة معتمدة",
    "Open to Both": "أيهما"
  },
  "Body_Type": {
    "Sedan": "سيدان",
    "SUV": "دفع رباعي (SUV)",
    "Crossover": "كروس أوفر",
    "Hatchback": "هاتشباك",
    "Coupe / Sports": "كوبيه / رياضية",
    "Pickup": "بيك أب",
    "Van / Bus": "فان / حافلة",
    "Commercial Truck": "شاحنة تجارية",
    "Other": "أخرى"
  },
  "Purchase_Timeline": {
    "Immediately": "فوراً",
    "Within 1 Month": "خلال شهر",
    "1-3 Months": "من 1 إلى 3 أشهر",
    "3-6 Months": "من 3 إلى 6 أشهر",
    "Just Exploring": "أستكشف فقط"
  },
  "Payment_Method": {
    "Cash": "نقداً",
    "Bank Finance": "تمويل بنكي",
    "Lease": "تأجير",
    "Undecided": "لم أقرر بعد"
  },
  "Customer_Type": {
    "Individual": "فرد",
    "Corporate": "شركة",
    "Fleet": "أسطول",
    "Government": "جهة حكومية"
  },
  "Preferred_Contact_Method": {
    "WhatsApp": "واتساب",
    "Phone Call": "مكالمة هاتفية",
    "SMS": "رسالة نصية",
    "Email": "بريد إلكتروني"
  },
  "Preferred_Language": {
    "Arabic": "العربية",
    "English": "الإنجليزية",
    "Hindi / Urdu": "الهندية / الأردية",
    "Malayalam": "المالايالامية",
    "Other": "أخرى"
  },
  "Service_Type": {
    "Periodic Maintenance": "صيانة دورية",
    "Oil Service": "تغيير الزيت",
    "Brake Inspection": "فحص الفرامل",
    "Tyre Service": "خدمة الإطارات",
    "Battery Replacement": "استبدال البطارية",
    "AC Service": "صيانة المكيف",
    "Diagnostics": "فحص الأعطال",
    "General Repair": "إصلاح عام",
    "Pre-Delivery Inspection": "فحص ما قبل التسليم",
    "Reconditioning": "تجديد",
    "Warranty Repair": "إصلاح ضمن الضمان"
  },
  "cf_af_ticket_category": {
    "General Enquiry": "استفسار عام",
    "Vehicle Sales Enquiry": "استفسار عن شراء سيارة",
    "Test Drive Request": "طلب تجربة قيادة",
    "Service Appointment": "موعد صيانة",
    "Vehicle Service Issue": "مشكلة في الصيانة",
    "Parts Enquiry": "استفسار عن قطع الغيار",
    "Warranty Claim": "مطالبة ضمان",
    "Service Contract Enquiry": "استفسار عن عقد الخدمة",
    "Delivery or Vehicle Handover": "التسليم أو استلام السيارة",
    "Complaint": "شكوى",
    "Feedback": "ملاحظات",
    "Roadside Assistance": "المساعدة على الطريق"
  },
  "brands": "Keep the brand names in Latin script (Toyota, Lexus, …) — see the note below"
};
