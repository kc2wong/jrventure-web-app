export const getRawValueByEnumValue = <T extends Record<string, string>>(
  enumObj: T,
  value: string,
): keyof T | undefined => {
  return (Object.keys(enumObj) as Array<keyof T>).find((key) => enumObj[key] === value);
};

export const getEnumValueByRawValue = <T extends Record<string, string>>(
  enumObj: T,
  value: string,
): T[keyof T] | undefined => {
  const enumValues = Object.values(enumObj);
  return enumValues.find((val): val is T[keyof T] => val === value);
};
