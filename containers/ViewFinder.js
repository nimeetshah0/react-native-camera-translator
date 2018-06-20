import React, { Component } from 'react';
import { Text, View, TouchableOpacity, Platform, Image, Alert } from 'react-native';
import { Camera, Permissions, AdMobBanner, ImageManipulator } from 'expo';
import Spinner from 'react-native-loading-spinner-overlay';
import axios from 'axios';
import { Constants } from '../Constants';

const adUnitId = Platform.OS == 'ios' ? Constants.IOS_AD_UNIT_ID : Constants.ANDROID_AD_UNIT_ID;

export default class ViewFinder extends Component {

    state = {
        hasCameraPermission: null,
        type: Camera.Constants.Type.back,
        showLoading: false,
        loadingText: null
    };

    async componentWillMount() {
        const {
            status
        } = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({
            hasCameraPermission: status === 'granted'
        });
    }

    _snap = async () => {
        this.setState({ showLoading: true, loadingText: 'Saving image...' });
        let photo = await this.camera.takePictureAsync({
            base64: true
        });
        this.setState({
            showLoading: true,
            loadingText: 'Optimizing image...'
        });
        const resizedImage = await ImageManipulator.manipulate(
            photo.uri, [{
                resize: {
                    width: 1024,
                    height: 768
                }
            }], {
                format: 'png',
                base64: true
            }
        )

        this.setState({
            showLoading: true,
            loadingText: 'Getting text from image...'
        });

        try {
            let response = await axios.post(
                'https://vision.googleapis.com/v1/images:annotate?key=' + Constants.GOOGLE_API_KEY, {
                    requests: [{
                        image: {
                            content: resizedImage.base64
                        },
                        features: [{
                            type: 'TEXT_DETECTION',
                            maxResults: 1
                        }]
                    }]
                }
            );
            console.log(response);
            if (response.data.responses[0].textAnnotations == undefined) {
                Alert.alert(
                    'Oops!',
                    'There is no text in image or it is not clear enough', [
                        {
                            text: 'OK',
                            onPress: () => console.log('OK Pressed')
                        }
                    ], {
                        cancelable: false
                    }
                )
                this.setState({ showLoading: false });
            } else {
                let textAnnotations = response.data.responses[0].textAnnotations[0],
                    textContent = textAnnotations.description,
                    detectedLanguage = textAnnotations.locale;
                console.log(textAnnotations);
                console.log(textContent);
                console.log(detectedLanguage);
                this.setState({ showLoading: false }, () => {
                    this.props.navigation.navigate('Translator', {
                        text: textContent,
                        detectedLocale: detectedLanguage
                    });
                });
            }
        } catch (error) {
            console.log(error);
            Alert.alert(
                'Oops!',
                'Something went wrong', [{
                    text: 'OK',
                    onPress: () => console.log('OK Pressed')
                }], {
                    cancelable: false
                }
            )
            this.setState({
                showLoading: false
            });
        }
    }

    _bannerError = () => {

    }

    render() {
        const { hasCameraPermission } = this.state;
        if (hasCameraPermission === null) {
            return <View />;
        } else if (hasCameraPermission === false) {
            return <Text>No access to camera</Text>;
        } else {
            console.log('Loading camera');
            return (
                <View style={{ flex: 1 }}>
                    <Spinner visible={this.state.showLoading} textStyle={{color: '#FFF'}} />
                    <Camera style={{ flex: 1 }} type={this.state.type} ref={ref => { this.camera = ref }}>
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: 'transparent',
                                flexDirection: 'row',
                                marginBottom: 20
                            }}>
                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    alignSelf: 'flex-end',
                                    alignItems: 'center'
                                }}
                                onPress={() => this._snap()}>
                                <Image 
                                    style={{height: 75, width: 75}}
                                    source={require('../assets/images/shutter.png')} />
                            </TouchableOpacity>
                        </View>
                        <AdMobBanner
                            bannerSize = "smartBannerPortrait"
                            adUnitID = {adUnitId} // Test ID, Replace with your-admob-unit-id
                            testDeviceID="EMULATOR"
                            onDidFailToReceiveAdWithError={this._bannerError} />
                    </Camera>
                </View>
            )
        }
    }
}