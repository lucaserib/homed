import { Text, TouchableOpacity } from 'react-native';
import { ButtonProps } from 'types/type';

const getTextVariantStyle = (variant: ButtonProps['textVariant']) => {
  switch (variant) {
    case 'primary':
      return 'text-black';
    case 'secondary':
      return 'text-gray-100';
    case 'danger':
      return 'text-red-100';
    case 'success':
      return 'text-green-100';
    default:
      return 'text-white';
  }
};

const getBgVariantStyle = (variant: ButtonProps['bgVariant']) => {
  switch (variant) {
    case 'secondary':
      return 'bg-gray-500';
    case 'danger':
      return 'bg-red-500';
    case 'success':
      return 'bg-green-500';
    case 'outline':
      return 'bg-transparent border-neutral-300 border';
    case 'light':
      return 'bg-white border-neutral-200 border';
    case 'primary':
      return 'bg-primary-500';
    default:
      return 'bg-primary-500';
  }
};

const CustomButton = ({
  onPress,
  title,
  bgVariant = 'primary',
  textVariant = 'default',
  IconLeft,
  IconRight,
  className,
  disabled = false,
  ...props
}: ButtonProps) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.8}
    className={`flex w-full flex-row items-center justify-center rounded-2xl py-4 px-6 ${getBgVariantStyle(bgVariant)} ${disabled ? 'opacity-50' : ''} ${className}`}
    style={{
      shadowColor: bgVariant === 'primary' ? '#4C7C68' : '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4,
    }}
    {...props}>
    {IconLeft && <IconLeft />}
    <Text className={`font-JakartaBold text-base ${getTextVariantStyle(textVariant)}`}>
      {title}
    </Text>
    {IconRight && <IconRight />}
  </TouchableOpacity>
);
export default CustomButton;
