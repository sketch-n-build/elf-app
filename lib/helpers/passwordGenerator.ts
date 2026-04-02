export function generateStrongPassword(length = 10) {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const specials = "!@#$%^&*()_+[]{}<>?";

  const all = upper + lower + numbers + specials;

  const getRandom = (str: string) =>
    str[Math.floor(Math.random() * str.length)];

  // Ensure at least one of each
  let password =
    getRandom(upper) +
    getRandom(lower) +
    getRandom(numbers) +
    getRandom(specials);

  // Fill the rest
  for (let i = password.length; i < length; i++) {
    password += getRandom(all);
  }

  // Shuffle
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}