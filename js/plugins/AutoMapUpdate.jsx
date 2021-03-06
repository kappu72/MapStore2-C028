/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const PropTypes = require('prop-types');
const {connect} = require('react-redux');
const {manageAutoMapUpdate} = require('../../MapStore2/web/client/epics/automapupdate');
const {autoMapUpdateSelector} = require('../../MapStore2/web/client/selectors/automapupdate');
const {setControlProperty} = require('../../MapStore2/web/client/actions/controls');
const {updateMapEpic} = require('../epics/layers');

const OverlayProgressBar = require('../../MapStore2/web/client/components/misc/progressbars/OverlayProgressBar/OverlayProgressBar');

/**
  * AutoMapUpdate Plugin. It sends a notification to update old maps (version < 2)
  * @class AutoMapUpdate
  * @memberof plugins
  * @static
  */

class AutoMapUpdate extends React.Component {
    static propTypes = {
        options: PropTypes.array,
        loading: PropTypes.bool,
        count: PropTypes.number,
        length: PropTypes.number,
        label: PropTypes.string,
        unit: PropTypes.string,
        onUpdateOptions: PropTypes.func
    };

    static defaultProps = {
        loading: false,
        count: 0,
        length: 0,
        label: 'autorefresh.updating',
        unit: 'autorefresh.layers',
        options: {
            bbox: true,
            search: true,
            dimensions: true,
            title: false
        },
        onUpdateOptions: () => {}
    };

    componentWillMount() {
        this.props.onUpdateOptions(this.props.options);
    }

    render() {
        return (
            <OverlayProgressBar
                loading={this.props.loading}
                count={this.props.count}
                length={this.props.length}
                label={this.props.label}
                unit={this.props.unit}
                spinner={'circle'}/>
        );
    }
}

const AutoMapUpdatePlugin = connect(autoMapUpdateSelector, {
    onUpdateOptions: setControlProperty.bind(null, 'mapUpdate', 'options')
})(AutoMapUpdate);

module.exports = {
    AutoMapUpdatePlugin,
    reducers: {},
    epics: {manageAutoMapUpdate, updateMapEpic}
};
