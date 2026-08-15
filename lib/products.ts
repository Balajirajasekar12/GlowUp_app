export type Budget = "high" | "medium" | "low";

export type Product = {
  id: string;
  name: string;
  category: "skin" | "hair" | "outfit";
  budget: Budget;
  description: string;
  reason: string;
  affiliateUrl: string;
  price: string;
  tags: string[];
  // Only set for category "outfit" — a flat/front-facing garment photo used
  // as the reference image for the virtual try-on preview. Add your own
  // product photography here; a search-results page won't work for this.
  garmentImageUrl?: string;
};

export const BUDGET_LABELS: Record<Budget, { label: string; blurb: string }> = {
  high: { label: "Splurge", blurb: "Premium pick" },
  medium: { label: "Balanced", blurb: "Good value" },
  low: { label: "Smart Save", blurb: "Budget-friendly" },
};

// Starter seed set, one product per category per budget tier.
//
// Where I could verify a specific, real, high-review-count product
// (checked via search, not guessed), the link goes straight to that exact
// product page. Everywhere else, the link goes to an Amazon search
// pre-sorted by customer rating (`s=review-rank`) so the first results are
// the best-reviewed options, instead of an unsorted list. Swap any of
// these for your own picked products/ASINs, ideally via your own Amazon
// Associates affiliate links, once you've chosen exact items.
function amazonSearchByRating(query: string) {
  return `https://www.amazon.com/s?k=${encodeURIComponent(query)}&s=review-rank`;
}

export const SEED_PRODUCTS: Product[] = [
  // --- Skin ---
  {
    id: "skin-high",
    name: "Eucerin Advanced Repair Cream",
    category: "skin",
    budget: "high",
    description: "Dermatologist-recommended cream with ceramides for very dry skin.",
    reason: "Matches detected dryness around the cheek area.",
    // Verified real product link.
    affiliateUrl:
      "https://www.amazon.com/Eucerin-Advanced-Repair-Cr%C3%A8me-Ounce/dp/B01N0O7EHN",
    price: "$14",
    tags: ["dry-prone"],
  },
  {
    id: "skin-medium",
    name: "CeraVe Daily Moisturizing Lotion",
    category: "skin",
    budget: "medium",
    description: "Widely-used fragrance-free daily moisturizer for dry-prone skin.",
    reason: "Matches detected dryness around the cheek area.",
    // Verified real product link.
    affiliateUrl:
      "https://www.amazon.com/CeraVe-Moisturizing-Lotion-Hyaluronic-Fragrance/dp/B07RK4HST7",
    price: "$19.99",
    tags: ["dry-prone"],
  },
  {
    id: "skin-low",
    name: "Vaseline Intensive Care Advanced Repair Lotion",
    category: "skin",
    budget: "low",
    description: "Budget-friendly daily lotion for dry-prone skin.",
    reason: "Matches detected dryness around the cheek area.",
    // Verified real product link.
    affiliateUrl:
      "https://www.amazon.com/Vaseline-Intensive-Lotion-Advanced-Unscented/dp/B001ECQ4IU",
    price: "$8.49",
    tags: ["dry-prone"],
  },

  // --- Hair ---
  {
    id: "hair-high",
    name: "Moroccanoil Intense Smoothing Frizz Control Serum",
    category: "hair",
    budget: "high",
    description: "Salon-grade smoothing serum for wavy, frizz-prone hair.",
    reason: "Matches detected frizz and wave pattern.",
    // Verified real product link.
    affiliateUrl:
      "https://www.amazon.com/Moroccanoil-Intense-Smoothing-Frizz-Control/dp/B0CCK1XL7Q",
    price: "$42",
    tags: ["frizz-prone", "wavy"],
  },
  {
    id: "hair-medium",
    name: "OGX Curl-Defining Anti-Frizz Cream",
    category: "hair",
    budget: "medium",
    description: "Lightweight cream for wavy, frizz-prone hair.",
    reason: "Matches detected frizz and wave pattern.",
    // Verified real product link.
    affiliateUrl:
      "https://www.amazon.com/OGX-Perfection-Curl-Defining-Hair-Smoothing-Frizz-Defying/dp/B095JZDR1T",
    price: "$14.99",
    tags: ["frizz-prone", "wavy"],
  },
  {
    id: "hair-low",
    name: "Budget Anti-Frizz Serum",
    category: "hair",
    budget: "low",
    description: "Affordable serum to tame frizz on wavy hair.",
    reason: "Matches detected frizz and wave pattern.",
    // Not independently verified — rating-sorted search, not a single
    // confirmed product. Swap for a specific item when you pick one.
    affiliateUrl: amazonSearchByRating("budget anti frizz hair serum"),
    price: "$6.99",
    tags: ["frizz-prone", "wavy"],
  },

  // --- Outfit ---
  {
    id: "outfit-high",
    name: "Tailored Blazer — Oval Face Palette",
    category: "outfit",
    budget: "high",
    description: "Structured blazer in tones that suit an oval face shape.",
    reason: "Matches detected oval face shape.",
    // Not independently verified — rating-sorted search. Fashion items
    // vary too much by size/color to pin to one ASIN without you
    // choosing the exact item.
    affiliateUrl: amazonSearchByRating("tailored blazer"),
    price: "$180",
    tags: ["oval"],
    garmentImageUrl: "",
  },
  {
    id: "outfit-medium",
    name: "Ray-Ban Original Wayfarer Sunglasses",
    category: "outfit",
    budget: "medium",
    description: "Iconic frame shape that complements oval faces.",
    reason: "Matches detected oval face shape.",
    // Verified real product link.
    affiliateUrl:
      "https://www.amazon.com/Ray-Ban-Original-Wayfarer-Polarized-Sunglasses/dp/B07BV3P75Q",
    price: "$163",
    tags: ["oval"],
    garmentImageUrl: "",
  },
  {
    id: "outfit-low",
    name: "Everyday Crewneck — Neutral Tones",
    category: "outfit",
    budget: "low",
    description: "Simple, versatile crewneck in flattering neutral tones.",
    reason: "Matches detected oval face shape.",
    // Not independently verified — rating-sorted search, same reasoning
    // as the blazer above.
    affiliateUrl: amazonSearchByRating("neutral crewneck sweater"),
    price: "$16",
    tags: ["oval"],
    garmentImageUrl: "",
  },
];

export function recommendProducts(tags: string[]): Product[] {
  return SEED_PRODUCTS.filter((p) => p.tags.some((t) => tags.includes(t)));
}

export function groupByBudget(products: Product[]): Record<Budget, Product[]> {
  return {
    high: products.filter((p) => p.budget === "high"),
    medium: products.filter((p) => p.budget === "medium"),
    low: products.filter((p) => p.budget === "low"),
  };
}
