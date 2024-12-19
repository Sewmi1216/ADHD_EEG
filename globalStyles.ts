import { StyleSheet } from 'react-native';
import UserProfile from './src/components/UserProfile';

const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
      },

      innerContainer: {
        flex: 1,
        backgroundColor: '#fff',
        marginTop: "15%",
        marginHorizontal: "5%"
      },

      topContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
      },

      topContainerTitle: {
        fontSize: 24,
        color: 'black', 
        fontFamily: 'poppins-extrabold'
      },

      middleContainer: {
        marginTop: '5%',
        flexDirection: 'column',
      },

      middleContainerTitle: {
        fontSize: 22,
        color: 'black', 
        fontFamily: 'poppins-bold'
      },

      innerMiddleTitle: {
        fontSize: 20,
        color: 'black', 
        fontFamily: 'poppins-semibold',
        paddingTop: '5%'
      },

      innerMiddleWrapper: {
        paddingTop: '3%',
        flexDirection: 'row',
      },

      topprofile: {
        height: 80,
        width: 80,
        backgroundColor: '#f4f3f4',
        borderRadius: 40,
        overflow: 'hidden',
      },

      topprofileImage: {
        height: '100%',
        width: '100%',
        resizeMode: 'cover',
      },

      bottomContainer: {
        flexDirection: 'column',
        flex: 1,
      },

      innerBottomWrapper: {
        paddingTop: '3%',
        flexDirection: 'column',
        flex: 1,
      },

      userProfile: {
        height: 70,
        backgroundColor: '#f4f3f4',
        borderRadius: 35,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
      },

      userPictureContainer: {
        height: 70,
        width: 70,
      },

      userprofileImage: {
        height: '100%',
        width: '100%',
        borderRadius: 35,
        resizeMode: 'cover',
      },

      userName: {
        fontSize: 18,
        color: 'black', 
        fontFamily: 'poppins-regular',
        paddingLeft: 20
      }
});

export default globalStyles;
