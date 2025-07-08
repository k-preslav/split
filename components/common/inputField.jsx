import React from "react";
import { Keyboard, TextInput } from "react-native";
import { styles } from "../themes/styles";
import { Colors } from "../themes/colors";

const InputField = ({
  placeholder,
  keyboard = 'default',
  autoCapitalize = 'none',
  value,
  style,
  onChangeText = () => {},
  onKeyboardSubmit = () => {},
  onFocus = () => {},
  callSubmitOnBlur = false,
  ...props
}) => {
  const isPassword = keyboard === 'password';
  const isEmail = keyboard === 'email';
  const keyboardType = isPassword ? 'default' : (isEmail ? 'email-address' : keyboard);

  const [canBeCentered, setCanBeCentered] = React.useState(true);

  const handleOnBlur = () => {
    Keyboard.dismiss();
    if (callSubmitOnBlur)
      onKeyboardSubmit?.();
  }

  const handleTextChange = (text) => {
    if (text.length < 20) {
      setCanBeCentered(true);
    } else {
      setCanBeCentered(false);
    }
  };

  return (
    <TextInput
      style={[styles.inputField, style]}
      placeholder={placeholder}
      placeholderTextColor={Colors.textGray}
      keyboardType={keyboardType}
      secureTextEntry={isPassword}
      autoCapitalize={autoCapitalize}
      multiline={false}
      numberOfLines={1}
      returnKeyType="done"
      value={value}
      textAlign={canBeCentered ? 'center' : 'left'}
      onChangeText={(text) => {
        handleTextChange(text);
        onChangeText(text);
      }}
      onSubmitEditing={onKeyboardSubmit}
      onBlur={handleOnBlur}
      onFocus={onFocus}
      {...props}
    />
  );
};

export default InputField;