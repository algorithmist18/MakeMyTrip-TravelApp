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

async function main() {
  for (const place of places) {
    const existing = await prisma.place.findFirst({ where: { destination: place.destination, name: place.name } });
    if (!existing) {
      await prisma.place.create({ data: place });
    }
  }
  console.log(`Seeded ${places.length} places.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
