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
        fontFamily: 'Satoshi-Bold',
    },
    buttonContainer: {
        width: '80%',
        height: 65,
    },
    primaryButton: {
        flexDirection: 'row',
        gap: 5,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.buttonPrimary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        height: '100%',
        borderRadius: 99,
    },
    buttonTextPrimary: {
        color: Colors.textDark,
        fontSize: 21,
        fontFamily: 'Satoshi-Bold',
    },
    spinner: {
        transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }],
        color: "#000000"
    }
})