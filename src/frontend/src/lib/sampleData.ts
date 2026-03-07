import type { Category, Medicine, Sale, Supplier } from "../backend.d";

// Helper: date to nanoseconds bigint
const dateToNs = (dateStr: string): bigint =>
  BigInt(new Date(dateStr).getTime()) * BigInt(1_000_000);

export const sampleCategories: Category[] = [
  {
    name: "Antibiotics",
    description: "Medicines used to treat bacterial infections",
  },
  {
    name: "Analgesics",
    description: "Pain relief medications and anti-inflammatories",
  },
  {
    name: "Cardiovascular",
    description: "Medicines for heart and blood pressure conditions",
  },
  {
    name: "Antidiabetics",
    description: "Blood glucose management medications",
  },
  {
    name: "Vitamins & Supplements",
    description: "Nutritional supplements and vitamins",
  },
  { name: "Antifungals", description: "Treatments for fungal infections" },
];

export const sampleMedicines: Medicine[] = [
  {
    id: "m001",
    name: "Amoxicillin 500mg",
    genericName: "Amoxicillin",
    category: "Antibiotics",
    manufacturer: "Sun Pharma",
    batchNumber: "SUN2025A01",
    expiryDate: dateToNs("2026-08-15"),
    quantity: BigInt(245),
    unitPrice: 12.5,
    reorderLevel: BigInt(50),
    isActive: true,
  },
  {
    id: "m002",
    name: "Paracetamol 650mg",
    genericName: "Acetaminophen",
    category: "Analgesics",
    manufacturer: "Cipla Ltd",
    batchNumber: "CIP2025P02",
    expiryDate: dateToNs("2027-03-20"),
    quantity: BigInt(18),
    unitPrice: 4.75,
    reorderLevel: BigInt(100),
    isActive: true,
  },
  {
    id: "m003",
    name: "Metformin 500mg",
    genericName: "Metformin HCl",
    category: "Antidiabetics",
    manufacturer: "Dr. Reddy's",
    batchNumber: "DRL2025M03",
    expiryDate: dateToNs("2026-11-30"),
    quantity: BigInt(330),
    unitPrice: 8.2,
    reorderLevel: BigInt(80),
    isActive: true,
  },
  {
    id: "m004",
    name: "Amlodipine 5mg",
    genericName: "Amlodipine Besylate",
    category: "Cardiovascular",
    manufacturer: "Lupin Pharma",
    batchNumber: "LUP2025A04",
    expiryDate: dateToNs("2025-04-10"),
    quantity: BigInt(45),
    unitPrice: 15.0,
    reorderLevel: BigInt(60),
    isActive: true,
  },
  {
    id: "m005",
    name: "Vitamin D3 1000IU",
    genericName: "Cholecalciferol",
    category: "Vitamins & Supplements",
    manufacturer: "Abbott India",
    batchNumber: "ABB2025V05",
    expiryDate: dateToNs("2027-06-01"),
    quantity: BigInt(500),
    unitPrice: 22.0,
    reorderLevel: BigInt(100),
    isActive: true,
  },
  {
    id: "m006",
    name: "Fluconazole 150mg",
    genericName: "Fluconazole",
    category: "Antifungals",
    manufacturer: "Glenmark",
    batchNumber: "GLN2025F06",
    expiryDate: dateToNs("2025-05-28"),
    quantity: BigInt(12),
    unitPrice: 35.0,
    reorderLevel: BigInt(30),
    isActive: true,
  },
  {
    id: "m007",
    name: "Atorvastatin 10mg",
    genericName: "Atorvastatin Calcium",
    category: "Cardiovascular",
    manufacturer: "Pfizer India",
    batchNumber: "PFZ2025A07",
    expiryDate: dateToNs("2026-09-15"),
    quantity: BigInt(180),
    unitPrice: 28.5,
    reorderLevel: BigInt(50),
    isActive: true,
  },
  {
    id: "m008",
    name: "Ibuprofen 400mg",
    genericName: "Ibuprofen",
    category: "Analgesics",
    manufacturer: "Alkem Labs",
    batchNumber: "ALK2025I08",
    expiryDate: dateToNs("2026-12-31"),
    quantity: BigInt(8),
    unitPrice: 6.8,
    reorderLevel: BigInt(75),
    isActive: true,
  },
];

export const sampleSuppliers: Supplier[] = [
  {
    id: "s001",
    name: "MediSource Distributors",
    contactPerson: "Rajesh Kumar",
    phone: "+91-9876543210",
    email: "rajesh@medisource.in",
    address: "45 Pharma Hub, Andheri East, Mumbai 400093",
    isActive: true,
  },
  {
    id: "s002",
    name: "HealthPlus Wholesale",
    contactPerson: "Priya Sharma",
    phone: "+91-9988776655",
    email: "priya@healthplus.co.in",
    address: "12 Industrial Area, Sector 62, Noida 201301",
    isActive: true,
  },
  {
    id: "s003",
    name: "PharmaCo Supply Chain",
    contactPerson: "Arjun Mehta",
    phone: "+91-8765432109",
    email: "arjun@pharmacosupply.com",
    address: "78 Pharma Zone, Whitefield, Bangalore 560066",
    isActive: false,
  },
  {
    id: "s004",
    name: "National Pharma Depot",
    contactPerson: "Sunita Patel",
    phone: "+91-7654321098",
    email: "sunita@npdepot.in",
    address: "23 Ring Road, Nariman Point, Chennai 600001",
    isActive: true,
  },
];

const now = Date.now();
export const sampleSales: Sale[] = [
  {
    id: "sl001",
    customerName: "Meena Agarwal",
    totalAmount: 79.5,
    timestamp: BigInt(now - 2 * 60 * 60 * 1000) * BigInt(1_000_000),
    items: [
      {
        medicineId: "m001",
        medicineName: "Amoxicillin 500mg",
        quantity: BigInt(2),
        unitPrice: 12.5,
      },
      {
        medicineId: "m005",
        medicineName: "Vitamin D3 1000IU",
        quantity: BigInt(2),
        unitPrice: 22.0,
      },
    ],
  },
  {
    id: "sl002",
    customerName: "Ravi Nair",
    totalAmount: 42.3,
    timestamp: BigInt(now - 24 * 60 * 60 * 1000) * BigInt(1_000_000),
    items: [
      {
        medicineId: "m002",
        medicineName: "Paracetamol 650mg",
        quantity: BigInt(3),
        unitPrice: 4.75,
      },
      {
        medicineId: "m008",
        medicineName: "Ibuprofen 400mg",
        quantity: BigInt(4),
        unitPrice: 6.8,
      },
    ],
  },
  {
    id: "sl003",
    customerName: "Fatima Shaikh",
    totalAmount: 154.0,
    timestamp: BigInt(now - 2 * 24 * 60 * 60 * 1000) * BigInt(1_000_000),
    items: [
      {
        medicineId: "m003",
        medicineName: "Metformin 500mg",
        quantity: BigInt(4),
        unitPrice: 8.2,
      },
      {
        medicineId: "m007",
        medicineName: "Atorvastatin 10mg",
        quantity: BigInt(3),
        unitPrice: 28.5,
      },
    ],
  },
  {
    id: "sl004",
    customerName: "Dilip Verma",
    totalAmount: 60.0,
    timestamp: BigInt(now - 3 * 24 * 60 * 60 * 1000) * BigInt(1_000_000),
    items: [
      {
        medicineId: "m004",
        medicineName: "Amlodipine 5mg",
        quantity: BigInt(4),
        unitPrice: 15.0,
      },
    ],
  },
  {
    id: "sl005",
    customerName: "Ananya Reddy",
    totalAmount: 35.0,
    timestamp: BigInt(now - 5 * 24 * 60 * 60 * 1000) * BigInt(1_000_000),
    items: [
      {
        medicineId: "m006",
        medicineName: "Fluconazole 150mg",
        quantity: BigInt(1),
        unitPrice: 35.0,
      },
    ],
  },
];
