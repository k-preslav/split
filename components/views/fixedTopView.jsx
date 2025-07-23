import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getStyles } from '../themes/styles';

const FixedTopView = ({ style, children }) => {
  const insets = useSafeAreaInsets();
  const styles = getStyles();

  return (
    <View style={[styles.fixedTop, { top: insets.top }, style]}>
      {children}
    </View>
  );
};

export default FixedTopView;