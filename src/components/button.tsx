import { Body2, Button, tokens } from '@fluentui/react-components';
import { ChevronLeftRegular } from '@fluentui/react-icons';
import { useNavigationHelpers } from '../hooks/use-delay-navigate';

type BackButtonProps = {
  onClick: () => void;
};
export const BackButton = ({ onClick }: BackButtonProps) => {
  const { navigate } = useNavigationHelpers();
  return (
    <Button
      appearance="transparent"
      icon={<ChevronLeftRegular color={tokens.colorBrandForeground1} fontSize={20} />}
      onClick={() => {
        onClick();
        navigate(-1, { replace: true });
      }}
      style={{
        height: 32,
        color: tokens.colorBrandForeground1,
        padding: '0', // remove all internal padding
        minWidth: 'auto', // optional: stops the button from enforcing a minimum width
      }}
    >
      <Body2>Back</Body2>
    </Button>
  );
};
