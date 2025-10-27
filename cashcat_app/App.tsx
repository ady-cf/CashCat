
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "./src/screens/HomeScreen";
import AnalyticsScreen from "./src/screens/AnalyticsScreen";
import TagsScreen from "./src/screens/TagsScreen";
import HistoryScreen from "./src/screens/HistoryScreen";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
  <Tab.Screen name="Home" component={HomeScreen} />
  <Tab.Screen name="History" component={HistoryScreen} />
  <Tab.Screen name="Analytics" component={AnalyticsScreen} />
  <Tab.Screen name="Tags" component={TagsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
