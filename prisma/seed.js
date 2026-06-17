const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const categories = [
  { name: 'Event Centers', slug: 'event-centers', description: 'Venues, halls, gardens and spaces for hosting events' },
  { name: 'Event Planners', slug: 'event-planners', description: 'Professional planning, coordination, and event design' },
  { name: 'Ushering Agencies', slug: 'ushering-agencies', description: 'Professional ushers, protocol agents, and guest managers' },
  { name: 'Caterers', slug: 'caterers', description: 'Food service, drinks, buffet, and local/continental dishes' },
  { name: 'Photographers', slug: 'photographers', description: 'Wedding, corporate event, and portfolio photography/videography' },
  { name: 'Decorators', slug: 'decorators', description: 'Floral design, lighting, stage decor, and hall setups' },
  { name: 'DJs', slug: 'djs', description: 'Sound systems, disc jockeys, and music curation' },
  { name: 'MCs', slug: 'mcs', description: 'Master of ceremonies and professional hosts' },
  { name: 'Makeup Artists', slug: 'makeup-artists', description: 'Bridal, event, and editorial makeup services' },
  { name: 'Security Services', slug: 'security-services', description: 'Bouncers, event security, and asset protection teams' },
  { name: 'Furniture Rentals', slug: 'furniture-rentals', description: 'Chairs, tables, lounge furniture, and stages for hire' },
  { name: 'Tent Providers', slug: 'tent-providers', description: 'Canopies, marquees, and outdoor shading systems' },
  { name: 'Live Bands', slug: 'live-bands', description: 'Live musical bands, instrumentalists, and singers' }
];

const IMAGE_POOLS = {
  'event-centers': [
    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1505232458627-a720f795f68e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80"
  ],
  'event-planners': [
    "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1522158673376-3c72b228230e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1531058020387-3be344559be6?auto=format&fit=crop&w=800&q=80"
  ],
  'ushering-agencies': [
    "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1561489396-888724a1543d?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80"
  ],
  'caterers': [
    "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80"
  ],
  'decorators': [
    "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80"
  ],
  'photographers': [
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1452780212940-6f5c0d14d84a?auto=format&fit=crop&w=800&q=80"
  ],
  'djs': [
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1516873240891-4bf014598ab4?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1486591978090-58e619d37fe7?auto=format&fit=crop&w=800&q=80"
  ],
  'makeup-artists': [
    "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1457972729786-0411a8b2704b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80"
  ],
  'mcs': [
    "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80"
  ],
  'security-services': [
    "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=80"
  ],
  'furniture-rentals': [
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1581428982868-e410dd047a90?auto=format&fit=crop&w=800&q=80"
  ],
  'tent-providers': [
    "https://images.unsplash.com/photo-1505232458627-a720f795f68e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80"
  ],
  'live-bands': [
    "https://images.unsplash.com/photo-1487180142328-0c4e37023af5?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80"
  ]
};

// Seed Metadata helpers
const ACCRA_NEIGHBORHOODS = [
  { name: "East Legon", lat: 5.6322, lon: -0.1654, region: "Greater Accra", city: "Accra" },
  { name: "Osu", lat: 5.5583, lon: -0.1833, region: "Greater Accra", city: "Accra" },
  { name: "Spintex", lat: 5.6212, lon: -0.0894, region: "Greater Accra", city: "Accra" },
  { name: "Cantonments", lat: 5.5801, lon: -0.1702, region: "Greater Accra", city: "Accra" },
  { name: "Tema", lat: 5.6698, lon: -0.0165, region: "Greater Accra", city: "Tema" }
];

const KUMASI_NEIGHBORHOODS = [
  { name: "Asokwa", lat: 6.6781, lon: -1.6022, region: "Ashanti", city: "Kumasi" },
  { name: "Nhyiaeso", lat: 6.6912, lon: -1.6341, region: "Ashanti", city: "Kumasi" },
  { name: "Ahodwo", lat: 6.6624, lon: -1.6215, region: "Ashanti", city: "Kumasi" },
  { name: "KNUST area", lat: 6.6835, lon: -1.5714, region: "Ashanti", city: "Kumasi" }
];

const TAKORADI_NEIGHBORHOODS = [
  { name: "Takoradi Central", lat: 4.9011, lon: -1.7522, region: "Western", city: "Takoradi" },
  { name: "Beach Road", lat: 4.8924, lon: -1.7615, region: "Western", city: "Takoradi" }
];

const CUSTOMER_REVIEW_TEXTS = [
  "Absolutely top-notch service! Extremely professional and punctual.",
  "Outstanding experience. The team handled everything flawlessly.",
  "Highly recommended event provider. Guests were very impressed.",
  "Great quality of work. Clean setup and excellent coordination.",
  "Will definitely book them again for our next corporate gala.",
  "Prompt responses and very reliable during our wedding planning."
];

function generatePhone() {
  const prefix = ["24", "54", "55", "20", "27"];
  const randomPrefix = prefix[Math.floor(Math.random() * prefix.length)];
  let number = "";
  for (let i = 0; i < 7; i++) {
    number += Math.floor(Math.random() * 10);
  }
  return `+233${randomPrefix}${number}`;
}

async function main() {
  console.log('Seeding lookup categories...');
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // Passwords are "password123"
  const dummyHash = '$2a$12$R9h/lIPzNgb.O7.D1fE1x.aK.X0s2D4h/Q5V5P.x/QZ5pM2XzHwNu';

  console.log('Seeding core users...');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@eventhub.com' },
    update: {},
    create: {
      email: 'admin@eventhub.com',
      passwordHash: dummyHash,
      fullName: 'EventHub Admin',
      role: 'ADMIN',
    },
  });

  // Seed 5 different customers to write reviews
  const customers = [];
  const customerNames = ["Akwasi Mensah", "Ama Serwaa", "Kweku Boateng", "Esi Ampofo", "Yaw Frimpong"];
  for (let i = 0; i < 5; i++) {
    const cust = await prisma.user.upsert({
      where: { email: `customer${i + 1}@eventhub.com` },
      update: {},
      create: {
        email: `customer${i + 1}@eventhub.com`,
        passwordHash: dummyHash,
        fullName: customerNames[i],
        role: 'CUSTOMER',
      },
    });
    customers.push(cust);
  }

  console.log('Generating dynamic 200+ vendor database...');
  
  // Total Target count: 206 vendors
  // Category splits: Event Centers: 60, Event Planners: 45, Ushering Agencies: 45. Caterers: 12, Decorators: 12, Photographers: 12, DJs: 10, Makeup: 10
  const vendorConfig = [
    { catSlug: "event-centers", prefix: ["Royal", "Gold Star", "Silver", "Infinity", "Prestige", "Emerald", "Serene", "Boundary"], suffix: ["Gardens", "Event Center", "Pavilion", "Halls", "Orchard", "Vista", "Manor"], count: 60 },
    { catSlug: "event-planners", prefix: ["Deluxe", "Signature", "Elegance", "Vogue", "Perfect", "Opulent", "Seamless", "Divine"], suffix: ["Events", "Planners", "Coordination", "Designs", "Partners"], count: 45 },
    { catSlug: "ushering-agencies", prefix: ["Elite", "Royal", "First Class", "Prime", "Crown", "Protocol", "Sleek", "Starlight"], suffix: ["Ushers", "Hostesses", "Ambassadors", "Protocol Crew"], count: 45 },
    { catSlug: "caterers", prefix: ["Aroma", "Savory", "Taste of Ghana", "Spices", "Gourmet", "Sweet Feast"], suffix: ["Catering", "Delicacies", "Kitchen", "Table"], count: 12 },
    { catSlug: "decorators", prefix: ["Floral", "Lumiere", "Petals & Silk", "Splendid", "Decors"], suffix: ["Designers", "Stage Decors", "Decor Studio"], count: 12 },
    { catSlug: "photographers", prefix: ["Lenscraft", "Pixel", "Shutter", "Studio GH", "Visuals"], suffix: ["Photography", "Studio", "Media"], count: 12 },
    { catSlug: "djs", prefix: ["DJ Vibe", "DJ Spin", "Bassline", "Groove", "Soundwave"], suffix: ["Entertainment", "Audio Services"], count: 10 },
    { catSlug: "makeup-artists", prefix: ["Glow Studio", "Glam", "Touch of Gold", "Bridal Glow"], suffix: ["Beauty Touch", "Studio", "Bridals"], count: 10 }
  ];

  let vendorIndex = 1;

  for (const group of vendorConfig) {
    console.log(`Generating group: ${group.catSlug} (${group.count} vendors)...`);
    
    for (let c = 0; c < group.count; c++) {
      const vId = `vendor-programmatic-id-${vendorIndex}`;
      
      // Determine Geolocation distribution: 70% Accra/Tema, 25% Kumasi, 5% Takoradi
      let geo = null;
      const randGeo = Math.random();
      if (randGeo < 0.70) {
        geo = ACCRA_NEIGHBORHOODS[Math.floor(Math.random() * ACCRA_NEIGHBORHOODS.length)];
      } else if (randGeo < 0.95) {
        geo = KUMASI_NEIGHBORHOODS[Math.floor(Math.random() * KUMASI_NEIGHBORHOODS.length)];
      } else {
        geo = TAKORADI_NEIGHBORHOODS[Math.floor(Math.random() * TAKORADI_NEIGHBORHOODS.length)];
      }

      // Dynamic name combinations
      const name = `${group.prefix[c % group.prefix.length]} ${group.suffix[Math.floor(Math.random() * group.suffix.length)]} ${vendorIndex}`;
      
      // Descriptive paragraph generators
      const desc = `Professional event service provider specializing in ${group.catSlug.replace('-', ' ')} setups. Catering weddings, corporate summits, and private galas in ${geo.name}, ${geo.city}. Committed to reliability and premium results.`;

      // Static placeholder imagery
      const staticImages = [
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3",
        "https://images.unsplash.com/photo-1469371670807-013ccf25f16a",
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622"
      ];

      // Randomize verification statuses (40% Verified)
      const isVerified = Math.random() < 0.40;
      const verificationLevels = ["BASIC", "BUSINESS", "PREMIUM"];
      const level = isVerified ? verificationLevels[Math.floor(Math.random() * verificationLevels.length)] : null;

      // Check-and-upsert lookup to allow multiple executions
      const vendor = await prisma.vendor.upsert({
        where: { id: vId },
        update: {
          isVerified,
          verificationLevel: level,
          location: `${geo.name} High Road, ${geo.city}`,
          city: geo.city,
          region: geo.region,
          latitude: geo.lat + (Math.random() - 0.5) * 0.005, // Subtle random variation around center coordinate
          longitude: geo.lon + (Math.random() - 0.5) * 0.005,
        },
        create: {
          id: vId,
          name,
          description: desc,
          location: `${geo.name} High Road, ${geo.city}`,
          city: geo.city,
          region: geo.region,
          country: "Ghana",
          latitude: geo.lat + (Math.random() - 0.5) * 0.005,
          longitude: geo.lon + (Math.random() - 0.5) * 0.005,
          phone: generatePhone(),
          email: `info@${name.toLowerCase().replace(/[^a-z0-9]+/g, '')}.com`,
          website: `https://www.${name.toLowerCase().replace(/[^a-z0-9]+/g, '')}.com`,
          isVerified,
          verificationLevel: level,
          categories: {
            create: [
              {
                category: {
                  connect: { slug: group.catSlug }
                }
              }
            ]
          }
        }
      });

      // Initialize default metrics
      const views = Math.floor(Math.random() * 200) + 10;
      const inquiries = Math.floor(views * (Math.random() * 0.12));
      const favorites = Math.floor(views * (Math.random() * 0.08));

      await prisma.vendorAnalytics.upsert({
        where: { vendorId: vendor.id },
        update: {},
        create: {
          vendorId: vendor.id,
          profileViews: views,
          inquiryCount: inquiries,
          favoritesCount: favorites,
          proposalCount: Math.floor(Math.random() * 5)
        }
      });

      // Programmatically add reviews for at least 60 vendors
      let avgRating = 0.0;
      let reviewVolume = 0;

      if (vendorIndex <= 65) {
        const numReviews = Math.floor(Math.random() * 3) + 2; // 2 to 4 reviews
        let totalStars = 0;

        for (let r = 0; r < numReviews; r++) {
          const rRating = Math.floor(Math.random() * 2) + 4; // 4 or 5 stars
          totalStars += rRating;
          
          await prisma.review.create({
            data: {
              vendorId: vendor.id,
              userId: customers[r % customers.length].id,
              rating: rRating,
              reviewText: CUSTOMER_REVIEW_TEXTS[Math.floor(Math.random() * CUSTOMER_REVIEW_TEXTS.length)],
            }
          });
        }
        reviewVolume = numReviews;
        avgRating = totalStars / numReviews;
      }

      await prisma.reputationScore.upsert({
        where: { vendorId: vendor.id },
        update: {
          averageRating: avgRating,
          reviewVolume: reviewVolume
        },
        create: {
          vendorId: vendor.id,
          averageRating: avgRating,
          reviewVolume: reviewVolume,
          responseSpeedMinutes: Math.floor(Math.random() * 40) + 10,
          inquiryConversionRate: parseFloat((Math.random() * 0.3 + 0.6).toFixed(2)),
          profileCompletenessPct: Math.floor(Math.random() * 40) + 50,
          bookingCompletionRate: parseFloat((Math.random() * 0.2 + 0.8).toFixed(2))
        }
      });

      // Seed Portfolio Projects and Images
      const projectCount = await prisma.portfolioProject.count({
        where: { vendorId: vendor.id }
      });
      if (projectCount === 0) {
        const imageUrls = IMAGE_POOLS[group.catSlug] || IMAGE_POOLS['event-centers'];
        for (let pIdx = 1; pIdx <= 2; pIdx++) {
          const projectImg1 = imageUrls[(c * 2 + (pIdx - 1) * 2) % imageUrls.length];
          const projectImg2 = imageUrls[(c * 2 + (pIdx - 1) * 2 + 1) % imageUrls.length];
          
          await prisma.portfolioProject.create({
            data: {
              vendorId: vendor.id,
              title: `${vendor.name} Showcase Project ${pIdx}`,
              eventType: pIdx === 1 ? 'Wedding Reception' : 'Corporate Gala',
              guestCount: 150 + pIdx * 50,
              budgetRange: `GHS ${10000 * pIdx} - ${20000 * pIdx}`,
              description: `A stunning showcase of our premium services executed in ${geo.city}. Everything was customized to client specifications and delivered with high professionalism.`,
              testimonial: `Amazing execution by ${vendor.name}. Our guests were wowed!`,
              images: {
                create: [
                  { imageUrl: projectImg1, isPrimary: true },
                  { imageUrl: projectImg2, isPrimary: false }
                ]
              }
            }
          });
        }
      }

      vendorIndex++;
    }
  }

  console.log(`Seeding complete! Successfully generated ${vendorIndex - 1} programmatic event vendor records.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
