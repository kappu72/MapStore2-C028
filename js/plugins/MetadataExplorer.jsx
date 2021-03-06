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
const assign = require('object-assign');
const {createSelector} = require("reselect");
const {Glyphicon, Panel} = require('react-bootstrap');
const ContainerDimensions = require('react-container-dimensions').default;
const Dock = require('react-dock').default;

const {addService, deleteService, textSearch, changeCatalogFormat, changeCatalogMode,
    changeUrl, changeTitle, changeAutoload, changeType, changeSelectedService,
    addLayer, addLayerError, resetCatalog, focusServicesList} = require("../../MapStore2/web/client/actions/catalog");
const {zoomToExtent} = require("../../MapStore2/web/client/actions/map");
const {currentLocaleSelector} = require("../../MapStore2/web/client/selectors/locale");
const {newCatalogServiceAdded, deleteCatalogServiceEpic, closeFeatureGridEpic} = require("../../MapStore2/web/client/epics/catalog");
const {setControlProperty, toggleControl} = require("../../MapStore2/web/client/actions/controls");
const {resultSelector, serviceListOpenSelector, newServiceSelector,
    newServiceTypeSelector, selectedServiceTypeSelector, searchOptionsSelector,
    servicesSelector, formatsSelector, loadingErrorSelector, selectedServiceSelector,
    modeSelector, layerErrorSelector, activeSelector, savingSelector
} = require("../../MapStore2/web/client/selectors/catalog");
const Message = require("../../MapStore2/web/client/components/I18N/Message");
require('../../MapStore2/web/client/plugins/metadataexplorer/css/style.css');

const CatalogUtils = require('../../MapStore2/web/client/utils/CatalogUtils');

const catalogSelector = createSelector([
    (state) => resultSelector(state),
    (state) => savingSelector(state),
    (state) => serviceListOpenSelector(state),
    (state) => newServiceSelector(state),
    (state) => newServiceTypeSelector(state),
    (state) => selectedServiceTypeSelector(state),
    (state) => searchOptionsSelector(state),
    (state) => currentLocaleSelector(state)
], (result, saving, openCatalogServiceList, newService, newformat, selectedFormat, options, currentLocale) =>({
    saving,
    openCatalogServiceList,
    format: newformat,
    newService,
    currentLocale,
    records: CatalogUtils.getCatalogRecords(selectedFormat, result, options)
}));

const catalogClose = () => {
    return (dispatch) => {
        dispatch(setControlProperty('metadataexplorer', "enabled", false));
        dispatch(changeCatalogMode("view"));
        dispatch(resetCatalog());
    };
};


const Catalog = connect(catalogSelector, {
    // add layer action to pass to the layers
    onZoomToExtent: zoomToExtent,
    onFocusServicesList: focusServicesList
})(require('../../MapStore2/web/client/components/catalog/Catalog'));

// const Dialog = require('../components/misc/Dialog');

// custom record item
const RecordItem = require('../components/RecordItem');

class MetadataExplorerComponent extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        active: PropTypes.bool,
        searchOnStartup: PropTypes.bool,
        formats: PropTypes.array,
        wrap: PropTypes.bool,
        wrapWithPanel: PropTypes.bool,
        panelStyle: PropTypes.object,
        panelClassName: PropTypes.string,
        toggleControl: PropTypes.func,
        closeGlyph: PropTypes.string,
        buttonStyle: PropTypes.object,
        services: PropTypes.object,
        selectedService: PropTypes.string,
        style: PropTypes.object,
        dockProps: PropTypes.object,
        zoomToLayer: PropTypes.bool,

        // side panel properties
        width: PropTypes.number
    };

    static defaultProps = {
        id: "mapstore-metadata-explorer",
        active: false,
        wrap: false,
        modal: true,
        wrapWithPanel: false,
        panelStyle: {
            zIndex: 100,
            overflow: "hidden",
            height: "100%"
        },
        panelClassName: "catalog-panel",
        toggleControl: () => {},
        closeGlyph: "1-close",
        zoomToLayer: true,

        // side panel properties
        width: 660,
        dockProps: {
            dimMode: "none",
            size: 0.30,
            fluid: true,
            position: "right",
            zIndex: 1030
        }
    };

    render() {
        const panel = <Catalog recordItem={RecordItem} zoomToLayer={this.props.zoomToLayer} searchOnStartup={this.props.searchOnStartup} active={this.props.active} {...this.props}/>;
        const panelHeader = (<span><Glyphicon glyph="folder-open"/> <span className="metadataexplorer-panel-title"><Message msgId="catalog.title"/></span><span className="shapefile-panel-close panel-close" onClick={ toggleControl.bind(null, 'styler', null)}></span><button onClick={this.props.toggleControl} className="catalog-close close">{this.props.closeGlyph ? <Glyphicon glyph={this.props.closeGlyph} /> : <span>×</span>}</button></span>);
        return this.props.active ? (
            <ContainerDimensions>
            { ({ width }) =>
                <Dock {...this.props.dockProps} isVisible={this.props.active} size={this.props.width / width > 1 ? 1 : this.props.width / width} >
                    <Panel id={this.props.id} header={panelHeader}
                        style={this.props.panelStyle} className={this.props.panelClassName}>
                            {panel}
                        </Panel>
                </Dock>}
            </ContainerDimensions>
        ) : null;
    }
}

const MetadataExplorerPlugin = connect((state) => ({
    searchOptions: searchOptionsSelector(state),
    formats: formatsSelector(state),
    result: resultSelector(state),
    loadingError: loadingErrorSelector(state),
    selectedService: selectedServiceSelector(state),
    mode: modeSelector(state),
    services: servicesSelector(state),
    layerError: layerErrorSelector(state),
    active: activeSelector(state)
}), {
    onSearch: textSearch,
    onLayerAdd: addLayer,
    toggleControl: catalogClose,
    onChangeFormat: changeCatalogFormat,
    onChangeUrl: changeUrl,
    onChangeType: changeType,
    onChangeTitle: changeTitle,
    onChangeAutoload: changeAutoload,
    onChangeSelectedService: changeSelectedService,
    onChangeCatalogMode: changeCatalogMode,
    onAddService: addService,
    onDeleteService: deleteService,
    onError: addLayerError
})(MetadataExplorerComponent);

module.exports = {
    MetadataExplorerPlugin: assign(MetadataExplorerPlugin, {
        Toolbar: {
            name: 'metadataexplorer',
            position: 10,
            exclusive: true,
            panel: true,
            tooltip: "catalog.tooltip",
            wrap: true,
            title: 'catalog.title',
            help: <Message msgId="helptexts.metadataexplorer"/>,
            icon: <Glyphicon glyph="folder-open" />,
            priority: 1
        },
        BurgerMenu: {
            name: 'metadataexplorer',
            position: 5,
            text: <Message msgId="catalog.title"/>,
            icon: <Glyphicon glyph="folder-open"/>,
            action: setControlProperty.bind(null, "metadataexplorer", "enabled", true, true),
            priority: 2,
            doNotHide: true
        }
    }),
    reducers: {catalog: require('../../MapStore2/web/client/reducers/catalog')},
    epics: {newCatalogServiceAdded, deleteCatalogServiceEpic, closeFeatureGridEpic}
};
