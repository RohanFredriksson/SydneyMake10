import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import TextRecognition from 'react-native-text-recognition';
import { compute } from '../modules/compute'

const CameraScreen = ({navigation}) => {

  const camera = useRef(null);
  const devices = useCameraDevices('wide-angle-camera');
  const device = devices.back;

  const [permission, setPermission] = useState("not-determined");
  const getStatus = async() => {

    // Get the camera permission status.
    const p = await Camera.requestCameraPermission();
    setPermission(p);

  }

  useEffect(() => {
    getStatus();
  }, []);

  const takePhoto = async () => {
    
    // Take a photo and perform OCR on it.
    const photo = await camera.current.takePhoto();
    const text = "" + (await TextRecognition.recognize(photo.path));

    // Determine if there is a 4 digit code in the photo.
    var code = null;
    for (i = 0; i < text.length; i++) {

      const current = text.substring(i, i+4).replace(/[^0-9]/g, '');
      if (current.length == 4) {
        code = current;
        break;
      }

    }
    
    if (code == null) {return;}

    // Find the answer if it exists.
    const answer = compute(code, 10);
    navigation.navigate('Answer', {answer: answer});

  }

  const renderCamera = () => {

    // Show a loading screen, whilst we prompt the user for camera permission.
    if (permission !== "authorized" || device == null) {
      return (<View/>);
    }

    return (
      <Camera style={styles.camera} device={device} ref={camera} isActive={true} photo={true} enableZoomGesture={true}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={takePhoto}>
            <Text style={styles.text}>Take Photo</Text>
          </TouchableOpacity>
        </View>
      </Camera>
    )

  }

  return (
    <View style={styles.container}>
      {renderCamera()}
    </View>
  )

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});

export {CameraScreen};