import sharp from "sharp";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { uploadBuffer, downloadBuffer } from "@/lib/s3";

const NFT_NAME_PREFIX = ["Neo", "Meta", "Pixel", "Crypto", "Void", "Flux", "Nova", "Zen", "Hyper", "Neon"];
const NFT_NAME_SUFFIX = ["Fox", "Ape", "Cat", "Orb", "Ghost", "Wolf", "Punk", "Bot", "Skull", "Gem"];

function generateNftName(): string {
  const p = NFT_NAME_PREFIX[Math.floor(Math.random() * NFT_NAME_PREFIX.length)];
  const s = NFT_NAME_SUFFIX[Math.floor(Math.random() * NFT_NAME_SUFFIX.length)];
  return `${p}${s}`;
}

type CategoryWithTraits = {
  id: string;
  name: string;
  order: number;
  isRequired: boolean;
  traits: {
    id: string;
    name: string;
    imageUrl: string;
    weight: number;
  }[];
};

type SelectedTrait = {
  categoryId: string;
  categoryName: string;
  traitId: string;
  traitName: string;
  imageUrl: string;
  weight: number;
};

type BatchResult = {
  total: number;
  generated: number;
  byRarity: Record<string, number>;
  errors: string[];
};

/**
 * Selects one trait per category using weighted random selection.
 * Higher weight = more common.
 */
export function selectTraitsByWeight(
  categories: CategoryWithTraits[]
): SelectedTrait[] {
  const selected: SelectedTrait[] = [];

  for (const category of categories) {
    if (category.traits.length === 0) {
      if (category.isRequired) {
        throw new Error(
          `Category "${category.name}" is required but has no traits`
        );
      }
      continue;
    }

    const totalWeight = category.traits.reduce((sum, t) => sum + t.weight, 0);
    let random = Math.random() * totalWeight;

    for (const trait of category.traits) {
      random -= trait.weight;
      if (random <= 0) {
        selected.push({
          categoryId: category.id,
          categoryName: category.name,
          traitId: trait.id,
          traitName: trait.name,
          imageUrl: trait.imageUrl,
          weight: trait.weight
        });
        break;
      }
    }
  }

  return selected;
}

/**
 * Downloads trait images and composites them in order using sharp.
 * Returns a PNG buffer.
 */
export async function compositeImage(
  traits: SelectedTrait[]
): Promise<Buffer> {
  if (traits.length === 0) {
    throw new Error("No traits to composite");
  }

  // Download all images in parallel via public URL
  const imageBuffers = await Promise.all(
    traits.map(async (trait) => {
      console.log(`[art-gen] Downloading: "${trait.traitName}" → ${trait.imageUrl}`);

      // Try S3 client first, fallback to fetch
      try {
        const buf = await downloadBuffer(trait.imageUrl);
        console.log(`[art-gen] S3 OK "${trait.traitName}": ${buf.length} bytes`);
        return buf;
      } catch (s3Err) {
        console.log(`[art-gen] S3 failed, trying HTTP fetch for "${trait.traitName}"`);
      }

      // Fallback: HTTP fetch
      const response = await fetch(trait.imageUrl);
      if (!response.ok) {
        throw new Error(
          `Failed to download "${trait.traitName}": HTTP ${response.status}`
        );
      }
      const buf = Buffer.from(await response.arrayBuffer());
      console.log(`[art-gen] HTTP OK "${trait.traitName}": ${buf.length} bytes`);
      return buf;
    })
  );

  // Use first image as base, composite the rest on top
  const base = sharp(imageBuffers[0]);
  const metadata = await base.metadata();

  if (imageBuffers.length === 1) {
    return base.png().toBuffer();
  }

  const composites = imageBuffers.slice(1).map((buf) => ({
    input: buf,
    top: 0,
    left: 0
  }));

  return sharp(imageBuffers[0])
    .resize(metadata.width, metadata.height)
    .composite(composites)
    .png()
    .toBuffer();
}

/**
 * Derives rarity from the combined probability of selected traits.
 * Product of (trait.weight / totalCategoryWeight) for each category.
 *
 * >= 10% → NORMAL, >= 1% → RARE, >= 0.1% → EPIC, < 0.1% → UNIQUE
 */
export function deriveRarity(
  traits: SelectedTrait[],
  categories: CategoryWithTraits[]
): "NORMAL" | "RARE" | "EPIC" | "UNIQUE" {
  let combinedProbability = 1;

  for (const trait of traits) {
    const category = categories.find((c) => c.id === trait.categoryId);
    if (!category) continue;

    const totalWeight = category.traits.reduce((sum, t) => sum + t.weight, 0);
    if (totalWeight === 0) continue;

    combinedProbability *= trait.weight / totalWeight;
  }

  if (combinedProbability >= 0.1) return "NORMAL";
  if (combinedProbability >= 0.01) return "RARE";
  if (combinedProbability >= 0.001) return "EPIC";
  return "UNIQUE";
}

/**
 * Generates a SHA-256 hash from sorted trait IDs for uniqueness checking.
 */
export function generateCombinationHash(traitIds: string[]): string {
  const sorted = [...traitIds].sort();
  return crypto.createHash("sha256").update(sorted.join(",")).digest("hex");
}

/**
 * Generates a batch of unique NFT images by compositing layers.
 * Creates NFTAsset records in the database.
 */
export async function generateBatch(
  collectionId: string,
  count: number,
  onProgress?: (current: number, total: number) => void
): Promise<BatchResult> {
  // Load categories with traits, ordered by composition order
  const categories = await prisma.layerCategory.findMany({
    where: { collectionId },
    orderBy: { order: "asc" },
    include: {
      traits: true
    }
  });

  if (categories.length === 0) {
    throw new Error("No layer categories found for this collection");
  }

  const requiredWithoutTraits = categories.filter(
    (c: { isRequired: boolean; traits: unknown[] }) =>
      c.isRequired && c.traits.length === 0
  );
  if (requiredWithoutTraits.length > 0) {
    throw new Error(
      `Required categories without traits: ${requiredWithoutTraits.map((c: { name: string }) => c.name).join(", ")}`
    );
  }

  // Check for traits with placeholder images (not yet uploaded)
  const traitsWithoutImages = categories.flatMap((c) =>
    c.traits
      .filter((t: { imageUrl: string }) => !t.imageUrl.startsWith("http"))
      .map((t: { name: string }) => `${c.name}/${t.name}`)
  );
  if (traitsWithoutImages.length > 0) {
    throw new Error(
      `The following traits don't have images uploaded yet: ${traitsWithoutImages.join(", ")}`
    );
  }

  // Calculate max possible unique combinations
  const maxCombinations = categories.reduce(
    (product: number, cat: { traits: unknown[] }) => {
      const traitCount = cat.traits.length || 1;
      return product * traitCount;
    },
    1
  );

  if (count > maxCombinations) {
    throw new Error(
      `Requested ${count} images but only ${maxCombinations} unique combinations are possible`
    );
  }

  const result: BatchResult = {
    total: count,
    generated: 0,
    byRarity: { NORMAL: 0, RARE: 0, EPIC: 0, UNIQUE: 0 },
    errors: []
  };

  const usedHashes = new Set<string>();
  const maxRetries = 10;

  for (let i = 0; i < count; i++) {
    try {
      let traits: SelectedTrait[] | null = null;
      let hash = "";

      // Try to find a unique combination
      for (let retry = 0; retry < maxRetries; retry++) {
        const candidate = selectTraitsByWeight(categories);
        const candidateHash = generateCombinationHash(
          candidate.map((t) => t.traitId)
        );

        if (!usedHashes.has(candidateHash)) {
          traits = candidate;
          hash = candidateHash;
          break;
        }
      }

      if (!traits) {
        result.errors.push(
          `Image ${i + 1}: Could not find unique combination after ${maxRetries} retries`
        );
        continue;
      }

      usedHashes.add(hash);

      // Composite the image
      const imageBuffer = await compositeImage(traits);

      // Upload to DO Spaces
      const uploaded = await uploadBuffer(
        imageBuffer,
        `generated-nfts/${collectionId}`
      );

      // Derive rarity
      const rarity = deriveRarity(traits, categories);

      // Build name
      const name = `#${i + 1} ${generateNftName()}`;

      // Create NFTAsset record
      await prisma.nFTAsset.create({
        data: {
          name,
          imageUrl: uploaded.url,
          rarity,
          isUsed: false,
          collectionId
        }
      });

      result.generated++;
      result.byRarity[rarity]++;

      onProgress?.(i + 1, count);
    } catch (error) {
      console.error(`[art-gen] Error generating image ${i + 1}:`, error);
      const message =
        error instanceof Error ? error.message : String(error);
      result.errors.push(`Image ${i + 1}: ${message}`);
    }
  }

  return result;
}
