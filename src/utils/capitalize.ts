export const capitalize = (name: string) =>
  name
    .split(" ")
    .map((el) => el.slice(0, 1).toUpperCase() + el.slice(1).toLowerCase())
    .join(" ");
