export const model2Entity = (src: Date | null | undefined): string | undefined => {
  return src ? src.toISOString() : undefined;
};

export const entity2Model = (src: string | undefined): Date | undefined => {
  if (src) {
    const rtn = new Date(src);
    return isNaN(rtn.getTime()) ? undefined : rtn;
  } else {
    return undefined;
  }
};
