// Mock data for development - replace with actual database when MongoDB is configured

export const mockItineraries = [
  {
    _id: "1",
    productId: "FGT-001",
    title: "Rajasthan Heritage Tour",
    description: "Explore the majestic palaces and forts of Rajasthan",
    destination: "Rajasthan, India",
    countries: ["India"],
    duration: "8 Days / 7 Nights",
    totalPrice: 45000,
    currency: "INR", 
    status: "published",
    createdBy: "John Doe",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-20"),
    days: [],
    highlights: ["Amber Fort", "City Palace", "Hawa Mahal"],
    images: [],
    itineraryType: "fixed-group",
    fixedDates: {
      startDate: new Date("2024-03-01"),
      endDate: new Date("2024-03-08"),
      availableDates: [
        new Date("2024-03-01"),
        new Date("2024-03-15"),
        new Date("2024-04-01"),
        new Date("2024-04-15")
      ],
      maxGroupSize: 25
    }
  },
  {
    _id: "2", 
    productId: "CUST-002",
    title: "Kerala Backwaters Customized Tour",
    description: "Customizable tour through the serene backwaters of Kerala",
    destination: "Kerala, India",
    countries: ["India"],
    duration: "6 Days / 5 Nights",
    totalPrice: 35000,
    currency: "INR",
    status: "draft",
    createdBy: "Jane Smith",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-18"),
    days: [],
    highlights: ["Houseboats", "Spice Plantations", "Ayurveda"],
    images: [],
    itineraryType: "customized"
  },
  {
    _id: "3",
    productId: "CART-003", 
    title: "Adventure Activities Package",
    description: "Collection of adventure activities and accommodations",
    destination: "Various Locations",
    countries: ["India"],
    duration: "Flexible",
    totalPrice: 15000,
    currency: "INR",
    status: "draft",
    createdBy: "Mike Johnson",
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-19"),
    days: [],
    highlights: [],
    images: [],
    itineraryType: "cart-combo",
    cartItems: [
      {
        id: "item-1",
        name: "River Rafting - Rishikesh",
        productId: "ACT-001",
        description: "Thrilling river rafting experience on Ganges",
        category: "activity",
        price: 2500,
        location: "Rishikesh",
        duration: "3 hours",
        difficulty: "moderate"
      },
      {
        id: "item-2", 
        name: "Mountain Resort Stay",
        productId: "HTL-001",
        description: "Cozy mountain resort with scenic views",
        category: "hotel",
        price: 8000,
        location: "Manali",
        nights: 2,
        roomType: "Deluxe"
      }
    ]
  },
  {
    _id: "4",
    productId: "HTML-004",
    title: "Custom Marketing Itinerary",
    description: "Rich HTML formatted travel itinerary",
    destination: "Goa, India", 
    countries: ["India"],
    duration: "4 Days / 3 Nights",
    totalPrice: 25000,
    currency: "INR",
    status: "published",
    createdBy: "Sarah Wilson",
    createdAt: new Date("2024-01-08"),
    updatedAt: new Date("2024-01-16"),
    days: [],
    highlights: [],
    images: [],
    itineraryType: "html-editor",
    htmlContent: "<h1>Welcome to Goa</h1><p>Experience the beautiful beaches and vibrant culture...</p>"
  }
]