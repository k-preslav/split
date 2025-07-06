import { TextInput } from 'react-native';
import React from 'react';
import { styles } from '../themes/styles';
import { Colors } from '../themes/colors';

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
 *   onChangeText?: (text: string) => void,
 * }} props
 */

const InputField = ({
  placeholder,
  keyboard = 'default',
  autoCapitalize = 'none',
  value,
  style,
  onChangeText = () => {},
  ...props
}) => {
  const isPassword = keyboard === 'password';
  const isEmail = keyboard === 'email';
  const keyboardType = isPassword ? 'default' : (isEmail ? "email-address" : keyboard);

  const [canBeCentered, setCanBeCentered] = React.useState(true);
  const handleTextChange = (text) => {


    if (text.length < 20) {
      setCanBeCentered(true);
    }
    else {
      setCanBeCentered(false);
    }
  }

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
      value={value}
      textAlign={canBeCentered ? 'center' : 'left'}
      onChangeText={(text) => {
        handleTextChange(text);
        onChangeText(text);
      }}
      {...props}
    />
  );
};

export default InputField;