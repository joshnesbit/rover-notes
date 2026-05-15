export function timeAgo(date: string | null): string {
  if (!date) return "never";
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffWeeks === 1) return "a week ago";
  if (diffWeeks < 5) return `${diffWeeks} weeks ago`;
  if (diffMonths === 1) return "a month ago";
  return `${diffMonths} months ago`;
}

export function formatDate(date: string | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export const GIFT_LABELS: Record<string, string> = {
  head: "Head",
  heart: "Heart",
  hand: "Hand",
  teachable: "Teachable",
  dream: "Dream",
};

export const GIFT_DESCRIPTIONS: Record<string, string> = {
  head: "knowledge they carry",
  heart: "passions & loves",
  hand: "practical skills",
  teachable: "willing to teach",
  dream: "aspirations & wishes",
};
