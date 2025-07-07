import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from '../themes/styles';

const FixedTopView = ({ style, children }) => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.fixedTop, { top: insets.top }, style]}>
      {children}
    </View>
  );
};

export default FixedTopView;