import { Input } from './Input';
import { Field } from './Field';
import { Form } from './Container';
import { zodResolver } from '@hookform/resolvers/zod';
import { TFunction } from 'i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { LanguageEnum } from '../models/openapi';
import { zodOptionalString } from '../types/zod';
import { DetailEditingDrawer } from './Drawer';
import { Button } from '@fluentui/react-components';
import { ArrowCircleLeftRegular, TranslateAutoRegular } from '@fluentui/react-icons';

// button to toggle multi lang drawer
type MultiLangButtonProps = { isOpen: boolean; onClick: () => void };
export const MultiLangButton: React.FC<MultiLangButtonProps> = (props: MultiLangButtonProps) => {
  return (
    <Button
      {...props}
      appearance="transparent"
      icon={props.isOpen ? <ArrowCircleLeftRegular /> : <TranslateAutoRegular />}
      onClick={props.onClick}
      size="medium"
    />
  );
};

const nameMultiLangSchema = z.object(
  Object.values(LanguageEnum).reduce(
    (acc, lang) => {
      acc[lang] = zodOptionalString();
      return acc;
    },
    {} as Record<string, z.ZodOptional<z.ZodString>>,
  ),
);
type NameMultiLangFormData = z.infer<typeof nameMultiLangSchema>;

type NameMultiLangDrawerProps = {
  initialData: Record<string, string | undefined>;
  isOpen: boolean;
  isReadOnly: boolean;
  onDrawerClose: () => void;
  onValueChange: (langStr: string, value: string) => void;
  title: string;
  t: TFunction;
};

export const MultiLangDrawer = ({
  initialData,
  isOpen,
  isReadOnly,
  onDrawerClose,
  onValueChange,
  title,
  t,
}: NameMultiLangDrawerProps) => {
  useForm<NameMultiLangFormData>({
    defaultValues: initialData,
    resolver: zodResolver(nameMultiLangSchema),
  });

  return (
    <DetailEditingDrawer isOpen={isOpen} onCloseDrawer={onDrawerClose} title={title}>
      <Form numColumn={1}>
        {Object.values([LanguageEnum.English, LanguageEnum.TraditionalChinese]).map((lang) => (
          <Field
            key={lang}
            label={t(`system.language.value.${lang}`)}
            required={lang === LanguageEnum.English}
          >
            <Input
              name={lang}
              onChange={(e, v) => onValueChange(e.target.name, v.value)}
              readOnly={isReadOnly}
              value={initialData[lang]}
            />
          </Field>
        ))}
      </Form>
    </DetailEditingDrawer>
  );
};
