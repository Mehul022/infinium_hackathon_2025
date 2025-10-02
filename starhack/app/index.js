import StartScreen from "./screens/StartScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ProfileScreen from "./screens/profilePage";   
import DailyTasksScreen from "./screens/DailyTasksScreen";
import MonthlyProgressScreen from "./screens/MonthlyProgressScreen";
import InsuranceScreen from "./screens/InsuranceScreen";
import FirstPage from "./screens/firstPage";

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="StartScreen" component={StartScreen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="DailyTasksScreen" component={DailyTasksScreen} />
        <Stack.Screen name="MonthlyProgressScreen" component={MonthlyProgressScreen} />
        <Stack.Screen name="InsuranceScreen" component={InsuranceScreen} />
        <Stack.Screen name="FirstPage" component={FirstPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App; 