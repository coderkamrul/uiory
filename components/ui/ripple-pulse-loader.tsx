import { cn } from "@/lib/utils";

export const Component = ({
  className,
  color = "#ffffff",
}: {
  className?: string;
  /** Accent color for the logo SVG fill animation. Defaults to white. */
  color?: string;
}) => {
  return (
    <div
      className={cn("loader", className)}
      style={{ "--logo-color": color } as React.CSSProperties}
    >
      <div className="box">
        <div className="logo">
          <img src="/logo-u.png" alt="uiory" className="logo-img" />
        </div>
      </div>
      <div className="box" />
      <div className="box" />
      <div className="box" />
      <div className="box" />
    </div>
  );
};
