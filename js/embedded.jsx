/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');
const {connect} = require('react-redux');
const LocaleUtils = require('../MapStore2/web/client/utils/LocaleUtils');
const {registerSearchServiceEpic} = require('./epics/search');
const {registerCustomLayersUtilsEpic} = require('./epics/layers');
const {addLayersStyleLocalization, checkEmptyAvailableStyles} = require('./epics/locale');
const startApp = () => {
    const StandardApp = require('../MapStore2/web/client/components/app/StandardApp');
    const {loadVersion} = require('../MapStore2/web/client/actions/version');
    const {pages, pluginsDef, initialState, storeOpts} = require('../MapStore2/web/client/product/appConfigEmbedded');

    const StandardRouter = connect((state) => ({
        locale: state.locale || {},
        pages,
        version: state.version && state.version.current
    }))(require('../MapStore2/web/client/components/app/StandardRouter'));

    const appStore = require('../MapStore2/web/client/stores/StandardStore').bind(null, initialState, {
        mode: (state = 'embedded') => state,
        version: require('../MapStore2/web/client/reducers/version')
    }, {registerSearchServiceEpic, registerCustomLayersUtilsEpic, addLayersStyleLocalization, checkEmptyAvailableStyles});

    const appConfig = {
        storeOpts,
        appStore,
        pluginsDef,
        initialActions: [loadVersion],
        appComponent: StandardRouter,
        printingEnabled: true
    };

    ReactDOM.render(
        <StandardApp {...appConfig} mode="embedded"/>,
        document.getElementById('container')
    );
};

if (!global.Intl ) {
    // Ensure Intl is loaded, then call the given callback
    LocaleUtils.ensureIntl(startApp);
} else {
    startApp();
}
