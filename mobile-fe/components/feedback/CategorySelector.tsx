import { FEEDBACK_CATEGORIES, IssueType } from '@/types/feedback';
import {
  Building,
  Flame,
  MoreHorizontal,
  Shield,
  Volume2,
  Wrench,
} from 'lucide-react-native';
import { Text, TouchableOpacity, View } from 'react-native';

interface CategorySelectorProps {
  selectedType: IssueType | null;
  onSelect: (type: IssueType) => void;
}

const ICON_MAP: Record<string, any> = {
  Wrench,
  Building,
  Volume2,
  Shield,
  Flame,
  MoreHorizontal,
};

export default function CategorySelector({
  selectedType,
  onSelect,
}: CategorySelectorProps) {
  return (
    <View className="flex-row flex-wrap gap-3">
      {FEEDBACK_CATEGORIES.map((category) => {
        const isSelected = selectedType === category.type;
        const Icon = ICON_MAP[category.icon];

        return (
          <TouchableOpacity
            key={category.type}
            onPress={() => onSelect(category.type)}
            className={`items-center justify-center rounded-lg p-4 ${
              isSelected ? 'bg-white border-2' : 'bg-white border'
            }`}
            style={{
              width: '30%',
              borderColor: isSelected ? category.color : '#E5E7EB',
            }}
          >
            <View
              className="w-12 h-12 rounded-full items-center justify-center mb-2"
              style={{ backgroundColor: category.color + '20' }}
            >
              <Icon size={24} color={category.color} />
            </View>
            <Text
              className={`text-xs text-center ${
                isSelected ? 'font-semibold' : ''
              }`}
              style={{ color: isSelected ? category.color : '#374151' }}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
