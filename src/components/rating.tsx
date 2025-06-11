import * as React from 'react';
import {
  Rating as FluentRating,
  RatingDisplay,
  RatingProps as FluentRatingProps,
} from '@fluentui/react-components';

type CustomRatingProps = {
  readOnly?: boolean;
} & FluentRatingProps;

export const Rating = React.forwardRef<HTMLDivElement, CustomRatingProps>(
  ({ onChange, readOnly = false, ...rest }, ref) => {
    return readOnly ? (
      <RatingDisplay ref={ref} {...rest} />
    ) : (
      <FluentRating ref={ref} onChange={onChange} {...rest} />
    );
  },
);

Rating.displayName = 'Rating';
