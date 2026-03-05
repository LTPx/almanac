const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Seed: Pre-crea las 5 categorías de capas y sus 45 traits
 * para la Colección B "The Explorer" (sistema generativo).
 *
 * Los traits se crean sin imageUrl (placeholder) — el admin
 * sube las imágenes reales después via el panel.
 *
 * Uso: npx ts-node prisma/seed-layers-nfts.ts
 */

// Pesos para Suits (definen la rareza del NFT)
const SUIT_WEIGHTS = {
  Normal: 75, // ~75% probabilidad
  Rare: 20, // ~20%
  Epic: 5 // ~5%
};

// Categorías y sus traits
const LAYER_DATA = [
  {
    name: "Background",
    order: 0,
    isRequired: true,
    traits: [
      { name: "BG_01_AgenticAI - The Synthesis Hall", weight: 100 },
      { name: "BG_02_ZKArch - The Crystal Palace", weight: 100 },
      { name: "BG_03_SynBio - The Solarpunk Lab", weight: 100 },
      { name: "BG_04_Climate - The Eden Project", weight: 100 },
      { name: "BG_05_CCSE - The Golden Plaza", weight: 100 },
      { name: "BG_06_EFPA - The Abundance Center", weight: 100 },
      { name: "BG_07_Fallacies - The Observatory", weight: 100 },
      { name: "BG_08_Math - The Geometry Garden", weight: 100 },
      { name: "BG_09_Physics - The Fusion Core", weight: 100 },
      { name: "BG_10_Biology - The Life Stream", weight: 100 },
      { name: "BG_11_Language - The Holographic Archive", weight: 100 },
      { name: "BG_12_Astronomy - The Starlight Deck", weight: 100 },
      { name: "BG_13_Civics - The Forum of Light", weight: 100 },
      { name: "BG_14_Engineering - The Orbital Atrium", weight: 100 }
    ]
  },
  {
    name: "Body",
    order: 1,
    isRequired: true,
    traits: [
      { name: "Base_01_Light", weight: 100 },
      { name: "Base_02_Med", weight: 100 },
      { name: "Base_03_Dark", weight: 100 },
      { name: "Base_04_Android", weight: 100 }
    ]
  },
  {
    name: "Suit",
    order: 2,
    isRequired: true,
    traits: [
      {
        name: 'Suit_Normal - "Field Standard"',
        weight: SUIT_WEIGHTS.Normal
      },
      {
        name: 'Suit_Rare - "Tech-Enhanced"',
        weight: SUIT_WEIGHTS.Rare
      },
      { name: 'Suit_Epic - "Ascended"', weight: SUIT_WEIGHTS.Epic }
    ]
  },
  {
    name: "Head",
    order: 3,
    isRequired: true,
    traits: [
      { name: "Head_01 - The Optimist", weight: 100 },
      { name: "Head_02 - The Confident", weight: 100 },
      { name: "Head_03 - The Visionary", weight: 100 },
      { name: "Head_04 - The Flow State", weight: 100 },
      { name: "Head_05 - Communicator", weight: 100 },
      { name: "Head_06 - Explorer", weight: 100 },
      { name: "Head_07 - Creator", weight: 100 },
      { name: "Head_08 - Synth", weight: 100 },
      { name: "Head_09 - Wonder", weight: 100 },
      { name: "Head_10 - Starchild", weight: 100 }
    ]
  },
  {
    name: "Prop",
    order: 4,
    isRequired: true,
    traits: [
      { name: "Prop_AgenticAI - Consciousness Core", weight: 100 },
      { name: "Prop_ZKArch - Reality Key", weight: 100 },
      { name: "Prop_SynBio - Genesis Gauntlet", weight: 100 },
      { name: "Prop_Climate - Atmos-Sphere", weight: 100 },
      { name: "Prop_CCSE - Unity Torch", weight: 100 },
      { name: "Prop_EFPA - Prosperity Engine", weight: 100 },
      { name: "Prop_Fallacies - Tru-Sight Monocle", weight: 100 },
      { name: "Prop_Math - Infinity Loom", weight: 100 },
      { name: "Prop_Physics - Matter Manipulator", weight: 100 },
      { name: "Prop_Biology - Vitruvian Scanner", weight: 100 },
      { name: "Prop_Language - Glyph Cloud", weight: 100 },
      { name: "Prop_Astronomy - Star-Drive", weight: 100 },
      { name: "Prop_Civics - Consensus Scepter", weight: 100 },
      { name: "Prop_Engineering - Matter Printer", weight: 100 }
    ]
  }
];

async function main() {
  // Buscar la colección "Explorer" o la primera activa
  let collection = await prisma.nFTCollection.findFirst({
    where: {
      name: "Collectible Almanac NFTs"
      // OR: [
      //   { name: { contains: "Collectible", mode: "insensitive" } },
      //   { name: { contains: "Almanac", mode: "insensitive" } },
      //   { isActive: true }
      // ]
    }
  });

  if (!collection) {
    console.log("No collection found. Creating 'The Explorer' collection...");
    collection = await prisma.nFTCollection.create({
      data: {
        name: "The Explorer",
        symbol: "ALMXPLR",
        description:
          "The Cosmic Field Researcher. An avatar that represents the best version of the learner. Generative layered system.",
        contractAddress: "0x0000000000000000000000000000000000000000", // placeholder
        chainId: 80002,
        isActive: true,
        maxSupply: 10000,
        defaultRoyaltyBps: 500
      }
    });
    console.log(`  Created collection: ${collection.name} (${collection.id})`);
  } else {
    console.log(
      `  Using existing collection: ${collection.name} (${collection.id})`
    );
  }

  const collectionId = collection.id;

  // Limpiar categorías existentes de esta colección
  const existingCategories = await prisma.layerCategory.count({
    where: { collectionId }
  });

  if (existingCategories > 0) {
    console.log(
      `  Deleting ${existingCategories} existing categories for this collection...`
    );
    await prisma.layerCategory.deleteMany({ where: { collectionId } });
  }

  // Crear categorías y traits
  let totalTraits = 0;

  for (const categoryData of LAYER_DATA) {
    const category = await prisma.layerCategory.create({
      data: {
        collectionId,
        name: categoryData.name,
        order: categoryData.order,
        isRequired: categoryData.isRequired
      }
    });

    console.log(
      `  Category: ${category.name} (order: ${category.order}, ${categoryData.traits.length} traits)`
    );

    for (const traitData of categoryData.traits) {
      await prisma.layerTrait.create({
        data: {
          categoryId: category.id,
          name: traitData.name,
          imageUrl: `placeholder://${categoryData.name.toLowerCase()}/${traitData.name.toLowerCase().replace(/\s+/g, "-")}`,
          weight: traitData.weight
        }
      });
      totalTraits++;
    }
  }

  // Calcular combinaciones
  const combinations = LAYER_DATA.reduce(
    (acc, cat) => acc * cat.traits.length,
    1
  );

  console.log("\n--- Seed Summary ---");
  console.log(`  Collection: ${collection.name}`);
  console.log(`  Categories: ${LAYER_DATA.length}`);
  console.log(`  Total traits: ${totalTraits}`);
  console.log(
    `  Possible unique combinations: ${combinations.toLocaleString()}`
  );
  console.log(
    `\n  Suit weights: Normal=${SUIT_WEIGHTS.Normal}% | Rare=${SUIT_WEIGHTS.Rare}% | Epic=${SUIT_WEIGHTS.Epic}%`
  );
  console.log("\n  NOTE: Traits have placeholder imageUrls.");
  console.log("  Upload real PNGs via Admin > NFT Layers panel.\n");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e: any) => {
    console.error("Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
