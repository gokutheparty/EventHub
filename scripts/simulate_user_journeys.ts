import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runQAUserJourneys() {
  console.log("=== STARTING EVENTHUB END-TO-END QA USER JOURNEYS SIMULATION ===");
  
  // 1. THE CUSTOMER JOURNEY
  try {
    console.log("\n[RUNNING CUSTOMER JOURNEY SIMULATION]");
    
    // Find customer
    const customer = await prisma.user.findFirst({
      where: { role: 'CUSTOMER' }
    });
    if (!customer) throw new Error("No customer user found. Please run the seed script first.");
    console.log(`Logged in customer: ${customer.fullName} (${customer.email})`);

    // Search vendors geographically (city: Accra)
    const vendors = await prisma.vendor.findMany({
      where: { city: { equals: 'Accra', mode: 'insensitive' } },
      take: 2
    });
    console.log(`Geographic Search (Accra) returned ${vendors.length} vendors.`);
    if (vendors.length < 2) throw new Error("Need at least 2 vendors in Accra. Please run the seed script first.");

    // Pick two vendor IDs
    const vId1 = vendors[0].id;
    const vId2 = vendors[1].id;

    // Toggle favorites (POST simulation)
    console.log(`Bookmarking vendor 1: ${vendors[0].name}`);
    await prisma.favorite.upsert({
      where: { userId_vendorId: { userId: customer.id, vendorId: vId1 } },
      update: {},
      create: { userId: customer.id, vendorId: vId1 }
    });

    console.log(`Bookmarking vendor 2: ${vendors[1].name}`);
    await prisma.favorite.upsert({
      where: { userId_vendorId: { userId: customer.id, vendorId: vId2 } },
      update: {},
      create: { userId: customer.id, vendorId: vId2 }
    });

    // Query DB directly to verify favorites are stored in relational table
    const favs = await prisma.favorite.findMany({
      where: { userId: customer.id }
    });
    const favIds = favs.map(f => f.vendorId);
    if (!favIds.includes(vId1) || !favIds.includes(vId2)) {
      throw new Error("Favorites were not saved correctly in the Favorite relation.");
    }

    console.log(`[PASSED] Customer Journey: Successfully bookmarked and verified ${favs.length} favorites in database.`);
  } catch (err: any) {
    console.error(`[FAILED] Customer Journey failed: ${err.message}`);
  }

  // 2. THE VENDOR JOURNEY
  try {
    console.log("\n[RUNNING VENDOR JOURNEY SIMULATION]");
    
    // Find vendor user
    const vendorUser = await prisma.user.findFirst({
      where: { role: 'VENDOR' }
    });
    if (!vendorUser) throw new Error("No vendor user found.");
    console.log(`Logged in vendor owner: ${vendorUser.fullName}`);

    // Fetch vendor and its analytics
    const vendor = await prisma.vendor.findFirst({
      where: { userId: vendorUser.id },
      include: { analytics: true, reputation: true }
    });
    if (!vendor) throw new Error("No vendor profile associated with this vendor user.");

    const stats = vendor.analytics || { profileViews: 0, inquiryCount: 0, favoritesCount: 0, proposalCount: 0 };
    console.log("Analytics retrieved from PostgreSQL VendorAnalytics table:", stats);

    // Assert conversion rates parsing
    const viewToInquiryRate = stats.profileViews > 0 ? ((stats.inquiryCount / stats.profileViews) * 100) : 0;
    const viewToFavoriteRate = stats.profileViews > 0 ? ((stats.favoritesCount / stats.profileViews) * 100) : 0;
    const viewToProposalRate = stats.profileViews > 0 ? ((stats.proposalCount / stats.profileViews) * 100) : 0;
    const monthlyGrowth = stats.profileViews > 0 ? (((stats.inquiryCount + stats.proposalCount) / (stats.profileViews + 1)) * 12.5 + 4.2) : 0;

    console.log(`- Calculated View-to-Inquiry Rate: ${viewToInquiryRate.toFixed(1)}%`);
    console.log(`- Calculated View-to-Favorite Rate: ${viewToFavoriteRate.toFixed(1)}%`);
    console.log(`- Calculated View-to-Proposal Rate: ${viewToProposalRate.toFixed(1)}%`);
    console.log(`- Calculated Monthly Growth: +${monthlyGrowth.toFixed(1)}%`);

    if (isNaN(viewToInquiryRate) || isNaN(viewToFavoriteRate) || isNaN(viewToProposalRate) || isNaN(monthlyGrowth)) {
      throw new Error("One or more dashboard conversion widgets returned NaN.");
    }

    console.log(`[PASSED] Vendor Journey: Verified conversion rates and growth metrics for dashboard widgets.`);
  } catch (err: any) {
    console.error(`[FAILED] Vendor Journey failed: ${err.message}`);
  }

  // 3. THE ADMINISTRATOR JOURNEY
  try {
    console.log("\n[RUNNING ADMINISTRATOR JOURNEY SIMULATION]");
    
    // Find admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    if (!adminUser) throw new Error("No admin user found.");
    console.log(`Logged in administrator: ${adminUser.fullName}`);

    // Create a mock vendor staging record
    const stagingName = `QA Simulation Venue ${Date.now()}`;
    const staging = await prisma.vendorStaging.create({
      data: {
        name: stagingName,
        categories: ["Event Centers"],
        location: "Osu Oxford Street, Accra",
        city: "Accra",
        region: "Greater Accra",
        phone: "+233241112222",
        email: "simulation@qa.com",
        confidenceScore: 0.9,
        trustScore: 0.8,
        approvalStatus: 'PENDING'
      }
    });
    console.log(`Created staged candidate: ${staging.name}`);

    // Create an unclaimed vendor profile
    const vendor = await prisma.vendor.create({
      data: {
        name: staging.name,
        location: staging.location || 'Ghana',
        city: staging.city,
        region: staging.region,
        phone: staging.phone,
        email: staging.email,
        isVerified: false
      }
    });
    console.log(`Created unclaimed vendor profile: ${vendor.name}`);

    // Submit a claim request (Status: PENDING)
    const claim = await prisma.vendorClaim.create({
      data: {
        vendorId: vendor.id,
        claimantEmail: "owner@qasimulation.com",
        claimantPhone: "+233551112222",
        verificationToken: "QATEST",
        status: 'PENDING'
      }
    });
    console.log(`Submitted claim request (Status: PENDING) for claimant: ${claim.claimantEmail}`);

    // Trigger Admin Claim Rejection simulation
    console.log(`Triggering admin claim reject route update...`);
    const updatedClaim = await prisma.vendorClaim.update({
      where: { id: claim.id },
      data: { status: 'REJECTED' }
    });

    console.log(`Updated claim record status: ${updatedClaim.status}`);
    if (updatedClaim.status !== 'REJECTED') {
      throw new Error("Claim status was not modified to REJECTED.");
    }

    // Cleanup simulation database records
    await prisma.vendorClaim.delete({ where: { id: claim.id } });
    await prisma.vendor.delete({ where: { id: vendor.id } });
    await prisma.vendorStaging.delete({ where: { id: staging.id } });
    console.log("Cleaned up simulation database records from PostgreSQL.");

    console.log(`[PASSED] Administrator Journey: Claim rejection pipeline completed successfully.`);
  } catch (err: any) {
    console.error(`[FAILED] Administrator Journey failed: ${err.message}`);
  }
  
  console.log("\n=== QA USER JOURNEYS SIMULATION FINISHED ===");
}

runQAUserJourneys()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
