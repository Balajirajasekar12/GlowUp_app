import { Product, BUDGET_LABELS } from "@/lib/products";

const TIER_STYLES: Record<Product["budget"], string> = {
  high: "border-l-brass",
  medium: "border-l-rose",
  low: "border-l-sage",
};

export default function ProductCard({
  product,
  onTryOn,
}: {
  product: Product;
  onTryOn?: (product: Product) => void;
}) {
  const tier = BUDGET_LABELS[product.budget];

  return (
    <div
      className={`rounded-lg border border-l-4 bg-white p-4 shadow-sm ${TIER_STYLES[product.budget]}`}
    >
      <div className="flex items-center justify-between">
        <p className="font-mono text-[11px] uppercase tracking-wide text-gray-400">
          {product.category}
        </p>
        <p className="font-mono text-[11px] uppercase tracking-wide text-gray-500">
          {tier.label}
        </p>
      </div>
      <h3 className="mt-1 font-display text-lg font-medium">{product.name}</h3>
      <p className="mt-1 text-sm text-gray-600">{product.description}</p>
      <p className="mt-2 text-xs italic text-gray-500">{product.reason}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="font-mono text-sm font-medium">{product.price}</span>
        <div className="flex gap-2">
          {product.category === "outfit" && onTryOn && (
            <button
              onClick={() => onTryOn(product)}
              className="rounded-full border border-ink px-3 py-1.5 text-xs font-medium text-ink hover:bg-ink hover:text-porcelain"
            >
              Try it on
            </button>
          )}
          <a
            href={product.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="rounded-full bg-brass px-3 py-1.5 text-xs font-medium text-ink hover:bg-brass-light"
          >
            View product
          </a>
        </div>
      </div>
      <p className="mt-2 text-[11px] text-gray-400">
        We may earn a commission from links on this page.
      </p>
    </div>
  );
}
