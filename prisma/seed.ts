import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/client";
import bcrypt from "bcrypt";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...\n");

  await prisma.favorite.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.meal.deleteMany();
  await prisma.providerProfile.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  console.log("Cleaned existing data\n");

  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const admin = await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "admin@foodhub.com",
      password: adminPassword,
      role: "ADMIN",
      phone: "01700000000",
    },
  });
  console.log(`Admin created: ${admin.email}`);

  const customerPassword = await bcrypt.hash("Customer@123", 12);

  const customer1 = await prisma.user.create({
    data: {
      name: "Rahim Uddin",
      email: "rahim@example.com",
      password: customerPassword,
      role: "CUSTOMER",
      phone: "01811111111",
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      name: "Sumaiya Akter",
      email: "sumaiya@example.com",
      password: customerPassword,
      role: "CUSTOMER",
      phone: "01822222222",
    },
  });
  console.log(`Customers created: ${customer1.email}, ${customer2.email}`);

  const providerPassword = await bcrypt.hash("Provider@123", 12);

  const provider1User = await prisma.user.create({
    data: {
      name: "Karim Hossain",
      email: "spicegarden@foodhub.com",
      password: providerPassword,
      role: "PROVIDER",
      phone: "01933333333",
    },
  });

  const provider2User = await prisma.user.create({
    data: {
      name: "Nadia Begum",
      email: "quickbites@foodhub.com",
      password: providerPassword,
      role: "PROVIDER",
      phone: "01944444444",
    },
  });
  console.log(
    `Provider users created: ${provider1User.email}, ${provider2User.email}`,
  );

  const provider1 = await prisma.providerProfile.create({
    data: {
      userId: provider1User.id,
      businessName: "Spice Garden",
      slug: "spice-garden",
      description:
        "Authentic Bangladeshi home-cooked meals delivered fresh to your door.",
      address: "House 12, Road 4, Dhanmondi",
      city: "Dhaka",
      cuisineSpecialties: ["Bangla", "Biryani", "Curry"],
      approvalStatus: "APPROVED",
      isOpen: true,
      averageRating: 4.5,
    },
  });

  const provider2 = await prisma.providerProfile.create({
    data: {
      userId: provider2User.id,
      businessName: "Quick Bites",
      slug: "quick-bites",
      description:
        "Fast food favorites made with fresh ingredients. Quick, tasty, and affordable.",
      address: "Shop 3, Gulshan Avenue",
      city: "Dhaka",
      cuisineSpecialties: ["Fast Food", "Burgers", "Sandwiches"],
      approvalStatus: "APPROVED",
      isOpen: true,
      averageRating: 4.2,
    },
  });
  console.log(
    `Provider profiles created: ${provider1.businessName}, ${provider2.businessName}`,
  );

  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Bangla",
        slug: "bangla",
        icon: "bangla",
        description: "Traditional Bangladeshi home-cooked meals",
      },
    }),
    prisma.category.create({
      data: {
        name: "Fast Food",
        slug: "fast-food",
        icon: "fast-food",
        description: "Burgers, fries, sandwiches and more",
      },
    }),
    prisma.category.create({
      data: {
        name: "Desserts",
        slug: "desserts",
        icon: "desserts",
        description: "Sweet treats and desserts",
      },
    }),
    prisma.category.create({
      data: {
        name: "Drinks",
        slug: "drinks",
        icon: "drinks",
        description: "Refreshing beverages and drinks",
      },
    }),
    prisma.category.create({
      data: {
        name: "Chinese",
        slug: "chinese",
        icon: "chinese",
        description: "Chinese cuisine and noodles",
      },
    }),
    prisma.category.create({
      data: {
        name: "Healthy",
        slug: "healthy",
        icon: "healthy",
        description: "Nutritious and healthy food options",
      },
    }),
  ]);

  const [bangla, fastFood, desserts, drinks, chinese, healthy] = categories;
  console.log(`${categories.length} categories created`);

  const meals = await Promise.all([
    // Spice Garden meals (Bangla & Chinese)
    prisma.meal.create({
      data: {
        providerProfileId: provider1.id,
        categoryId: bangla.id,
        title: "Beef Kacchi Biryani",
        slug: "beef-kacchi-biryani-spice-garden",
        shortDescription: "Authentic Dhaka-style kacchi biryani",
        description:
          "Tender beef cooked with fragrant basmati rice, saffron, and traditional spices. A Dhaka classic.",
        price: 280,
        availabilityStatus: "AVAILABLE",
        spiceLevel: "Medium",
        dietaryTags: ["Halal"],
        preparationTime: 45,
        featured: true,
      },
    }),
    prisma.meal.create({
      data: {
        providerProfileId: provider1.id,
        categoryId: bangla.id,
        title: "Chicken Rezala",
        slug: "chicken-rezala-spice-garden",
        shortDescription: "Creamy white Mughlai chicken curry",
        description:
          "Slow-cooked chicken in a rich yogurt and cream sauce with whole spices. Served with naan.",
        price: 220,
        availabilityStatus: "AVAILABLE",
        spiceLevel: "Mild",
        dietaryTags: ["Halal"],
        preparationTime: 30,
        featured: true,
      },
    }),
    prisma.meal.create({
      data: {
        providerProfileId: provider1.id,
        categoryId: bangla.id,
        title: "Hilsa Fish Curry",
        slug: "hilsa-fish-curry-spice-garden",
        shortDescription: "Traditional ilish macher jhol",
        description:
          "Fresh hilsa fish cooked in mustard oil with turmeric and green chili. A Bengali delicacy.",
        price: 350,
        availabilityStatus: "AVAILABLE",
        spiceLevel: "Medium",
        dietaryTags: ["Halal", "Gluten-Free"],
        preparationTime: 25,
        featured: false,
      },
    }),
    prisma.meal.create({
      data: {
        providerProfileId: provider1.id,
        categoryId: chinese.id,
        title: "Chicken Fried Rice",
        slug: "chicken-fried-rice-spice-garden",
        shortDescription: "Wok-tossed rice with chicken and vegetables",
        description:
          "Fluffy rice stir-fried with tender chicken, eggs, mixed vegetables and soy sauce.",
        price: 180,
        availabilityStatus: "AVAILABLE",
        spiceLevel: "Mild",
        dietaryTags: ["Halal"],
        preparationTime: 20,
        featured: false,
      },
    }),
    prisma.meal.create({
      data: {
        providerProfileId: provider1.id,
        categoryId: chinese.id,
        title: "Beef Chow Mein",
        slug: "beef-chow-mein-spice-garden",
        shortDescription: "Crispy noodles with tender beef strips",
        description:
          "Egg noodles tossed with marinated beef, bell peppers, onion, and savory sauce.",
        price: 200,
        availabilityStatus: "AVAILABLE",
        spiceLevel: "Medium",
        dietaryTags: ["Halal"],
        preparationTime: 20,
        featured: false,
      },
    }),

    prisma.meal.create({
      data: {
        providerProfileId: provider2.id,
        categoryId: fastFood.id,
        title: "Classic Beef Burger",
        slug: "classic-beef-burger-quick-bites",
        shortDescription: "Juicy beef patty with fresh toppings",
        description:
          "100% beef patty with lettuce, tomato, onion, and signature sauce in a toasted brioche bun.",
        price: 220,
        availabilityStatus: "AVAILABLE",
        spiceLevel: "Mild",
        dietaryTags: ["Halal"],
        preparationTime: 15,
        featured: true,
      },
    }),
    prisma.meal.create({
      data: {
        providerProfileId: provider2.id,
        categoryId: fastFood.id,
        title: "Crispy Chicken Sandwich",
        slug: "crispy-chicken-sandwich-quick-bites",
        shortDescription: "Crunchy fried chicken with coleslaw",
        description:
          "Crispy fried chicken fillet with creamy coleslaw and pickles in a soft bun.",
        price: 180,
        availabilityStatus: "AVAILABLE",
        spiceLevel: "Mild",
        dietaryTags: ["Halal"],
        preparationTime: 15,
        featured: false,
      },
    }),
    prisma.meal.create({
      data: {
        providerProfileId: provider2.id,
        categoryId: desserts.id,
        title: "Mango Cheesecake",
        slug: "mango-cheesecake-quick-bites",
        shortDescription: "Creamy cheesecake with fresh mango topping",
        description:
          "Smooth and creamy New York style cheesecake topped with fresh Langra mango sauce.",
        price: 150,
        availabilityStatus: "AVAILABLE",
        spiceLevel: "None",
        dietaryTags: ["Vegetarian"],
        preparationTime: 5,
        featured: true,
      },
    }),
    prisma.meal.create({
      data: {
        providerProfileId: provider2.id,
        categoryId: drinks.id,
        title: "Fresh Mango Lassi",
        slug: "fresh-mango-lassi-quick-bites",
        shortDescription: "Chilled yogurt drink with fresh mango",
        description:
          "Thick and creamy mango lassi made with fresh alphonso mangoes and yogurt.",
        price: 80,
        availabilityStatus: "AVAILABLE",
        spiceLevel: "None",
        dietaryTags: ["Vegetarian", "Gluten-Free"],
        preparationTime: 5,
        featured: false,
      },
    }),
    prisma.meal.create({
      data: {
        providerProfileId: provider2.id,
        categoryId: healthy.id,
        title: "Grilled Chicken Salad",
        slug: "grilled-chicken-salad-quick-bites",
        shortDescription: "Fresh greens with grilled chicken",
        description:
          "Grilled chicken breast on a bed of romaine, cherry tomatoes, cucumber, and honey mustard dressing.",
        price: 200,
        availabilityStatus: "AVAILABLE",
        spiceLevel: "None",
        dietaryTags: ["Halal", "Gluten-Free", "Low-Carb"],
        preparationTime: 10,
        featured: false,
      },
    }),
  ]);
  console.log(`${meals.length} meals created`);

  console.log("\n--- Seeding completed successfully! ---\n");
  console.log("Seed credentials:");
  console.log(`  Admin    : admin@foodhub.com          | Admin@123`);
  console.log(`  Customer : rahim@example.com          | Customer@123`);
  console.log(`  Customer : sumaiya@example.com        | Customer@123`);
  console.log(`  Provider : spicegarden@foodhub.com    | Provider@123`);
  console.log(`  Provider : quickbites@foodhub.com     | Provider@123`);
  console.log(`  Categories : ${categories.length}`);
  console.log(`  Meals      : ${meals.length}\n`);
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
