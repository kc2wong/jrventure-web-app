import { makeStyles, tokens } from '@fluentui/react-components';

const useCommonStyles = makeStyles({
  // Icon + label row used inside dropdown option render functions
  optionContent: {
    alignItems: 'center',
    display: 'flex',
    gap: tokens.spacingHorizontalS,
  },
  // Standard large icon size — apply via className to avoid repeating fontSize prop
  largeIcon: {
    fontSize: '20px',
  },
  // Action buttons cell in data tables
  actionCell: {
    alignItems: 'center',
    display: 'flex',
    gap: tokens.spacingHorizontalS,
  },
  // Centered content cell in data tables
  centeredCell: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
});

export { useCommonStyles };
