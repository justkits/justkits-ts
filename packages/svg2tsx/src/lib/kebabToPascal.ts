export function kebabToPascal(str: string, suffix: string): string {
  if (!/^[a-z]+(-[a-z]+)*$/.test(str)) {
    throw new Error(
      `Invalid filename: "${str}". Filenames must be strictly kebab-case (lowercase letters and single dashes only, e.g., "my-icon").`,
    );
  }

  const pascalName = str
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  return pascalName + suffix;
}
