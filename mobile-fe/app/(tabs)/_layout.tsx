import { Tabs } from 'expo-router';
import {
  CircleUserRound,
  ConciergeBell,
  CreditCard,
  Home,
  LucideIcon,
  Vote,
} from 'lucide-react-native';
import { View } from 'react-native';

const TAB_ITEMS = [
  { name: 'home', icon: Home },
  { name: 'service', icon: ConciergeBell },
  { name: 'voting', icon: Vote },
  { name: 'payment', icon: CreditCard },
  { name: 'information', icon: CircleUserRound },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#244B35',
          height: 100,
          borderTopWidth: 0,
          elevation: 0,
          paddingTop: 20,
          paddingHorizontal: 10,
        },
      }}
    >
      {TAB_ITEMS.map((item) => (
        <Tabs.Screen
          key={item.name}
          name={item.name}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={item.icon} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

function TabIcon({
  icon: Icon,
  focused,
}: {
  icon: LucideIcon;
  focused: boolean;
}) {
  return (
    <View
      className="items-center justify-center p-4 rounded-lg"
      style={{
        backgroundColor: focused ? "rgba(200, 242, 209, 0.1)" : "transparent",
      }}
    >
      <Icon color={focused ? "#E09B6B" : "#FFFFFF"} size={24} />
    </View>
  );
}
