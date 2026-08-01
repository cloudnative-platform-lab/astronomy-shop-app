export const runtimeAddress = (name: string): string => {
  const address = process.env[name];

  if (!address) {
    throw new Error(`${name} environment variable is required`);
  }

  return address;
};
