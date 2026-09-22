import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const places = [
  // Bangkok
  { destination: "bangkok", name: "Wat Arun", neighborhood: "Bangkok Yai", category: "Temple", rating: 4.7, durationLabel: "2-3 hrs", lat: 13.7437, lng: 100.4888, imageUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800", isHiddenGem: false },
  { destination: "bangkok", name: "The Grand Palace", neighborhood: "Phra Nakhon", category: "Landmark", rating: 4.6, durationLabel: "2-3 hrs", lat: 13.7500, lng: 100.4913, imageUrl: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800", isHiddenGem: false },
  { destination: "bangkok", name: "Yaowarat Road", neighborhood: "Chinatown", category: "Food Street", rating: 4.8, durationLabel: "2 hrs", lat: 13.7398, lng: 100.5077, imageUrl: "https://images.unsplash.com/photo-1563699948-2cf9b6a01f7a?w=800", isHiddenGem: false },
  { destination: "bangkok", name: "Wat Pho", neighborhood: "Phra Nakhon", category: "Temple", rating: 4.7, durationLabel: "1-2 hrs", lat: 13.7465, lng: 100.4930, imageUrl: "https://images.unsplash.com/photo-1598935888738-cd2622bda3c1?w=800", isHiddenGem: false },
  { destination: "bangkok", name: "Chatuchak Weekend Market", neighborhood: "Chatuchak", category: "Market", rating: 4.5, durationLabel: "3 hrs", lat: 13.7999, lng: 100.5500, imageUrl: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800", isHiddenGem: false },
  { destination: "bangkok", name: "Talad Noi", neighborhood: "Riverside quarter", category: "Neighborhood", rating: 4.6, durationLabel: "2 hrs", lat: 13.7370, lng: 100.5088, imageUrl: "https://images.unsplash.com/photo-1509644851169-2acc08aa25b5?w=800", isHiddenGem: true },
  { destination: "bangkok", name: "Bang Krachao", neighborhood: "Green lung", category: "Nature", rating: 4.7, durationLabel: "3-4 hrs", lat: 13.6797, lng: 100.5453, imageUrl: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800", isHiddenGem: true },
  { destination: "bangkok", name: "Jim Thompson House", neighborhood: "Siam", category: "Museum", rating: 4.6, durationLabel: "1.5 hrs", lat: 13.7495, lng: 100.5288, imageUrl: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800", isHiddenGem: true },

  // Goa
  { destination: "goa", name: "Baga Beach", neighborhood: "North Goa", category: "Beach", rating: 4.4, durationLabel: "2-3 hrs", lat: 15.5553, lng: 73.7539, imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800", isHiddenGem: false },
  { destination: "goa", name: "Fort Aguada", neighborhood: "Candolim", category: "Landmark", rating: 4.5, durationLabel: "1-2 hrs", lat: 15.4925, lng: 73.7737, imageUrl: "https://images.unsplash.com/photo-1587922546307-776227941871?w=800", isHiddenGem: false },
  { destination: "goa", name: "Anjuna Flea Market", neighborhood: "Anjuna", category: "Market", rating: 4.3, durationLabel: "2 hrs", lat: 15.5773, lng: 73.7411, imageUrl: "https://images.unsplash.com/photo-1483168527879-c66136b56105?w=800", isHiddenGem: false },
  { destination: "goa", name: "Divar Island", neighborhood: "Divar", category: "Nature", rating: 4.6, durationLabel: "3 hrs", lat: 15.5192, lng: 73.9101, imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800", isHiddenGem: true },

  // Manali
  { destination: "manali", name: "Solang Valley", neighborhood: "Solang", category: "Nature", rating: 4.6, durationLabel: "3-4 hrs", lat: 32.3199, lng: 77.1571, imageUrl: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800", isHiddenGem: false },
  { destination: "manali", name: "Hadimba Temple", neighborhood: "Old Manali", category: "Temple", rating: 4.5, durationLabel: "1 hr", lat: 32.2432, lng: 77.1687, imageUrl: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800", isHiddenGem: false },
  { destination: "manali", name: "Old Manali", neighborhood: "Old Manali", category: "Neighborhood", rating: 4.7, durationLabel: "2 hrs", lat: 32.2537, lng: 77.1667, imageUrl: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800", isHiddenGem: false },
  { destination: "manali", name: "Jana Waterfall", neighborhood: "Jana", category: "Nature", rating: 4.5, durationLabel: "2-3 hrs", lat: 32.0333, lng: 77.1167, imageUrl: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800", isHiddenGem: true },
];

const hotels = [
  // Bangkok
  { destination: "bangkok", name: "Riverside Backpackers Hostel", neighborhood: "Chinatown", rating: 4.1, pricePerNight: 900, tier: "budget", lat: 13.7395, lng: 100.5090, imageUrl: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800" },
  { destination: "bangkok", name: "Silom Capsule Inn", neighborhood: "Silom", rating: 4.0, pricePerNight: 1100, tier: "budget", lat: 13.7248, lng: 100.5340, imageUrl: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800" },
  { destination: "bangkok", name: "Sukhumvit Garden Hotel", neighborhood: "Sukhumvit", rating: 4.4, pricePerNight: 3200, tier: "mid", lat: 13.7380, lng: 100.5610, imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800" },
  { destination: "bangkok", name: "Siam Central Hotel", neighborhood: "Siam", rating: 4.5, pricePerNight: 3600, tier: "mid", lat: 13.7460, lng: 100.5340, imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800" },
  { destination: "bangkok", name: "Chao Phraya Riverside Grand", neighborhood: "Phra Nakhon", rating: 4.8, pricePerNight: 9500, tier: "luxury", lat: 13.7440, lng: 100.4950, imageUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800" },
  { destination: "bangkok", name: "The Platinum Sky Resort", neighborhood: "Sukhumvit", rating: 4.7, pricePerNight: 12000, tier: "luxury", lat: 13.7500, lng: 100.5470, imageUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800" },

  // Goa
  { destination: "goa", name: "Baga Beach Hostel", neighborhood: "Baga", rating: 4.0, pricePerNight: 800, tier: "budget", lat: 15.5560, lng: 73.7520, imageUrl: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800" },
  { destination: "goa", name: "Anjuna Backpackers Camp", neighborhood: "Anjuna", rating: 4.1, pricePerNight: 950, tier: "budget", lat: 15.5780, lng: 73.7400, imageUrl: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800" },
  { destination: "goa", name: "Candolim Garden Resort", neighborhood: "Candolim", rating: 4.4, pricePerNight: 3400, tier: "mid", lat: 15.5170, lng: 73.7630, imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800" },
  { destination: "goa", name: "Panjim Riverside Inn", neighborhood: "Panjim", rating: 4.3, pricePerNight: 3100, tier: "mid", lat: 15.4989, lng: 73.8278, imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800" },
  { destination: "goa", name: "Aguada Bay Luxury Resort", neighborhood: "Candolim", rating: 4.8, pricePerNight: 11000, tier: "luxury", lat: 15.4930, lng: 73.7750, imageUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800" },
  { destination: "goa", name: "Divar Island Heritage Villa", neighborhood: "Divar", rating: 4.7, pricePerNight: 9800, tier: "luxury", lat: 15.5200, lng: 73.9110, imageUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800" },

  // Manali
  { destination: "manali", name: "Old Manali Traveler's Hostel", neighborhood: "Old Manali", rating: 4.2, pricePerNight: 700, tier: "budget", lat: 32.2540, lng: 77.1660, imageUrl: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800" },
  { destination: "manali", name: "Solang Valley Camp Stay", neighborhood: "Solang", rating: 4.1, pricePerNight: 900, tier: "budget", lat: 32.3180, lng: 77.1550, imageUrl: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800" },
  { destination: "manali", name: "Mall Road Boutique Hotel", neighborhood: "Mall Road", rating: 4.5, pricePerNight: 3000, tier: "mid", lat: 32.2430, lng: 77.1890, imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800" },
  { destination: "manali", name: "Hadimba Pine Resort", neighborhood: "Old Manali", rating: 4.4, pricePerNight: 3300, tier: "mid", lat: 32.2450, lng: 77.1700, imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800" },
  { destination: "manali", name: "Beas River Luxury Resort", neighborhood: "Manali", rating: 4.7, pricePerNight: 8500, tier: "luxury", lat: 32.2390, lng: 77.1900, imageUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800" },
  { destination: "manali", name: "Snow Peak Grand Retreat", neighborhood: "Solang", rating: 4.8, pricePerNight: 9800, tier: "luxury", lat: 32.3210, lng: 77.1560, imageUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800" },
];

async function main() {
  for (const place of places) {
    const existing = await prisma.place.findFirst({ where: { destination: place.destination, name: place.name } });
    if (!existing) {
      await prisma.place.create({ data: place });
    }
  }
  console.log(`Seeded ${places.length} places.`);

  for (const hotel of hotels) {
    const existing = await prisma.hotel.findFirst({ where: { destination: hotel.destination, name: hotel.name } });
    if (!existing) {
      await prisma.hotel.create({ data: hotel });
    }
  }
  console.log(`Seeded ${hotels.length} hotels.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
