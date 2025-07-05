import { TextInput } from 'react-native';
import React from 'react';
import { styles } from '../themes/styles';

/**
 * @typedef {'default' | 'email' | 'password' | 'numeric' | 'number-pad' | 'phone-pad'} KeyboardType
 */

/**
 * @param {{
 *   placeholder?: string,
 *   keyboard?: KeyboardType,
 *   autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters',
 *   value?: string,
 *   style?: any
 * }} props
 */

const InputField = ({
  placeholder,
  keyboard = 'default',
  autoCapitalize = 'none',
  value,
  style,
  ...props
}) => {
  const isPassword = keyboard === 'password';
  const isEmail = keyboard === 'email';
  const keyboardType = isPassword ? 'default' : (isEmail ? "email-address" : keyboard);

  return (
    <TextInput
      style={[styles.inputField, style]}
      placeholder={placeholder}
      keyboardType={keyboardType}
      secureTextEntry={isPassword}
      autoCapitalize={autoCapitalize}
      multiline={false}
      numberOfLines={1}
      value={value}
      {...props}
    />
  );
};

export default InputField;