import * as React from 'react';
import { Caption2, Body1, Text, TextProps, Label } from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import { getFieldValueInPreferredLanguage } from '../utils/language-util';

type MultiLangTextProps = TextProps & {
  object?: any;
  children?: React.ReactNode;
};

type ComponentType = React.ComponentType<any>;

const MultiLangTypography: React.FC<MultiLangTextProps & { Component: ComponentType }> = ({
  object,
  children,
  Component,
  ...rest
}) => {
  const { i18n } = useTranslation();

  if (object === undefined) {
    return <Component {...rest}></Component>;
  }

  if ('name' in object && isRecord(object.name)) {
    return (
      <Component {...rest}>
        {getFieldValueInPreferredLanguage(i18n.language, 'name', object)}
      </Component>
    );
  } else if ('description' in object && isRecord(object.description)) {
    return (
      <Component {...rest}>
        {getFieldValueInPreferredLanguage(i18n.language, 'description', object)}
      </Component>
    );
  } else {
    return <Component {...rest}>{children}</Component>;
  }
};

// Exported specializations
export const MultiLangCaption2: React.FC<MultiLangTextProps> = (props) => (
  <MultiLangTypography {...props} Component={Caption2} />
);

export const MultiLangBody1: React.FC<MultiLangTextProps> = (props) => (
  <MultiLangTypography {...props} Component={Body1} />
);

export const MultiLangText: React.FC<MultiLangTextProps> = (props) => (
  <MultiLangTypography {...props} Component={Text} />
);

export const MultiLangLabel: React.FC<MultiLangTextProps> = (props) => (
  <MultiLangTypography {...props} Component={Label} />
);

const isRecord = (value: unknown): value is Record<string, any> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};
