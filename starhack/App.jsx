import React from "react";
import { Provider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import { theme } from "./app/core/theme";
import {
  StartScreen,
  LoginScreen,
  RegisterScreen,
  ResetPasswordScreen,
  HomeScreen,
} from "./app/screens";
import ProfileScreen from "./app/screens/profilePage";
import DailyTasksScreen from "./app/screens/DailyTasksScreen";
import MonthlyProgressScreen from "./app/screens/MonthlyProgressScreen";
import InsuranceScreen from "./app/screens/InsuranceScreen";
import FirstPage from "./app/screens/firstPage";
const Stack = createStackNavigator();

export default function App() {
  return (
    <Provider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="StartScreen"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="StartScreen" component={StartScreen} />
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
          <Stack.Screen
            name="ResetPasswordScreen"
            component={ResetPasswordScreen}
          />
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
          <Stack.Screen name="DailyTasksScreen" component={DailyTasksScreen} />
          <Stack.Screen name="MonthlyProgressScreen" component={MonthlyProgressScreen}/>
          <Stack.Screen name="InsuranceScreen" component={InsuranceScreen} />
          <Stack.Screen name="FirstPage" component={FirstPage} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
