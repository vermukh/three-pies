import type { CSSProperties, ComponentProps } from "react";
import type { Product } from "./data";
import { Dialog } from "@three-pies/ui-kit";
export { Icon, QuantityControl as Quantity } from "@three-pies/ui-kit";
export function Logo({
  light = false,
  caption,
}: {
  light?: boolean;
  caption?: string;
}) {
  return (
    <a
      className={`logo ${light ? "logo-light" : ""}`}
      href="#home"
      aria-label={`Три пирога — на главную${caption ? `, ${caption}` : ""}`}
    >
      <img
        className="logo-image"
        src={`/images/brand/logo${light ? "-light" : ""}.svg`}
        width="284"
        height="288"
        alt="Пекарня Три пирога — настоящие осетинские пироги"
      />
      {caption && (
        <span className="logo-caption" aria-hidden="true">
          <strong>Три пирога</strong>
          <small>{caption}</small>
        </span>
      )}
    </a>
  );
}

export function ProductImage({
  product,
  className = "",
}: {
  product: Product;
  className?: string;
}) {
  // The illustration has unequal row spacing. Crop each subject within its
  // own tile so neighbouring products never appear at the edges.
  const isPie = product.image < 6;
  const x = isPie
    ? [2.2, 50, 97.8][product.image % 3]
    : (product.image % 3) * 50;
  const y = isPie
    ? product.image < 3
      ? 0
      : 43.5
    : product.image === 6
      ? 100
      : 94;
  return (
    <div
      role="img"
      aria-label={product.name}
      className={`product-image ${className}`}
      style={
        {
          "--image-x": `${x}%`,
          "--image-y": `${y}%`,
          "--image-scale": isPie ? "330%" : "300%",
        } as CSSProperties
      }
    />
  );
}

export function Modal({
  drawer = false,
  wide = false,
  className = "",
  ...props
}: ComponentProps<typeof Dialog>) {
  return (
    <Dialog
      {...props}
      drawer={drawer}
      wide={wide}
      className={`modal ${drawer ? "drawer" : ""} ${wide ? "modal-wide" : ""} ${className}`}
    />
  );
}
