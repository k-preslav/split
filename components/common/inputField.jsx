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
  extraLightBorder = false,
  ...props
}) => {
  const isPassword = keyboard === 'password';
  const isEmail = keyboard === 'email';
  const keyboardType = isPassword ? 'default' : (isEmail ? 'email-address' : keyboard);

  const [canBeCentered, setCanBeCentered] = React.useState(true);
  const [isFocused, setIsFocused] = React.useState(false);

  const handleOnBlur = () => {
    setIsFocused(false);
    Keyboard.dismiss();
    if (callSubmitOnBlur) onKeyboardSubmit?.();
  };

  const handleOnFocus = () => {
    setIsFocused(true);
    onFocus();
  };

  const handleTextChange = (text) => {
    if (text.length < 20) {
      setCanBeCentered(true);
    } else {
      setCanBeCentered(false);
    }
  };

  // Truncate value only for visual display
  const displayValue =
    !isFocused && typeof value === 'string' && value.length > 21
      ? value.substring(0, 18) + '...'
      : value;

  return (
    <TextInput
      style={[styles.inputField, style, {
        borderColor: extraLightBorder ? Colors.lighterGray : Colors.lightGray,
      }]}
      placeholder={placeholder}
      placeholderTextColor={Colors.textGray}
      keyboardType={keyboardType}
      secureTextEntry={isPassword}
      autoCapitalize={autoCapitalize}
      multiline={false}
      numberOfLines={1}
      returnKeyType="done"
      value={displayValue}
      textAlign={canBeCentered ? 'center' : 'left'}
      onChangeText={(text) => {
        handleTextChange(text);
        onChangeText(text);
      }}
      onSubmitEditing={onKeyboardSubmit}
      onBlur={handleOnBlur}
      onFocus={handleOnFocus}
      {...props}
    />
  );
};

export default InputField;