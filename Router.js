import {
    createBottomTabNavigator,
    createStackNavigator
} from 'react-navigation';

import ViewFinder from './containers/ViewFinder';
import Translator from './containers/Translator';

const Stack = createStackNavigator({
    ViewFinder: {
        screen: ViewFinder,
        navigationOptions: {
            title: 'Orca Translator',
            headerStyle: {
                backgroundColor: '#0984e3'
            },
            headerTintColor: '#fff'
        }
    },
    Translator: {
        screen: Translator,
        navigationOptions: {
            headerStyle: {
                backgroundColor: '#0984e3'
            },
            headerTintColor: '#fff'
        }
    }
}, {
    initialRouteName: 'ViewFinder'
});

export {
    Stack
}