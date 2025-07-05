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
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ translateY: -100}],
        width: '100%',
        height: '100%',
    },
    horizontalView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    verticalView: {
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    bigText: {
        fontSize: 42,
        color: Colors.textLight,
        textAlign: 'center',
        fontFamily: 'Satoshi-Medium',
    },

    bigButton: {
        flexDirection: 'row',
        gap: 5,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        width: '83%',
        height: 65,
        borderRadius: 99,
    },
    buttonText: {
        fontSize: 21,
        fontFamily: 'Satoshi-Bold',
    },

    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 99,
    },

    inputField: {
        width: '65%',
        height: 50,
        borderWidth: 1,
        borderRadius: 99,
        borderColor: Colors.light,
        paddingHorizontal: 15,
        fontFamily: 'Satoshi-Regular',
        fontSize: 18,
        color: Colors.textLight,
        backgroundColor: Colors.backgroundSecondary,
    },

    spinner: {
        transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }],
        color: "black"
    },
})