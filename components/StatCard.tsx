import { View, Text, Image, ImageSourcePropType } from 'react-native';

interface StatCardProps {
  icon: ImageSourcePropType;
  title: string;
  value: string | number;
  subtitle?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger';
}

const getColorStyles = (color?: StatCardProps['color']) => {
  switch (color) {
    case 'success':
      return {
        iconColor: '#38A169',
        valueColor: 'text-green-600',
        borderColor: 'border-green-100',
      };
    case 'warning':
      return {
        iconColor: '#EAB308',
        valueColor: 'text-yellow-600',
        borderColor: 'border-yellow-100',
      };
    case 'danger':
      return {
        iconColor: '#F56565',
        valueColor: 'text-red-600',
        borderColor: 'border-red-100',
      };
    case 'primary':
    default:
      return {
        iconColor: '#4C7C68',
        valueColor: 'text-primary-500',
        borderColor: 'border-primary-100',
      };
  }
};

const StatCard = ({
  icon,
  title,
  value,
  subtitle,
  color = 'primary',
}: StatCardProps) => {
  const styles = getColorStyles(color);

  return (
    <View
      className={`flex-1 bg-white rounded-2xl p-4 border ${styles.borderColor}`}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}>
      <Image
        source={icon}
        className="h-5 w-5 mb-2"
        tintColor={styles.iconColor}
        resizeMode="contain"
      />
      <Text className="font-JakartaMedium text-xs text-gray-500">{title}</Text>
      <Text className={`font-JakartaBold text-2xl mt-1 ${styles.valueColor}`}>
        {value}
      </Text>
      {subtitle && (
        <Text className="font-JakartaMedium text-xs text-gray-400 mt-1">
          {subtitle}
        </Text>
      )}
    </View>
  );
};

export default StatCard;
