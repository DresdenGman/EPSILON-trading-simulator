export const GUEST_MODE = process.env.NEXT_PUBLIC_GUEST_MODE === "true"
  || (process.env.NEXT_PUBLIC_GUEST_MODE !== "false" && process.env.NODE_ENV !== "test");
