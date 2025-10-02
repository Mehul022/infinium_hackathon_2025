import React, { useState } from "react";
import { TouchableOpacity, StyleSheet, View, Alert } from "react-native";
import { Text } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Background from "../components/Background";
import Logo from "../components/Logo";
import Header from "../components/Header";
import Button from "../components/Button";
import TextInput from "../components/TextInput";
import BackButton from "../components/BackButton";
import { theme } from "../core/theme";
import { emailValidator } from "../helpers/emailValidator";
import { passwordValidator } from "../helpers/passwordValidator";

export default function LoginScreen({ navigation }) {
  const [emailOrUsername, setEmailOrUsername] = useState({ value: "", error: "" });
  const [password, setPassword] = useState({ value: "", error: "" });
  const [loading, setLoading] = useState(false);

  const onLoginPressed = async () => {
    // Simple validation - just check if the fields are empty
    if (!emailOrUsername.value) {
      setEmailOrUsername({ ...emailOrUsername, error: "Username or email cannot be empty" });
      return;
    }
    
    const passwordError = passwordValidator(password.value);
    if (passwordError) {
      setPassword({ ...password, error: passwordError });
      return;
    }
    
    try {
      setLoading(true);
      
      // Determine if input is email or username
      const isEmail = emailOrUsername.value.includes('@');
      const requestBody = {
        password: password.value
      };
      
      // Set either email or username in the request body
      if (isEmail) {
        requestBody.email = emailOrUsername.value;
      } else {
        requestBody.username = emailOrUsername.value;
      }
      
      const response = await fetch("http://10.231.48.49:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      
      const data = await response.json();
      
      if (response.status !== 200) {
        Alert.alert("Login Error", data.error || "Invalid credentials");
        return;
      }
      
      if (data.success && data.token) {
        await AsyncStorage.setItem("token", data.token);
        navigation.reset({
          index: 0,
          routes: [{ name: "FirstPage" }],
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Background>
      <BackButton goBack={navigation.goBack} />
      <Logo />
      <Header>Welcome back</Header>
      <TextInput
        label="Email or Username"
        returnKeyType="next"
        value={emailOrUsername.value}
        onChangeText={(text) => setEmailOrUsername({ value: text, error: "" })}
        error={!!emailOrUsername.error}
        errorText={emailOrUsername.error}
        autoCapitalize="none"
      />
      <TextInput
        label="Password"
        returnKeyType="done"
        value={password.value}
        onChangeText={(text) => setPassword({ value: text, error: "" })}
        error={!!password.error}
        errorText={password.error}
        secureTextEntry
      />
      <View style={styles.forgotPassword}>
        <TouchableOpacity
          onPress={() => navigation.navigate("ResetPasswordScreen")}
        >
          <Text style={styles.forgot}>Forgot your password?</Text>
        </TouchableOpacity>
      </View>
      <Button 
        mode="contained" 
        onPress={onLoginPressed}
        loading={loading}
        disabled={loading}
      >
        Login
      </Button>
      <View style={styles.row}>
        <Text>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.replace("RegisterScreen")}>
          <Text style={styles.link}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  forgotPassword: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    marginTop: 4,
  },
  forgot: {
    fontSize: 13,
    color: theme.colors.secondary,
  },
  link: {
    fontWeight: "bold",
    color: theme.colors.primary,
  },
});
