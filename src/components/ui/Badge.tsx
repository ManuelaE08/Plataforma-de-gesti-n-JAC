type BadgeVariant = "green" | "red" | "amber" | "gray" | "blue";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-600",
  amber: "bg-amber-100 text-amber-600",
  gray: "bg-gray-200 text-gray-600",
  blue: "bg-blue-100 text-blue-700",
};

function Badge({ label, variant = "gray" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]}`}>
      {label}
    </span>
  );
}

export default Badge;