import { View, TouchableOpacity, ScrollView, TextInput, Keyboard, Platform, Animated, Alert, Image, Linking, ActivityIndicator, Button } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import ThemedModal from './themedModal';
import ThemedText from '../common/themedText';
import { Colors } from '../themes/colors';
import Separator from '../special/separator';
import InputField from '../common/inputField';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ThemedButton from '../common/themedButton';
import { ChevronRight, ChevronDown, StepBack, Calendar, Camera, Upload, RefreshCcw, Info, Landmark, Check, X, RefreshCw, RefreshCcwDot, Rotate3d, RotateCw } from 'lucide-react-native';
import * as Localization from 'expo-localization';
import ActionButton from '../common/actionButton';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { BlurView } from 'expo-blur';
import { connectToStripe, uploadStripeFile } from '../../lib/stripeApi';
import { getCurrencyFromLocale } from '../../lib/getCurrencyFromLocale';
import { userDetails } from '../../lib/userDetails';
import { updateUserStipeConnectId } from '../../lib/updateUser';

const ConnectBankModal = ({visible, onClose}) => {
  const insets = useSafeAreaInsets();
  const [step, setStep] = React.useState(1);

  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');

  const [phoneNumber, setPhoneNumber] = React.useState('');
  const spinAnimation = React.useRef(new Animated.Value(0)).current;
  const [verificationCode, setVerificationCode] = React.useState(['', '', '', '', '', '']);
  const codeInputRefs = useRef([]);
  const [isResending, setIsResending] = React.useState(false);
  const [resendCountdown, setResendCountdown] = React.useState(0);
  const countdownIntervalRef = React.useRef(null);

  const [showCountryPicker, setShowCountryPicker] = React.useState(false);
  const [selectedCountry, setSelectedCountry] = React.useState({ code: '+49', name: 'DE' });
  const pickerAnimation = React.useRef(new Animated.Value(0)).current;

  const [keyboardVisible, setKeyboardVisible] = React.useState(false);

  const [infoText, setInfoText] = React.useState('Please provide your real names.');
  const [prefModalHeight, setPrefModalHeight] = React.useState('50%');

  const [date, setDate] = React.useState(new Date());
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [formattedDate, setFormattedDate] = React.useState('');

  // Address information
  const [street, setStreet] = React.useState('');
  const [city, setCity] = React.useState('');
  const [zipCode, setZipCode] = React.useState('');
  const [state, setState] = React.useState('');

  // ID verification images
  const [frontIdImage, setFrontIdImage] = React.useState(null);
  const [backIdImage, setBackIdImage] = React.useState(null);
  const [loadingFrontImage, setLoadingFrontImage] = React.useState(false);
  const [loadingBackImage, setLoadingBackImage] = React.useState(false);

  const [iban, setIban] = React.useState('');

  const [isConnected, setIsConnected] = React.useState(false);
  
  const [imageUploadFailed, setImageUploadFailed] = React.useState(false);
  const [connectFailed, setConnectFailed] = React.useState(false);
  const [updateProfileFailed, setUpdateProfileFailed] = React.useState(false);

  const [loadingState, setLoadingState] = React.useState('');

  const getModalHeight = () => {
    if (showDatePicker && Platform.OS === 'ios') {
      return '88%';
    }

    return keyboardVisible || showCountryPicker ? step === 5 ? '98%' : '75%' : prefModalHeight;
  };

  React.useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  React.useEffect(() => {
    Animated.timing(pickerAnimation, {
      toValue: showCountryPicker ? 1 : 0,
      duration: 235,
      useNativeDriver: true,
    }).start();
  }, [showCountryPicker]);

  const toggleCountryPicker = () => {
    setShowCountryPicker(prev => !prev);
  };

  const getCountryName = (code) => {
    const countryNames = {
      'AL': 'Albania',
      'AD': 'Andorra',
      'AM': 'Armenia',
      'AT': 'Austria',
      'BY': 'Belarus',
      'BE': 'Belgium',
      'BA': 'Bosnia and Herzegovina',
      'BG': 'Bulgaria',
      'HR': 'Croatia',
      'CY': 'Cyprus',
      'CZ': 'Czech Republic',
      'DK': 'Denmark',
      'EE': 'Estonia',
      'FI': 'Finland',
      'FR': 'France',
      'DE': 'Germany',
      'GI': 'Gibraltar',
      'GR': 'Greece',
      'HU': 'Hungary',
      'IS': 'Iceland',
      'IE': 'Ireland',
      'IT': 'Italy',
      'XK': 'Kosovo',
      'LV': 'Latvia',
      'LI': 'Liechtenstein',
      'LT': 'Lithuania',
      'LU': 'Luxembourg',
      'MK': 'North Macedonia',
      'MT': 'Malta',
      'MD': 'Moldova',
      'MC': 'Monaco',
      'ME': 'Montenegro',
      'NL': 'Netherlands',
      'NO': 'Norway',
      'PL': 'Poland',
      'PT': 'Portugal',
      'RO': 'Romania',
      'SM': 'San Marino',
      'RS': 'Serbia',
      'SK': 'Slovakia',
      'SI': 'Slovenia',
      'ES': 'Spain',
      'SE': 'Sweden',
      'CH': 'Switzerland',
      'UA': 'Ukraine',
      'GB': 'United Kingdom',
      'VA': 'Vatican City',
    };

    return countryNames[code] || code;
  };

  const countryCodes = [
    { code: '+355', name: 'AL' },
    { code: '+376', name: 'AD' },
    { code: '+374', name: 'AM' },
    { code: '+43', name: 'AT' },
    { code: '+375', name: 'BY' },
    { code: '+32', name: 'BE' },
    { code: '+387', name: 'BA' },
    { code: '+359', name: 'BG' },
    { code: '+385', name: 'HR' },
    { code: '+357', name: 'CY' },
    { code: '+420', name: 'CZ' },
    { code: '+45', name: 'DK' },
    { code: '+372', name: 'EE' },
    { code: '+358', name: 'FI' },
    { code: '+33', name: 'FR' },
    { code: '+49', name: 'DE' },
    { code: '+350', name: 'GI' },
    { code: '+30', name: 'GR' },
    { code: '+36', name: 'HU' },
    { code: '+354', name: 'IS' },
    { code: '+353', name: 'IE' },
    { code: '+39', name: 'IT' },
    { code: '+383', name: 'XK' },
    { code: '+371', name: 'LV' },
    { code: '+423', name: 'LI' },
    { code: '+370', name: 'LT' },
    { code: '+352', name: 'LU' },
    { code: '+389', name: 'MK' },
    { code: '+356', name: 'MT' },
    { code: '+373', name: 'MD' },
    { code: '+377', name: 'MC' },
    { code: '+382', name: 'ME' },
    { code: '+31', name: 'NL' },
    { code: '+47', name: 'NO' },
    { code: '+48', name: 'PL' },
    { code: '+351', name: 'PT' },
    { code: '+40', name: 'RO' },
    { code: '+378', name: 'SM' },
    { code: '+381', name: 'RS' },
    { code: '+421', name: 'SK' },
    { code: '+386', name: 'SI' },
    { code: '+34', name: 'ES' },
    { code: '+46', name: 'SE' },
    { code: '+41', name: 'CH' },
    { code: '+380', name: 'UA' },
    { code: '+44', name: 'GB' },
    { code: '+379', name: 'VA' },
  ];

  const findCountryByLocale = (locale) => {
    if (!locale) return { code: '+359', name: 'BG' };

    const country = countryCodes.find(c => c.name === locale);
    if (country) {
      return country;
    } else {
      console.log('Country not found for locale:', locale, 'Using default.');
      return { code: '+359', name: 'BG' };
    }
  };

  React.useEffect(() => {
    try {
      const locale = Localization.getLocales()[0].regionCode;
      const country = findCountryByLocale(locale);
      setSelectedCountry(country);
    } catch (error) {
      console.error('Error getting locale:', error);
    }
  }, []);

  React.useEffect(() => {
    if (resendCountdown > 0) {
      countdownIntervalRef.current = setInterval(() => {
        setResendCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [resendCountdown]);

  React.useEffect(() => {
    if (step === 1) {
      setInfoText('Please provide your real names.');
      setPrefModalHeight('50%');
    } else if (step === 2) {
      setInfoText('Enter your mobile phone number for verification.');
      setPrefModalHeight('50%');
    } else if (step === 3) {
      setInfoText('We sent a verification code to your phone number. Please enter it to continue.');
      setPrefModalHeight('57%');
    } else if (step === 4) {
      setInfoText('You must be at least 18 years old to continue.');
      setPrefModalHeight('50%');
    } else if (step === 5) {
      setInfoText('');
      setPrefModalHeight('72%');
    } else if (step === 6) {
      setInfoText('');
      setPrefModalHeight('95%');
    } else if (step === 7) {
      setInfoText('');
      setPrefModalHeight('56%');
    } else if (step === 8) {
      setInfoText('');
      setPrefModalHeight('40%');
    }
  }, [step]);

  const handleCodeChange = (text, index) => {
    const newCode = [...verificationCode];

    const sanitizedText = text.replace(/[^0-9]/g, '');
    newCode[index] = sanitizedText.slice(0, 1);

    setVerificationCode(newCode);

    if (sanitizedText.length === 1 && index < 5) {
      codeInputRefs.current[index + 1].focus();
    } else if (sanitizedText.length === 1 && index === 5) {
      Keyboard.dismiss();
    }
  };
  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (verificationCode[index] === '' && index > 0) {
        codeInputRefs.current[index - 1].focus();
      }
    }
  };

  const handleSubmitEditing = () => {
    Keyboard.dismiss();
  };
  const handleResendCode = () => {
    setIsResending(true);

    Animated.loop(
      Animated.timing(spinAnimation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();

    setTimeout(() => {
      console.log('Resending verification code to:', selectedCountry.code + phoneNumber);
      setIsResending(false);

      spinAnimation.setValue(0);

      setVerificationCode(['', '', '', '', '', '']);

      if (codeInputRefs.current[0]) {
        codeInputRefs.current[0].focus();
      }

      // Start the 60-second countdown
      setResendCountdown(60);
    }, 1500);
  };

  const onDateChange = (event, selectedDate) => {
    // For iOS, we need to store the temporary date without confirming it yet
    if (Platform.OS === 'ios') {
      // Store the temporary date while the date picker is open
      const tempDate = selectedDate || date;

      // Update the date state with the selected date
      setDate(tempDate);

      // No need to format or set formattedDate yet - we'll do that on confirm
      return;
    }

    // For Android, we update immediately since the picker closes automatically
    if (selectedDate) {
      const currentDate = selectedDate;
      setShowDatePicker(false);
      setDate(currentDate);

      // Format the date
      const day = currentDate.getDate().toString().padStart(2, '0');
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const year = currentDate.getFullYear();
      setFormattedDate(`${day}/${month}/${year}`);

      // Check if user is at least 18 years old
      calculateAge(currentDate);
    }
  };

  // Helper function to calculate and log age
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  // Functions for ID image handling
  const takeIdPhoto = async (isForFront) => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take ID photos');
        return;
      }

      // Set loading state
      if (isForFront) {
        setLoadingFrontImage(true);
      } else {
        setLoadingBackImage(true);
      }

      // Start spinner animation for loading state
      Animated.loop(
        Animated.timing(spinAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      // Process result
      if (!result.canceled && result.assets && result.assets.length > 0) {
        if (isForFront) {
          setFrontIdImage(result.assets[0].uri);
        } else {
          setBackIdImage(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      // Clear loading state
      if (isForFront) {
        setLoadingFrontImage(false);
      } else {
        setLoadingBackImage(false);
      }

      // Stop spinner animation
      spinAnimation.setValue(0);
    }
  };

  // Add ability to pick images from gallery
  const pickIdImageFromGallery = async (isForFront) => {
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Media library permission is required to select ID photos');
        return;
      }

      // Set loading state
      if (isForFront) {
        setLoadingFrontImage(true);
      } else {
        setLoadingBackImage(true);
      }

      // Start spinner animation for loading state
      Animated.loop(
        Animated.timing(spinAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      // Process result
      if (!result.canceled && result.assets && result.assets.length > 0) {
        if (isForFront) {
          setFrontIdImage(result.assets[0].uri);
        } else {
          setBackIdImage(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error('Error picking image from gallery:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    } finally {
      // Clear loading state
      if (isForFront) {
        setLoadingFrontImage(false);
      } else {
        setLoadingBackImage(false);
      }

      // Stop spinner animation
      spinAnimation.setValue(0);
    }
  };

  const clearIdImage = (isForFront) => {
    if (isForFront) {
      setFrontIdImage(null);
    } else {
      setBackIdImage(null);
    }
  };

  useEffect(() => {
    if (userDetails.userProfile?.stripeConnectId) {
      setIsConnected(true);
      setStep(8);

      setTimeout(() => close(true), 1250);
    }
  }, [visible]);

  const connectBank = async() => {
    setImageUploadFailed(false);
    setConnectFailed(false);
    setUpdateProfileFailed(false);

    if (userDetails.userProfile?.stripeConnectId) {
      setIsConnected(true);
      setTimeout(() => close(true), 1250);

      return;
    }

    setLoadingState('Uploading ID images...');
    console.log("Uploading id images to stripe...");

    const frontIdUpload = await uploadStripeFile(frontIdImage);
    if (frontIdUpload.error) {
      setImageUploadFailed(true);
      setLoadingState('Failed to upload front ID image.');
      return;
    }

    const backIdUpload = await uploadStripeFile(backIdImage);
    if (backIdUpload.error) {
      setImageUploadFailed(true);
      setLoadingState('Failed to upload back ID image.');
      return;
    }

    console.log("Connecting bank...");
    setLoadingState('Connecting bank...');

    // Check if IBAN starts with country code and remove it to avoid duplication
    let ibanValue = '';
    ibanValue = iban.trim();

    if (ibanValue.length >= 2) {
      const firstTwoChars = ibanValue.substring(0, 2);
      if (firstTwoChars === selectedCountry.name) {
        ibanValue = ibanValue.substring(2);
      }
    }

    const data = {
      firstName: firstName,
      lastName: lastName,
      email: userDetails?.userProfile?.email,
      phone: selectedCountry.code + phoneNumber,
      country: Localization.getLocales()[0].regionCode,
      dob: {
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear(),
      },
      address: {
        line1: street,
        city: city,
        postal_code: zipCode,
        state: state,
      },
      currency: getCurrencyFromLocale(),
      iban: selectedCountry.name + ibanValue,
      idFrontFile: frontIdUpload.id,
      idBackFile: backIdUpload.id,
    };

    const res = await connectToStripe(data);
    
    if (res.error) {
      setConnectFailed(true);
      setLoadingState('Failed to connect bank.');
      return;
    } else if (res.accountId) {
      setLoadingState('Updating profile...');

      const updateRes = await updateUserStipeConnectId(res.accountId);
      if (updateRes) {
        setIsConnected(true);
        setTimeout(() => close(true), 1250);
      } else {
        setUpdateProfileFailed(true);
        setLoadingState('Failed to update profile.');
        return;
      }
    }
  }

  const close = (success = false) => {
    onClose?.(success);

    setStep(1);
    setFirstName('');
    setLastName('');
    setPhoneNumber('');
    setVerificationCode(['', '', '', '', '', '']);
    setIsResending(false);
    setResendCountdown(0);
    setSelectedCountry({ code: '+359', name: 'BG' });
    setStreet('');
    setCity('');
    setZipCode('');
    setState('');
    setFrontIdImage(null);
    setBackIdImage(null);
    setLoadingFrontImage(false);
    setLoadingBackImage(false);
    setIban('');
    setIsConnected(false);
    setImageUploadFailed(false);
    setConnectFailed(false);
    setUpdateProfileFailed(false);
    setLoadingState('');
    setFormattedDate('');
    setDate(new Date());
    setShowDatePicker(false);
    setInfoText('Please provide your real names.');
    setPrefModalHeight('50%');
    setShowCountryPicker(false);
    pickerAnimation.setValue(0);
    spinAnimation.setValue(0);
    codeInputRefs.current = [];
  }

  return (
    <ThemedModal visible={visible} onClose={close} height={getModalHeight()}>
      <View
        style={{
          position: 'absolute',
          top: 26,
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: 10,
          paddingBottom: insets.bottom,
          gap: 12,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <ThemedText style={{ paddingLeft: 12 }} fontSize={28} fontWeight='Bold'>
          Connect Bank
        </ThemedText>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'flex-start', paddingLeft: 12, gap: 1 }}>
          {step < 8 ? (
            <>
            <ThemedText fontSize={22} color={Colors.textGray} style={{ paddingRight: 5 }}>{`Step`}</ThemedText>
            <ThemedText fontSize={22} color={Colors.textGray} animate={true}>{step}</ThemedText>
            <ThemedText fontSize={22} color={Colors.textGray}>/</ThemedText>
            <ThemedText fontSize={22} color={Colors.textGray}>7</ThemedText>
            </>
          ) :  (
            <ThemedText fontSize={22} color={Colors.textGray}>
              {
                (connectFailed || imageUploadFailed || updateProfileFailed)
                ? 'Something went wrong!' 
                : (isConnected) 
                  ? 'Done!' 
                  : 'Please wait.'
              }
            </ThemedText>
          )}
        </View>

        <Separator />

        {step === 1 && (
          <>
            <View style={{ paddingHorizontal: 12, gap: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <ThemedText fontSize={26}>First name:</ThemedText>
              <InputField 
                placeholder='John' 
                autoCapitalize='words' 
                value={firstName} 
                onChangeText={setFirstName} 
                extraLightBorder 
                backgroundColor={Colors.lightGray} 
                width='60%' 
              />
            </View>
            <View style={{ paddingHorizontal: 12, gap: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <ThemedText fontSize={26}>Last name:</ThemedText>
              <InputField 
                placeholder='Doe' 
                autoCapitalize='words' 
                value={lastName} 
                onChangeText={setLastName} 
                extraLightBorder 
                backgroundColor={Colors.lightGray} 
                width='60%' 
              />
            </View>
          </>
        )}

        {step === 2 && (
          <View style={{ paddingHorizontal: 5, gap: 10, alignItems: 'center' }}>
            <ThemedText fontSize={21} style={{ paddingHorizontal: 12, alignSelf: 'flex-start' }}>
              Enter your mobile phone number:
            </ThemedText>
            <View style={{ flexDirection: 'row', width: '95%', gap: 10, alignItems: 'center' }}>
              <TouchableOpacity
                onPress={toggleCountryPicker}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 12,
                  borderWidth: 1,
                  borderColor: Colors.lighterGray,
                  borderRadius: 8,
                  backgroundColor: Colors.lightGray,
                  width: '30%',
                }}
              >
                <ThemedText fontSize={18} fontWeight='Medium'>
                  {selectedCountry.code}
                </ThemedText>
                <Animated.View style={{
                  transform: [{
                    rotate: pickerAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '180deg']
                    })
                  }]
                }}>
                  <ChevronDown size={18} color={Colors.textLight} />
                </Animated.View>
              </TouchableOpacity>
              <TextInput
                style={{
                  backgroundColor: Colors.lightGray,
                  padding: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: Colors.lighterGray,
                  flex: 1,
                  fontSize: 18,
                  color: Colors.textLight,
                  fontFamily: 'Satoshi-Regular',
                }}
                placeholder='Phone number'
                placeholderTextColor={Colors.textGray}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType='phone-pad'
                returnKeyType='done'
              />
            </View>
            {showCountryPicker && (
              <Animated.View
                style={{
                  position: 'absolute',
                  top: 98,
                  left: 14,
                  right: 14,
                  backgroundColor: Colors.lightGray,
                  borderRadius: 12,
                  borderColor: Colors.lighterGray,
                  borderWidth: 1,
                  maxHeight: 250,
                  zIndex: 1000,
                  paddingVertical: 5,
                  elevation: 5,
                  opacity: pickerAnimation,
                  transform: [
                    {
                      translateY: pickerAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 0],
                      }),
                    },
                    {
                      scale: pickerAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.9, 1],
                      }),
                    },
                  ],
                }}
              >
                <ScrollView style={{ maxHeight: 250 }} showsVerticalScrollIndicator={false}>
                  {countryCodes.map((country, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        setSelectedCountry(country);
                        setShowCountryPicker(false);
                      }}
                      style={{
                        padding: 15,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottomWidth: index === countryCodes.length - 1 ? 0 : 1,
                        borderBottomColor: Colors.lighterGray,
                        marginHorizontal: 10,
                        backgroundColor: selectedCountry.code === country.code ? Colors.lighterGray : 'transparent',
                        borderRadius: 8,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <ThemedText fontSize={18} fontWeight='Medium' style={{ width: 70 }}>
                          {country.code}
                        </ThemedText>
                        <ThemedText fontSize={16} color={Colors.textGray}>
                          {getCountryName(country.name)}
                        </ThemedText>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </Animated.View>
            )}
          </View>
        )}

        {step === 3 && (
          <View style={{ paddingHorizontal: 12 }}>
            <ThemedText fontSize={24} style={{ marginBottom: 16, paddingLeft: 5 }}>Enter verification code:</ThemedText>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (codeInputRefs.current[index] = ref)}
                  style={{
                    width: 50,
                    height: 65,
                    backgroundColor: Colors.lightGray,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: Colors.lighterGray,
                    fontSize: 24,
                    color: Colors.textLight,
                    fontFamily: 'Satoshi-Medium',
                    textAlign: 'center',
                    marginHorizontal: 4,
                    padding: 0,
                  }}
                  keyboardType="number-pad"
                  returnKeyType="done"
                  maxLength={1}
                  value={verificationCode[index]}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  onSubmitEditing={handleSubmitEditing}
                  selectionColor={Colors.accent}
                />
              ))}
            </View>
            <TouchableOpacity
              style={{
                alignSelf: 'center',
                marginTop: 10,
                opacity: isResending || resendCountdown > 0 ? 0.5 : 1,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
              onPress={handleResendCode}
              disabled={isResending || resendCountdown > 0}
            >
              <ThemedText fontSize={16} color={Colors.accent} style={{ fontFamily: 'Satoshi-Medium' }}>
                {isResending ? 'Sending...' : resendCountdown > 0 ? `Resend code (${resendCountdown}s)` : 'Resend code'}
              </ThemedText>
              {isResending && (
                <Animated.View
                  style={{
                    width: 15,
                    height: 15,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: Colors.primary,
                    borderTopColor: 'transparent',
                    transform: [{
                      rotate: spinAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg']
                      })
                    }]
                  }}
                />
              )}
            </TouchableOpacity>
          </View>
        )}

        {step === 4 && (
          <View style={{ paddingHorizontal: 12, gap: 6 }}>
            <ThemedText fontSize={25} style={{ paddingHorizontal: 4, marginBottom: 10 }}>
              Select your birth date:
            </ThemedText>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 15,
                backgroundColor: Colors.lightGray,
                borderWidth: 1,
                borderColor: Colors.lighterGray,
                borderRadius: 10,
                marginVertical: 5,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Calendar size={22} color={Colors.textLight} />
                <ThemedText fontSize={19} fontWeight="Medium">
                  {formattedDate || "Select a date"}
                </ThemedText>
              </View>
              <ChevronRight size={18} color={Colors.textLight} />
            </TouchableOpacity>

            {showDatePicker && Platform.OS === 'ios' && (
              <View style={{
                marginTop: 10,
                paddingTop: 10,
                paddingBottom: 10,
                backgroundColor: Colors.lightGray,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: Colors.lighterGray,
              }}>
                <DateTimePicker
                  testID="dateTimePicker"
                  value={date}
                  mode="date"
                  display="spinner"
                  onChange={onDateChange}
                  maximumDate={new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate())}
                  minimumDate={new Date(1920, 0, 1)}
                  textColor={Colors.textLight}
                  style={{
                    width: '100%',
                    height: 130,
                  }}
                />
                <TouchableOpacity
                  onPress={() => {
                    // Format and save the date when confirming
                    const currentDate = date;
                    const day = currentDate.getDate().toString().padStart(2, '0');
                    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
                    const year = currentDate.getFullYear();
                    setFormattedDate(`${day}/${month}/${year}`);

                    // Close the date picker
                    setShowDatePicker(false);

                    // Check and log age
                    calculateAge(currentDate);
                  }}
                  style={{
                    alignSelf: 'center',
                    marginTop: 10,
                    paddingVertical: 8,
                    paddingHorizontal: 20,
                    backgroundColor: Colors.accent,
                    borderRadius: 8,
                  }}
                >
                  <ThemedText fontSize={16} fontWeight="Medium" color={Colors.white}>
                    Confirm
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}

            {showDatePicker && Platform.OS === 'android' && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode="date"
                display="default"
                onChange={onDateChange}
                maximumDate={new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate())}
                minimumDate={new Date(1920, 0, 1)}
              />
            )}
          </View>
        )}

        {step === 5 && (
          <View style={{ paddingHorizontal: 12, gap: 10 }}>
            <ThemedText fontSize={24} style={{ marginBottom: 10 }}>
              Enter your address information:
            </ThemedText>

            <View style={{ gap: 16, width: '100%' }}>
              <View style={{ gap: 6 }}>
                <ThemedText fontSize={18} color={Colors.textGray} style={{ marginLeft: 5 }}>
                  Street Address
                </ThemedText>
                <TextInput
                  style={{
                    backgroundColor: Colors.lightGray,
                    padding: 14,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: Colors.lighterGray,
                    width: '100%',
                    fontSize: 18,
                    color: Colors.textLight,
                    fontFamily: 'Satoshi-Regular',
                  }}
                  placeholder="123 Main Street"
                  placeholderTextColor={Colors.textGray}
                  value={street}
                  onChangeText={setStreet}
                  returnKeyType="next"
                />
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                <View style={{ flex: 1, gap: 6 }}>
                  <ThemedText fontSize={18} color={Colors.textGray} style={{ marginLeft: 5 }}>
                    City
                  </ThemedText>
                  <TextInput
                    style={{
                      backgroundColor: Colors.lightGray,
                      padding: 14,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: Colors.lighterGray,
                      width: '100%',
                      fontSize: 18,
                      color: Colors.textLight,
                      fontFamily: 'Satoshi-Regular',
                    }}
                    placeholder="City"
                    placeholderTextColor={Colors.textGray}
                    value={city}
                    onChangeText={setCity}
                    returnKeyType="next"
                  />
                </View>

                <View style={{ width: '35%', gap: 6 }}>
                  <ThemedText fontSize={18} color={Colors.textGray} style={{ marginLeft: 5 }}>
                    Zip Code
                  </ThemedText>
                  <TextInput
                    style={{
                      backgroundColor: Colors.lightGray,
                      padding: 14,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: Colors.lighterGray,
                      width: '100%',
                      fontSize: 18,
                      color: Colors.textLight,
                      fontFamily: 'Satoshi-Regular',
                    }}
                    placeholder="12345"
                    placeholderTextColor={Colors.textGray}
                    value={zipCode}
                    onChangeText={setZipCode}
                    keyboardType="numeric"
                    returnKeyType="next"
                    maxLength={10}
                  />
                </View>
              </View>

              <View style={{ gap: 6 }}>
                <ThemedText fontSize={18} color={Colors.textGray} style={{ marginLeft: 5 }}>
                  State / Province
                </ThemedText>
                <TextInput
                  style={{
                    backgroundColor: Colors.lightGray,
                    padding: 14,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: Colors.lighterGray,
                    width: '100%',
                    fontSize: 18,
                    color: Colors.textLight,
                    fontFamily: 'Satoshi-Regular',
                  }}
                  placeholder="State or Province"
                  placeholderTextColor={Colors.textGray}
                  value={state}
                  onChangeText={setState}
                  returnKeyType="done"
                  onSubmitEditing={() => Keyboard.dismiss()}
                />
              </View>
            </View>
          </View>
        )}

        {step === 6 && (
          <View style={{ flex: 1 }}>
            <ThemedText fontSize={24} style={{ paddingHorizontal: 12, marginBottom: 15 }}>
              ID Verification
            </ThemedText>
            <ScrollView
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              horizontal={false}
              contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 12 }}
            >
              <ThemedText fontSize={16} color={Colors.textGray} style={{ marginBottom: 15, lineHeight: 22 }}>
                Please provide clear images of both sides of your government-issued ID for verification purposes.
              </ThemedText>

              {/* Front ID Card Section */}
              <View style={{ marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: frontIdImage ? Colors.primary : Colors.lightGray,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 10
                  }}>
                    <ThemedText fontSize={14} color={frontIdImage ? Colors.textDark : Colors.textGray} fontWeight="Bold">1</ThemedText>
                  </View>
                  <ThemedText fontSize={18} fontWeight="Medium">Front of ID Card</ThemedText>

                  {frontIdImage && (
                    <ThemedText
                      fontSize={16}
                      fontWeight="Regular"
                      style={{
                        marginLeft: 'auto',
                        marginRight: 5,
                        textDecorationLine: 'underline',
                      }}
                      onPress={() => clearIdImage(true)}
                    >Clear</ThemedText>
                  )}
                </View>

                <View style={{
                  backgroundColor: Colors.lightGray,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: frontIdImage ? Colors.primary : Colors.lighterGray,
                  overflow: 'hidden',
                  height: 200,
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 7,
                }}>
                  {frontIdImage ? (
                    <Image
                      source={{ uri: frontIdImage }}
                      style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                    ></Image>
                  ) : (
                    <>
                      <ThemedButton
                        text='Take Photo'
                        icon={<Camera strokeWidth={2.5} />}
                        sizeX={145}
                        sizeY={50}
                        fontSize={15}
                        style={{
                          backgroundColor: Colors.lighterGray
                        }}
                        isRound={false}
                        isPrimary={false}
                        onPress={() => takeIdPhoto(true)}
                      />
                      <ThemedButton
                        text='From Gallery'
                        icon={<Upload strokeWidth={2.5} />}
                        sizeX={145}
                        sizeY={50}
                        fontSize={15}
                        style={{
                          backgroundColor: Colors.lighterGray
                        }}
                        isRound={false}
                        isPrimary={false}
                        onPress={() => pickIdImageFromGallery(true)}
                      />
                    </>
                  )}
                </View>
              </View>

              {/* Back ID Card Section */}
              <View style={{ marginBottom: 15 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: backIdImage ? Colors.primary : Colors.lightGray,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 10
                  }}>
                    <ThemedText fontSize={14} color={backIdImage ? Colors.textDark : Colors.textGray} fontWeight="Bold">2</ThemedText>
                  </View>
                  <ThemedText fontSize={18} fontWeight="Medium">Back of ID Card</ThemedText>

                  {backIdImage && (
                    <ThemedText
                      fontSize={16}
                      fontWeight="Regular"
                      style={{
                        marginLeft: 'auto',
                        marginRight: 5,
                        textDecorationLine: 'underline',
                      }}
                      onPress={() => clearIdImage(false)}
                    >Clear</ThemedText>
                  )}
                </View>

                <View style={{
                  backgroundColor: Colors.lightGray,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: backIdImage ? Colors.primary : Colors.lighterGray,
                  overflow: 'hidden',
                  height: 200,
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 7,
                }}>
                  {backIdImage ? (
                    <Image
                      source={{ uri: backIdImage }}
                      style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                    ></Image>
                  ) : (
                    <>
                      <ThemedButton
                        text='Take Photo'
                        icon={<Camera strokeWidth={2.5} />}
                        sizeX={145}
                        sizeY={50}
                        fontSize={15}
                        style={{
                          backgroundColor: Colors.lighterGray
                        }}
                        isRound={false}
                        isPrimary={false}
                        onPress={() => takeIdPhoto(false)}
                      />
                      <ThemedButton
                        text='From Gallery'
                        icon={<Upload strokeWidth={2.5} />}
                        sizeX={145}
                        sizeY={50}
                        fontSize={15}
                        style={{
                          backgroundColor: Colors.lighterGray
                        }}
                        isRound={false}
                        isPrimary={false}
                        onPress={() => pickIdImageFromGallery(false)}
                      />
                    </>
                  )}
                </View>
              </View>

              <View style={{
                backgroundColor: Colors.lighterGray,
                borderRadius: 12,
                padding: 15,
                marginTop: 5,
                marginBottom: 20
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                  <Info size={18} color={Colors.textGray} style={{ marginTop: 2 }} />
                  <ThemedText fontSize={14} color={Colors.textGray} style={{ flex: 1, lineHeight: 20 }}>
                    Your ID information is not stored on our servers.
                  </ThemedText>
                </View>
              </View>
            </ScrollView>
          </View>
        )}

        {step === 7 && (
          <View style={{ paddingHorizontal: 12 }}>
            <ThemedText fontSize={22}>
              Provide your bank account details to connect your bank account.
            </ThemedText>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 17 }}>
              <View style={{
                backgroundColor: Colors.lightGray,
                borderColor: Colors.lighterGray,
                borderWidth: 1,
                borderRadius: 8,
                padding: 13,
              }}>
                <Landmark color={Colors.textLight} />
              </View>
              <View style={{
                flexDirection: 'row',
                width: '80%',
                borderWidth: 1,
                borderColor: Colors.lighterGray,
                borderRadius: 8,
                backgroundColor: Colors.lightGray,
                overflow: 'hidden',
              }}>
                <View style={{
                  backgroundColor: Colors.lighterGray,
                  paddingHorizontal: 12,
                  justifyContent: 'center',
                  borderRightWidth: 1,
                  borderRightColor: Colors.lighterGray,
                }}>
                  <ThemedText fontSize={18} fontWeight="Medium">
                    {selectedCountry.name}
                  </ThemedText>
                </View>
                <TextInput
                  style={{
                    flex: 1,
                    padding: 14,
                    fontSize: 18,
                    color: Colors.textLight,
                    fontFamily: 'Satoshi-Regular',
                  }}
                  placeholder='IBAN number'
                  keyboardType="default"
                  autoCapitalize="characters"
                  returnKeyType="done"
                  value={iban}
                  onChangeText={setIban}
                />
              </View>
            </View>

            <ThemedText fontSize={16} color={Colors.textGray} style={{ marginTop: 15, textAlign: 'center' }}>
              By connecting your bank account, you agree to the{' '}
              <ThemedText
                fontSize={16}
                color={Colors.textGray}
                style={{ textDecorationLine: 'underline' }}
                onPress={() => Linking.openURL('https://stripe.com/connect-account/legal')}
              >
                Stripe Connected Account Agreement.
              </ThemedText>
            </ThemedText>
          </View>
        )}

        {step === 8 && (
          <View style={{ bottom: 20, alignItems: 'center', justifyContent: 'center', flex: 1}}>
            {isConnected ? (
              <Check size={60} strokeWidth={2.6} color={Colors.primary} />
            ) : (imageUploadFailed || connectFailed || updateProfileFailed) ? (
              <View style={{ alignItems: 'center', justifyContent: 'center', gap: 10, top: 12 }}>
              <X size={50} strokeWidth={3} color={Colors.red} />
              <ThemedText fontSize={24} color={Colors.textGray} style={{ marginBottom: 10 }}>
                {imageUploadFailed ? 'Image upload failed.' : connectFailed ? 'Bank connection failed.' : 'Profile update failed.'}
              </ThemedText>

              <ThemedButton 
                text='Retry'
                icon={<RotateCw strokeWidth={2.5} />}
                isPrimary={true}
                isRound={false}
                sizeX={150}
                sizeY={50}
                onPress={() => {
                  setStep(1);
                }}
              />
              </View>
            ) : (
              <>
              <ActivityIndicator size="small" color={Colors.textLight} style={{ marginBottom: 10 }} />
              <ThemedText animate={true} fontSize={18} fontWeight={"Medium"} color={Colors.textGray}>
                {loadingState}
              </ThemedText>
              </>
            )}
          </View>
        )}

        {step < 8 && (
          <View style={{
            position: 'absolute',
            bottom: insets.bottom,
            left: 24,
            right: 24,
            zIndex: 1010
          }}>
            <BlurView
              intensity={15}
              tint="light"
              style={{
                position: 'absolute',
                bottom: -insets.bottom,
                left: -24,
                right: -24,
                height: infoText ? infoText.length > 47 ? 168 : 148 : 125,
                zIndex: -1,
                borderTopLeftRadius: 36,
                borderTopRightRadius: 36,
                overflow: 'hidden',
              }}
            />

            <ThemedText fontSize={16} color={Colors.textGray} style={{ paddingHorizontal: 12, textAlign: 'center', marginBottom: 15, fontFamily: 'Satoshi-Regular' }}>
              {infoText}
            </ThemedText>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
              {step > 1 && (
                <ActionButton
                  size={68}
                  isPrimary={false}
                  extraLightWhenSecondary={true}
                  icon={<StepBack strokeWidth={2.5} />}
                  onPress={() => {
                    setStep(prev => Math.max(prev - 1, 1));

                    setShowCountryPicker(false);
                    setShowDatePicker(false);
                  }}
                />
              )}
              <ThemedButton
                style={{ textAlign: 'center', width: step > 1 ? "80%" : '100%', zIndex: 1009 }}
                icon={<ChevronRight strokeWidth={2.3} />}
                text={step === 7 ? 'Finish' : 'Next step'}
                onPress={async() => {
                  if (step === 1) {
                    if (!firstName || !lastName) {
                      Alert.alert('Please enter your first and last name.');
                      return;
                    }
                  } else if (step === 2) {
                    if (!selectedCountry.code) {
                      Alert.alert('Please select your country code.');
                      return;
                    }
                    if (!phoneNumber.trim()) {
                      Alert.alert('Please enter your phone number.');
                      return;
                    }
                  } else if (step === 3) {
                    const code = verificationCode.join('');

                    if (code.length === 6) {
                      console.log('Code verification successful');
                    } else {
                      Alert.alert('Verification failed', 'The code you entered is incorrect.');
                      return;
                    }
                  } else if (step === 4) {
                    if (!formattedDate) {
                      Alert.alert('Please select your birth date.');
                      return;
                    }

                    // Check if user is at least 18 years old
                    const today = new Date();
                    const birthDate = new Date(date);
                    let age = today.getFullYear() - birthDate.getFullYear();
                    const monthDiff = today.getMonth() - birthDate.getMonth();

                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                      age--;
                    }

                    if (age < 18) {
                      Alert.alert('You must be at least 18 years old to connect a bank account.');
                      return;
                    }
                  } else if (step === 5) {
                    // Validate address fields
                    if (!street.trim()) {
                      Alert.alert('Please enter your street address.');
                      return;
                    }

                    if (!city.trim()) {
                      Alert.alert('Please enter your city.');
                      return;
                    }

                    if (!zipCode.trim()) {
                      Alert.alert('Please enter your zip code.');
                      return;
                    }

                    if (!state.trim()) {
                      Alert.alert('Please enter your state or province.');
                      return;
                    }
                  } else if (step === 6) {
                    // Validate ID images
                    if (!frontIdImage) {
                      Alert.alert('Please provide a front image of your ID.');
                      return;
                    }

                    if (!backIdImage) {
                      Alert.alert('Please provide a back image of your ID.');
                      return;
                    }
                  } else if (step === 7) {
                    // Validate bank account details
                    if (!iban) {
                      Alert.alert('Please enter your IBAN.');
                      return;
                    }

                    connectBank();
                  }

                  setStep(prev => prev + 1);
                }}
              />
            </View>
          </View>
        )}
      </View>
    </ThemedModal>
  );
};

export default ConnectBankModal;