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

  // Phuket
  { destination: "phuket", name: "Patong Beach", neighborhood: "Patong", category: "Beach", rating: 4.3, durationLabel: "2-3 hrs", lat: 7.8964, lng: 98.2968, imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800", isHiddenGem: false },
  { destination: "phuket", name: "Big Buddha Phuket", neighborhood: "Chalong", category: "Landmark", rating: 4.7, durationLabel: "1-2 hrs", lat: 7.8276, lng: 98.3121, imageUrl: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800", isHiddenGem: false },
  { destination: "phuket", name: "Old Phuket Town", neighborhood: "Phuket Town", category: "Neighborhood", rating: 4.6, durationLabel: "2 hrs", lat: 7.8853, lng: 98.3897, imageUrl: "https://images.unsplash.com/photo-1509644851169-2acc08aa25b5?w=800", isHiddenGem: false },
  { destination: "phuket", name: "Wat Chalong", neighborhood: "Chalong", category: "Temple", rating: 4.5, durationLabel: "1 hr", lat: 7.8459, lng: 98.3374, imageUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800", isHiddenGem: false },
  { destination: "phuket", name: "Phi Phi Islands Day Trip", neighborhood: "Andaman Sea", category: "Island", rating: 4.8, durationLabel: "Full day", lat: 7.7407, lng: 98.7784, imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800", isHiddenGem: false },
  { destination: "phuket", name: "Kata Noi Beach", neighborhood: "Kata", category: "Beach", rating: 4.6, durationLabel: "2 hrs", lat: 7.8155, lng: 98.2954, imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800", isHiddenGem: true },
  { destination: "phuket", name: "Promthep Cape", neighborhood: "Rawai", category: "Viewpoint", rating: 4.7, durationLabel: "1 hr", lat: 7.7629, lng: 98.2937, imageUrl: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800", isHiddenGem: true },

  // Chiang Mai
  { destination: "chiang-mai", name: "Old City Chiang Mai", neighborhood: "Old City", category: "Neighborhood", rating: 4.7, durationLabel: "2-3 hrs", lat: 18.7877, lng: 98.9931, imageUrl: "https://images.unsplash.com/photo-1509644851169-2acc08aa25b5?w=800", isHiddenGem: false },
  { destination: "chiang-mai", name: "Doi Suthep Temple", neighborhood: "Doi Suthep", category: "Temple", rating: 4.8, durationLabel: "2 hrs", lat: 18.8047, lng: 98.9217, imageUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800", isHiddenGem: false },
  { destination: "chiang-mai", name: "Chiang Mai Night Bazaar", neighborhood: "Chang Khlan", category: "Market", rating: 4.4, durationLabel: "2 hrs", lat: 18.7869, lng: 99.0006, imageUrl: "https://images.unsplash.com/photo-1563699948-2cf9b6a01f7a?w=800", isHiddenGem: false },
  { destination: "chiang-mai", name: "Elephant Nature Park", neighborhood: "Mae Taeng", category: "Sanctuary", rating: 4.9, durationLabel: "Full day", lat: 19.2116, lng: 98.8114, imageUrl: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800", isHiddenGem: false },
  { destination: "chiang-mai", name: "Wat Phra Singh", neighborhood: "Old City", category: "Temple", rating: 4.6, durationLabel: "1 hr", lat: 18.7883, lng: 98.9822, imageUrl: "https://images.unsplash.com/photo-1598935888738-cd2622bda3c1?w=800", isHiddenGem: false },
  { destination: "chiang-mai", name: "Bua Thong Sticky Waterfalls", neighborhood: "Mae Taeng", category: "Nature", rating: 4.7, durationLabel: "3 hrs", lat: 19.2058, lng: 98.6289, imageUrl: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800", isHiddenGem: true },
  { destination: "chiang-mai", name: "Wat Umong", neighborhood: "Suthep", category: "Temple", rating: 4.6, durationLabel: "1-2 hrs", lat: 18.7928, lng: 98.9575, imageUrl: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800", isHiddenGem: true },

  // Pattaya
  { destination: "pattaya", name: "Pattaya Beach", neighborhood: "Central Pattaya", category: "Beach", rating: 4.2, durationLabel: "2 hrs", lat: 12.9328, lng: 100.8823, imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800", isHiddenGem: false },
  { destination: "pattaya", name: "Sanctuary of Truth", neighborhood: "Naklua", category: "Landmark", rating: 4.6, durationLabel: "1.5 hrs", lat: 12.9736, lng: 100.8871, imageUrl: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800", isHiddenGem: false },
  { destination: "pattaya", name: "Nong Nooch Tropical Garden", neighborhood: "Nong Plalai", category: "Garden", rating: 4.7, durationLabel: "3 hrs", lat: 12.7339, lng: 100.9291, imageUrl: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800", isHiddenGem: false },
  { destination: "pattaya", name: "Walking Street", neighborhood: "South Pattaya", category: "Nightlife", rating: 4.1, durationLabel: "2 hrs", lat: 12.9256, lng: 100.8730, imageUrl: "https://images.unsplash.com/photo-1563699948-2cf9b6a01f7a?w=800", isHiddenGem: false },
  { destination: "pattaya", name: "Big Buddha Hill Pattaya", neighborhood: "Nong Prue", category: "Landmark", rating: 4.5, durationLabel: "1 hr", lat: 12.9046, lng: 100.8935, imageUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800", isHiddenGem: false },
  { destination: "pattaya", name: "Ko Lan Island", neighborhood: "Ko Lan", category: "Island", rating: 4.6, durationLabel: "Full day", lat: 12.9167, lng: 100.7833, imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800", isHiddenGem: true },
  { destination: "pattaya", name: "Wat Yansangwararam", neighborhood: "Bang Lamung", category: "Temple", rating: 4.6, durationLabel: "1-2 hrs", lat: 12.8271, lng: 100.9548, imageUrl: "https://images.unsplash.com/photo-1598935888738-cd2622bda3c1?w=800", isHiddenGem: true },

  // Krabi
  { destination: "krabi", name: "Railay Beach", neighborhood: "Railay", category: "Beach", rating: 4.8, durationLabel: "3 hrs", lat: 8.0114, lng: 98.8373, imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800", isHiddenGem: false },
  { destination: "krabi", name: "Ao Nang Beach", neighborhood: "Ao Nang", category: "Beach", rating: 4.4, durationLabel: "2 hrs", lat: 8.0304, lng: 98.8225, imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800", isHiddenGem: false },
  { destination: "krabi", name: "Tiger Cave Temple", neighborhood: "Muang Krabi", category: "Temple", rating: 4.6, durationLabel: "2 hrs", lat: 8.1231, lng: 98.9509, imageUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800", isHiddenGem: false },
  { destination: "krabi", name: "Emerald Pool", neighborhood: "Khlong Thom", category: "Nature", rating: 4.5, durationLabel: "2 hrs", lat: 8.1868, lng: 99.0730, imageUrl: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800", isHiddenGem: false },
  { destination: "krabi", name: "Four Islands Tour", neighborhood: "Andaman Sea", category: "Island", rating: 4.7, durationLabel: "Full day", lat: 8.0009, lng: 98.7953, imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800", isHiddenGem: false },
  { destination: "krabi", name: "Klong Thom Hot Springs", neighborhood: "Khlong Thom", category: "Nature", rating: 4.5, durationLabel: "1-2 hrs", lat: 7.9377, lng: 99.1355, imageUrl: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800", isHiddenGem: true },
  { destination: "krabi", name: "Koh Hong Island", neighborhood: "Andaman Sea", category: "Island", rating: 4.7, durationLabel: "Full day", lat: 8.1544, lng: 98.8155, imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800", isHiddenGem: true },
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

  // Phuket
  { destination: "phuket", name: "Patong Backpacker Hub", neighborhood: "Patong", rating: 4.0, pricePerNight: 850, tier: "budget", lat: 7.8940, lng: 98.2970, imageUrl: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800" },
  { destination: "phuket", name: "Old Town Capsule Stay", neighborhood: "Phuket Town", rating: 4.1, pricePerNight: 1000, tier: "budget", lat: 7.8850, lng: 98.3880, imageUrl: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800" },
  { destination: "phuket", name: "Kata Garden Resort", neighborhood: "Kata", rating: 4.4, pricePerNight: 3300, tier: "mid", lat: 7.8180, lng: 98.2970, imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800" },
  { destination: "phuket", name: "Phuket Town Boutique Hotel", neighborhood: "Phuket Town", rating: 4.5, pricePerNight: 3500, tier: "mid", lat: 7.8860, lng: 98.3900, imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800" },
  { destination: "phuket", name: "Promthep Cliffside Luxury Resort", neighborhood: "Rawai", rating: 4.8, pricePerNight: 10500, tier: "luxury", lat: 7.7650, lng: 98.2950, imageUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800" },
  { destination: "phuket", name: "Patong Bay Grand Hotel", neighborhood: "Patong", rating: 4.7, pricePerNight: 11500, tier: "luxury", lat: 7.8970, lng: 98.2980, imageUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800" },

  // Chiang Mai
  { destination: "chiang-mai", name: "Old City Hostel", neighborhood: "Old City", rating: 4.2, pricePerNight: 700, tier: "budget", lat: 18.7880, lng: 98.9920, imageUrl: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800" },
  { destination: "chiang-mai", name: "Night Bazaar Capsule Inn", neighborhood: "Chang Khlan", rating: 4.0, pricePerNight: 850, tier: "budget", lat: 18.7870, lng: 99.0000, imageUrl: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800" },
  { destination: "chiang-mai", name: "Doi Suthep View Hotel", neighborhood: "Suthep", rating: 4.4, pricePerNight: 2900, tier: "mid", lat: 18.8000, lng: 98.9500, imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800" },
  { destination: "chiang-mai", name: "Nimman Boutique Hotel", neighborhood: "Nimman", rating: 4.6, pricePerNight: 3100, tier: "mid", lat: 18.7967, lng: 98.9663, imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800" },
  { destination: "chiang-mai", name: "Lanna Heritage Luxury Resort", neighborhood: "Old City", rating: 4.8, pricePerNight: 8800, tier: "luxury", lat: 18.7900, lng: 98.9850, imageUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800" },
  { destination: "chiang-mai", name: "Mae Rim Mountain Retreat", neighborhood: "Mae Rim", rating: 4.7, pricePerNight: 9500, tier: "luxury", lat: 18.9000, lng: 98.9000, imageUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800" },

  // Pattaya
  { destination: "pattaya", name: "Beach Road Hostel", neighborhood: "Central Pattaya", rating: 4.0, pricePerNight: 750, tier: "budget", lat: 12.9300, lng: 100.8800, imageUrl: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800" },
  { destination: "pattaya", name: "Walking Street Capsule Stay", neighborhood: "South Pattaya", rating: 3.9, pricePerNight: 900, tier: "budget", lat: 12.9250, lng: 100.8740, imageUrl: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800" },
  { destination: "pattaya", name: "Jomtien Garden Resort", neighborhood: "Jomtien", rating: 4.4, pricePerNight: 2800, tier: "mid", lat: 12.8880, lng: 100.8770, imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800" },
  { destination: "pattaya", name: "Central Pattaya Hotel", neighborhood: "Central Pattaya", rating: 4.3, pricePerNight: 3000, tier: "mid", lat: 12.9200, lng: 100.8850, imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800" },
  { destination: "pattaya", name: "Sanctuary Bay Luxury Resort", neighborhood: "Naklua", rating: 4.7, pricePerNight: 9200, tier: "luxury", lat: 12.9700, lng: 100.8850, imageUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800" },
  { destination: "pattaya", name: "Pattaya Oceanfront Grand", neighborhood: "Central Pattaya", rating: 4.6, pricePerNight: 10000, tier: "luxury", lat: 12.9330, lng: 100.8830, imageUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800" },

  // Krabi
  { destination: "krabi", name: "Ao Nang Backpacker Lodge", neighborhood: "Ao Nang", rating: 4.1, pricePerNight: 800, tier: "budget", lat: 8.0300, lng: 98.8230, imageUrl: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800" },
  { destination: "krabi", name: "Railay Hostel", neighborhood: "Railay", rating: 4.2, pricePerNight: 950, tier: "budget", lat: 8.0110, lng: 98.8370, imageUrl: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800" },
  { destination: "krabi", name: "Ao Nang Garden Resort", neighborhood: "Ao Nang", rating: 4.4, pricePerNight: 3100, tier: "mid", lat: 8.0280, lng: 98.8250, imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800" },
  { destination: "krabi", name: "Krabi Town Boutique Hotel", neighborhood: "Krabi Town", rating: 4.3, pricePerNight: 2900, tier: "mid", lat: 8.0630, lng: 98.9150, imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800" },
  { destination: "krabi", name: "Railay Cliffside Luxury Resort", neighborhood: "Railay", rating: 4.9, pricePerNight: 11000, tier: "luxury", lat: 8.0100, lng: 98.8360, imageUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800" },
  { destination: "krabi", name: "Koh Hong Island Luxury Retreat", neighborhood: "Andaman Sea", rating: 4.8, pricePerNight: 12500, tier: "luxury", lat: 8.1500, lng: 98.8150, imageUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800" },
];

// --- Reviews: deterministically generated so re-seeding is reproducible,
// rather than hand-authoring 100+ unique lines across 44 places. ---
const REVIEWER_NAMES = [
  "Ananya Sharma", "Rohan Mehta", "Priya Nair", "Karan Kapoor", "Simran Kaur",
  "Arjun Rao", "Neha Gupta", "Vikram Singh", "Ishita Desai", "Aditya Verma",
  "Meera Pillai", "Rahul Iyer", "Sanya Malhotra", "Aman Joshi", "Divya Reddy",
];
const TRIP_TYPES = ["Solo", "Couple", "Family", "Friends"];
const VISIT_MONTHS = ["Jan 2026", "Feb 2026", "Mar 2026", "Apr 2026", "May 2026", "Jun 2026", "Jul 2026", "Aug 2026", "Sep 2026"];
const REVIEW_TEMPLATES = [
  (p: string) => `${p} was the highlight of our trip — go early to beat the crowds, the light is best in the morning.`,
  (p: string) => `Loved ${p}. A little touristy but absolutely worth it, especially for photos.`,
  (p: string) => `We almost skipped ${p} but so glad we didn't — quieter and more beautiful than we expected.`,
  (p: string) => `Book tickets online for ${p} if you can, saved us a long queue.`,
  (p: string) => `${p} is a must if you're nearby. Budget more time than you think — we rushed and regretted it.`,
  (p: string) => `Solid experience at ${p}, though it gets busy on weekends. Go on a weekday if possible.`,
  (p: string) => `${p} exceeded expectations. Our guide knew a ton of local history, made it much more memorable.`,
  (p: string) => `Nice stop at ${p} but overpriced food stalls nearby — eat before or after.`,
];

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

function pick<T>(arr: T[], seed: number, salt: number): T {
  const idx = (seed + salt * 2654435761) % arr.length;
  return arr[idx];
}

function generateReviews(placeId: string, placeName: string, baseRating: number) {
  const seed = hashSeed(placeName);
  const count = 3;
  return Array.from({ length: count }, (_, i) => {
    const s = seed + i * 97;
    const ratingJitter = [(-0.3), 0, 0.2][i % 3];
    return {
      placeId,
      reviewerName: pick(REVIEWER_NAMES, s, 1),
      rating: Math.max(3.5, Math.min(5, Math.round((baseRating + ratingJitter) * 10) / 10)),
      verified: i !== 2 || s % 5 !== 0, // occasionally unverified for contrast
      tripType: pick(TRIP_TYPES, s, 2),
      visitedMonth: pick(VISIT_MONTHS, s, 3),
      text: pick(REVIEW_TEMPLATES, s, 4)(placeName),
      helpfulCount: (s % 40) + 2,
    };
  });
}

// --- Local intelligence: hand-written, destination-level insider tips. ---
const localIntel = [
  // Bangkok
  { destination: "bangkok", category: "transport", title: "Get a Rabbit Card", tip: "Load a Rabbit Card for the BTS Skytrain — much faster than taxis in traffic and avoids haggling with tuk-tuks." },
  { destination: "bangkok", category: "money", title: "Carry small THB notes", tip: "Street food and tuk-tuks rarely break 1000 THB notes. Keep a stock of 20s, 50s, and 100s." },
  { destination: "bangkok", category: "custom", title: "Dress modestly for temples", tip: "Shoulders and knees must be covered at the Grand Palace and Wat Pho — sarongs are sold at the gate if you forget." },
  { destination: "bangkok", category: "weather", title: "April is the hottest month", tip: "March–May is brutally hot and humid; October–February is far more comfortable for walking around." },
  // Phuket
  { destination: "phuket", category: "safety", title: "Rent a helmet with your scooter", tip: "Helmet laws are enforced on main roads in Phuket, and hospital bills for tourists aren't cheap." },
  { destination: "phuket", category: "weather", title: "Avoid the west coast in monsoon", tip: "May–October brings rough seas on Patong/Kata beaches — swim flags matter, red means stay out." },
  { destination: "phuket", category: "transport", title: "Book Phi Phi tours a day ahead", tip: "Speedboat tours to Phi Phi sell out in peak season (Dec–Feb) — book the evening before." },
  { destination: "phuket", category: "money", title: "Negotiate tuk-tuk fares upfront", tip: "Always agree on a price before getting in — Phuket tuk-tuks are notoriously pricier than Bangkok's." },
  // Chiang Mai
  { destination: "chiang-mai", category: "custom", title: "Choose an ethical elephant sanctuary", tip: "Look for 'no riding' sanctuaries like Elephant Nature Park — riding camps are widely considered harmful to the elephants." },
  { destination: "chiang-mai", category: "weather", title: "Burning season affects air quality", tip: "Feb–April sees agricultural burning that spikes air pollution — check AQI if you have respiratory sensitivities." },
  { destination: "chiang-mai", category: "transport", title: "Songthaews are the local ride", tip: "Red shared trucks (songthaews) are cheaper than Grab within the Old City — flag one down and confirm the fare." },
  { destination: "chiang-mai", category: "connectivity", title: "eSIMs work well here", tip: "AIS and dtac eSIMs are easy to activate on arrival and cover rural day-trip routes like Doi Suthep well." },
  // Pattaya
  { destination: "pattaya", category: "safety", title: "Stick to metered or app taxis", tip: "Use Grab rather than unmetered baht buses/taxis at night around Walking Street to avoid overcharging." },
  { destination: "pattaya", category: "custom", title: "Nightlife areas are concentrated", tip: "Walking Street is intense after dark — Jomtien Beach nearby is a much quieter, family-friendly alternative." },
  { destination: "pattaya", category: "transport", title: "Songthaews loop the main roads", tip: "Baht buses (shared songthaews) run fixed loops for a flat fare — cheap but confirm your stop with the driver." },
  // Krabi
  { destination: "krabi", category: "transport", title: "Longtail boats need cash", tip: "Most longtail boat operators to Railay/the Four Islands don't take cards — carry enough THB cash for the day." },
  { destination: "krabi", category: "weather", title: "Best visibility Nov–Apr", tip: "Dry season (Nov–Apr) gives the clearest water for the Four Islands tour; rainy season can cancel boat trips." },
  { destination: "krabi", category: "safety", title: "Check tide times for Railay", tip: "Some beach paths in Railay are only walkable at low tide — check tide tables before planning your day." },
  // Goa
  { destination: "goa", category: "transport", title: "Rent a scooter for North Goa", tip: "A rented scooter (₹300–400/day) is the easiest way to hop between Baga, Anjuna, and Candolim." },
  { destination: "goa", category: "custom", title: "Beach shacks close by law in monsoon", tip: "Many beach shacks shut June–September during monsoon season — check ahead if that's core to your plan." },
  { destination: "goa", category: "money", title: "ATMs run out on weekends", tip: "Withdraw cash on weekdays — North Goa ATMs can run dry over weekends in peak season." },
  { destination: "goa", category: "safety", title: "Strong currents at Baga/Anjuna", tip: "Rip currents are a real risk on the more popular beaches — swim near lifeguard flags, especially in monsoon swell." },
  // Manali
  { destination: "manali", category: "weather", title: "Snow closes Solang Valley roads", tip: "Dec–Feb can bring snow closures on the Solang/Rohtang road — check conditions the morning of, not the night before." },
  { destination: "manali", category: "custom", title: "Altitude affects some travelers", tip: "Manali itself is manageable, but day trips higher up can cause mild altitude symptoms — pace yourself and hydrate." },
  { destination: "manali", category: "transport", title: "Old Manali is best explored on foot", tip: "Old Manali's cafes and lanes are walkable — most day-trippers don't need a cab once they're there." },
  { destination: "manali", category: "connectivity", title: "Signal drops past Solang", tip: "Network coverage gets patchy beyond Solang Valley — download offline maps before heading up." },
];

async function main() {
  const placeIdByKey = new Map<string, string>();

  for (const place of places) {
    let record = await prisma.place.findFirst({ where: { destination: place.destination, name: place.name } });
    if (!record) {
      record = await prisma.place.create({ data: place });
    }
    placeIdByKey.set(`${place.destination}::${place.name}`, record.id);
  }
  console.log(`Seeded ${places.length} places.`);

  for (const hotel of hotels) {
    const existing = await prisma.hotel.findFirst({ where: { destination: hotel.destination, name: hotel.name } });
    if (!existing) {
      await prisma.hotel.create({ data: hotel });
    }
  }
  console.log(`Seeded ${hotels.length} hotels.`);

  let reviewCount = 0;
  for (const place of places) {
    const placeId = placeIdByKey.get(`${place.destination}::${place.name}`)!;
    const existingReviews = await prisma.review.count({ where: { placeId } });
    if (existingReviews > 0) continue;
    const reviews = generateReviews(placeId, place.name, place.rating);
    for (const review of reviews) {
      await prisma.review.create({ data: review });
    }
    reviewCount += reviews.length;
  }
  console.log(`Seeded ${reviewCount} reviews.`);

  for (const intel of localIntel) {
    const existing = await prisma.localIntel.findFirst({
      where: { destination: intel.destination, title: intel.title },
    });
    if (!existing) {
      await prisma.localIntel.create({ data: intel });
    }
  }
  console.log(`Seeded ${localIntel.length} local intel tips.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
