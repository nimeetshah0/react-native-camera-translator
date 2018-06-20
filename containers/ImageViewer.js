import React, { Component } from 'react';
import { View, Image, Button } from 'react-native';
import { ImageManipulator } from 'expo';
import axios from 'axios';
export default class ImageViewer extends Component {

    componentDidMount() {

    }

    _getTextFromImage = async () => {
        const imageUri = this.props.navigation.state.params.photo.uri;
        // Resize image to 1024x768 https://cloud.google.com/vision/docs/supported-files
        const resizedImage = await ImageManipulator.manipulate(
            imageUri,
            [{ resize: {
                width: 1024,
                height: 768
            }}],
            { format: 'png', base64: true }
        )
        console.log(resizedImage.base64);
        try {
            let response = await axios.post(
                'https://vision.googleapis.com/v1/images:annotate?key=AIzaSyAmTrKgAW5NU5uNkCeagigc--pEQ3fqDXA', {
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
            let textAnnotations = response.data.responses[0].textAnnotations[0],
                textContent = textAnnotations.description,
                detectedLanguage = textAnnotations.locale;
            console.log(textAnnotations);
            console.log(textContent);
            console.log(detectedLanguage);

            // Get supported translations
            let supportedLanguages = await axios.get('https://translation.googleapis.com/language/translate/v2/languages?target=' + detectedLanguage + '&key=AIzaSyAmTrKgAW5NU5uNkCeagigc--pEQ3fqDXA');
            console.log(supportedLanguages);
        } catch (error) {
            console.log(error);
        }

    }

    render() {
        const { navigation } = this.props;
        return (
            <View style={{flex: 1}}>
                <Image 
                    source={{uri: 'data:image/jpg;base64,' + this.props.navigation.state.params.photo.base64 }} 
                    style={{ flex: 1 }}/>
                <View>
                    <Button 
                        title='Get text'
                        onPress={this._getTextFromImage}
                    />
                </View>
            </View>
        )
    }
}