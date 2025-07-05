import { StyleSheet } from "react-native";
import { Colors } from "./colors";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    containerShiftUp: {
        flex: 1,
        //backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ translateY: -100}],
        width: '100%',
        height: '100%',
    },

    bigText: {
        fontSize: 42,
        color: Colors.textLight,
        textAlign: 'center',
        fontFamily: 'Satoshi-Medium',
    },

    primaryButton: {
        flexDirection: 'row',
        gap: 5,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.buttonPrimary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        width: '83%',
        height: 65,
        borderRadius: 99,
    },
    buttonTextPrimary: {
        color: Colors.textDark,
        fontSize: 21,
        fontFamily: 'Satoshi-Bold',
    },

    secondaryButton: {
        flexDirection: 'row',
        gap: 5,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.buttonSecondary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        width: '83%',
        height: 65,
        borderRadius: 99,
    },
    buttonTextSecondary: {
        color: Colors.textLight,
        fontSize: 21,
        fontFamily: 'Satoshi-Bold',
    },

    spinner: {
        transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }],
        color: "black"
    },
})