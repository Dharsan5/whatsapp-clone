import "./DefaultAvatar.css";

// WhatsApp-inspired color palette — rich, vibrant, and distinguishable
const AVATAR_COLORS = [
  "#00a884", // teal green
  "#53bdeb", // sky blue
  "#e6772e", // warm orange
  "#7f66ff", // purple
  "#ff6b81", // coral pink
  "#02b5a0", // sea green
  "#f0a04b", // golden amber
  "#e44d75", // rose
  "#6ec6ff", // light blue
  "#c084fc", // lavender
  "#ff8c42", // tangerine
  "#22d3ee", // cyan
  "#a3e635", // lime
  "#f472b6", // pink
  "#34d399", // mint
  "#fbbf24", // yellow
];

/**
 * Generate a consistent color index from a string (username).
 * Same username always produces the same color.
 */
const getColorFromName = (name) => {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32-bit int
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

/**
 * Get initials from a name (up to 2 characters).
 * "John Doe" → "JD", "alice" → "A"
 */
const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
};

/**
 * DefaultAvatar — Generates a colored avatar with user initials.
 *
 * Props:
 *  - name: string (username or display name)
 *  - size: number (pixel size, default 40)
 *  - className: string (optional extra CSS class)
 *  - style: object (optional extra inline styles)
 */
const DefaultAvatar = ({ name, size = 40, className = "", style = {} }) => {
  const bgColor = getColorFromName(name);
  const initials = getInitials(name);
  const fontSize = Math.max(size * 0.4, 12);

  return (
    <div
      className={`default-avatar ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        backgroundColor: bgColor,
        fontSize: `${fontSize}px`,
        ...style,
      }}
      title={name}
    >
      {initials}
    </div>
  );
};

export default DefaultAvatar;
