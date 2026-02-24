import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const TAB_BAR_HEIGHT = 60;

export const useTabBarPadding = () => {
    const insets = useSafeAreaInsets();
    return TAB_BAR_HEIGHT + insets.bottom;
};
