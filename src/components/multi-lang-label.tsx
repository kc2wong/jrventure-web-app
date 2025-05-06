import { ReactElement, cloneElement } from 'react';
import { usePreferredLanguageLabel } from '../hooks/use-preferred-language';

type MultiLingualLabelProps = { caption: Record<string, string>; children: ReactElement };

export const MultiLingualLabel = ({ caption, children }: MultiLingualLabelProps) => {
  const text = usePreferredLanguageLabel(caption);
  return cloneElement(children, {}, text);
};
