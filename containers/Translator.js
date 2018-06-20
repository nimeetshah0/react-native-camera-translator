import React, { Component } from 'react';
import { View, Text, Picker, TouchableOpacity, Image, Modal, FlatList, Platform } from 'react-native';
import axios from 'axios';
import _ from 'lodash';
import {
    Card,
    CardTitle,
    CardContent
} from 'react-native-material-cards';
import Spinner from 'react-native-loading-spinner-overlay';
import { DangerZone, AdMobBanner, SecureStore, StoreReview } from 'expo';
const { Localization } = DangerZone;

import { Constants } from '../Constants';

const adUnitId = Platform.OS == 'ios' ? Constants.IOS_AD_UNIT_ID : Constants.ANDROID_AD_UNIT_ID;

export default class Translator extends Component {

    state = {
        supportedLanguages: null,
        currentLocale: null,
        modalVisible: false,
        showLoading: false
    }

    async componentDidMount() {
        const detectedLocale = this.props.navigation.state.params.detectedLocale;
        let currentLocale = await Localization.getCurrentLocaleAsync();
        currentLocale = currentLocale.split('_')[0];
        // Get list of supported translations in the phone's language
        let supportedLanguages = await axios.get('https://translation.googleapis.com/language/translate/v2/languages', {
            params: {
                target: currentLocale,
                key: Constants.GOOGLE_API_KEY
            }
        });
        console.log('Got supported languages');
        this.setState({
            currentLocale: currentLocale, 
            supportedLanguages: supportedLanguages.data.data.languages
        }, () => {
            // Translate in current locale by default
            this._translate();
        });
    }

    _changeCurrentLocale = (item) => {
        this.setState({ 
            currentLocale: item.language,
            modalVisible: false
        }, () => {
            this._translate();
        });
    }

    _renderSupportedLanguages = (lang) => {
        if (!lang) {
            return null;
        }
        return (
            <View style={{
                padding: 10,
                flex: 1
            }}>
                <TouchableOpacity
                    style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}
                    onPress={() => this._changeCurrentLocale(lang.item)}>
                    <Text style={{
                        fontSize: 20,
                        flex: 1
                    }}>{lang.item.name}</Text>
                    { lang.item.language == this.state.currentLocale ? 
                        <Image 
                            source={require('../assets/images/check.png')}
                            style={{width: 20, height: 20}} />
                        : null }
                </TouchableOpacity>
            </View>
        )
    }

    renderSeparator = () => {
        return (
            <View
                style={{
                    height: 1,
                    backgroundColor: "#CED0CE"
                }}
            />
        );
    };


    _translate = async () => {
        // this.setState({ showLoading: true });
        if (this.props.navigation.state.params.detectedLocale == this.state.currentLocale) {
            this.setState({
                translatedText: this.props.navigation.state.params.text
            });
        } else {
            try {
                let response = await axios.get('https://www.googleapis.com/language/translate/v2', {
                    params: {
                        key: Constants.GOOGLE_API_KEY,
                        q: this.props.navigation.state.params.text,
                        source: this.props.navigation.state.params.detectedLocale,
                        target: this.state.currentLocale,
                        format: 'text'
                    }
                });
                this.setState({
                    translatedText: response.data.data.translations[0].translatedText
                });

                // Update store to record successful translate
                let numberOfTranslates = await SecureStore.getItemAsync('numberOfTranslates');
                numberOfTranslates = parseInt(numberOfTranslates) + 1;
                await SecureStore.setItemAsync('numberOfTranslates', numberOfTranslates.toString());

            } catch (err) {
                console.log(err);
            }
        }
        // console.log('Removing spinner');
        this.setState({ showLoading: false });
    }


    render() {

        const text = this.props.navigation.state.params.text;

        // Get the language of the detected locale in the current locale
        let x = _.find(this.state.supportedLanguages, (o) => {
            return o.language == this.props.navigation.state.params.detectedLocale;
        });
        
        const detectedLanguage = x ? x.name : null;
        
        // Find the language in the current locale
        x = _.find(this.state.supportedLanguages, (o) => {
            return o.language == this.state.currentLocale;
        });

        const currentLanguage = x ? x.name : null;

        return (
            <View style={{flex: 1}}>
                <Spinner visible={this.state.showLoading} textStyle={{color: '#FFF'}} />
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                    <Card>
                        <CardTitle 
                            title={detectedLanguage} 
                        />
                        <CardContent text={text} />
                    </Card>
                    <Card>
                        <CardTitle 
                            title={currentLanguage} 
                        />
                        <CardContent text={this.state.translatedText} />
                    </Card>
                    <TouchableOpacity 
                        style={{marginBottom: 40, marginTop: 10}}
                        onPress={() => this.setState({ modalVisible: true })}>
                        <Image 
                            style={{height: 75, width: 75}}
                            source={require('../assets/images/language.png')} />
                    </TouchableOpacity>
                </View>
                <Modal
                    animationType="slide"
                    transparent={false}
                    onRequestClose={() => this.setState({ modalVisible: false })}
                    visible={this.state.modalVisible}>
                    <View style={{flex: 1, marginTop: 60}}>
                        <FlatList
                            keyExtractor={(item) => item.language}
                            ItemSeparatorComponent={this.renderSeparator}
                            data={this.state.supportedLanguages}
                            renderItem={(item) => this._renderSupportedLanguages(item)}
                        />
                    </View>
                </Modal>
                <AdMobBanner
                    bannerSize = "smartBannerPortrait"
                    adUnitID = {adUnitId} // Test ID, Replace with your-admob-unit-id
                    testDeviceID="EMULATOR" />
            </View>
        )
    }
}