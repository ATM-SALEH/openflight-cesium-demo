/**
 * This class is an example of a custom DataSource.  It loads JSON data as
 * defined by Google's WebGL Globe, https://github.com/dataarts/webgl-globe.
 * @alias AirportDataSource
 * @constructor
 *
 * @param {String} [name] The name of this data source.  If undefined, a name
 *                        will be derived from the url.
 *
 * @example
 * var dataSource = new Cesium.AirportDataSource();
 * dataSource.loadUrl('sample.json');
 * viewer.dataSources.add(dataSource);
 */
var AirportDataSource = function(name) {

    this._name = name;
    this._changed = new Cesium.Event();
    this._error = new Cesium.Event();
    this._isLoading = false;
    this._loading = new Cesium.Event();
    this._entityCollection = new Cesium.EntityCollection();
    this._heightScale = 100;
};

Object.defineProperties(AirportDataSource.prototype, {

    /**
     * Gets a human-readable name for this instance.
     * @memberof AirportDataSource.prototype
     * @type {String}
     */
    name : {
        get : function() {
            return this._name;
        }
    },
    /**
     * Since WebGL Globe JSON is not time-dynamic, this property is always undefined.
     * @memberof AirportDataSource.prototype
     * @type {DataSourceClock}
     */
    clock : {
        value : undefined,
        writable : false
    },
    /**
     * Gets the collection of Entity instances.
     * @memberof AirportDataSource.prototype
     * @type {EntityCollection}
     */
    entities : {
        get : function() {
            return this._entityCollection;
        }
    },
    /**
     * Gets a value indicating if the data source is currently loading data.
     * @memberof AirportDataSource.prototype
     * @type {Boolean}
     */
    isLoading : {
        get : function() {
            return this._isLoading;
        }
    },
    /**
     * Gets an event that will be raised when the underlying data changes.
     * @memberof AirportDataSource.prototype
     * @type {Event}
     */
    changedEvent : {
        get : function() {
            return this._changed;
        }
    },
    /**
     * Gets an event that will be raised if an error is encountered during
     * processing.
     * @memberof AirportDataSource.prototype
     * @type {Event}
     */
    errorEvent : {
        get : function() {
            return this._error;
        }
    },
    /**
     * Gets an event that will be raised when the data source either starts or
     * stops loading.
     * @memberof AirportDataSource.prototype
     * @type {Event}
     */
    loadingEvent : {
        get : function() {
            return this._loading;
        }
    },

    /**
     * Gets or sets the scale factor applied to the height of each line.
     * @memberof AirportDataSource.prototype
     * @type {Number}
     */
    heightScale : {
        get : function() {
            return this._heightScale;
        },
        set : function(value) {
            if (value > 0) {
                throw new Cesium.DeveloperError('value must be greater than 0');
            }
            this._heightScale = value;
        }
    }
});

/**
 * Asynchronously loads the GeoJSON at the provided url, replacing any existing data.
 * @param {Object} url The url to be processed.
 * @returns {Promise} a promise that will resolve when the GeoJSON is loaded.
 */
AirportDataSource.prototype.loadUrl = function(url) {

    if (!Cesium.defined(url)) {
        throw new Cesium.DeveloperError('url is required.');
    }

    var name = Cesium.getFilenameFromUri(url);

    if (this._name !== name) {

        this._name = name;
        this._changed.raiseEvent(this);
    }

    var that = this;
    return Cesium.when(Cesium.loadJson(url), function(json) {
        return that.load(json, url);

    }).otherwise(function(error) {

        console.log(error);
        this._setLoading(false);
        that._error.raiseEvent(that, error);
        return Cesium.when.reject(error);

    });
};

/**
 * Loads the provided data, replacing any existing data.
 * @param {Object} data The object to be processed.
 */
AirportDataSource.prototype.load = function(data) {

    if (!Cesium.defined(data)) {
        throw new Cesium.DeveloperError('data is required.');
    }


    this._setLoading(true);

    var heightScale = this.heightScale;
    var entities = this._entityCollection;

    entities.suspendEvents();
    entities.removeAll();



    for (var i = 0; i < data.length; i++) {

        var airportData = data[i];

        var latitude = airportData.latitude;
        var longitude = airportData.longitude;
        var altitude = airportData.altitude;

        if(altitude === 0) {
            continue;
        }

        var pinBuilder = new Cesium.PinBuilder();

        entities.add({

            id : airportData.airport_id,
            name : airportData.name,
            position : Cesium.Cartesian3.fromDegrees(longitude, latitude),
            billboard : {
                image : pinBuilder.fromColor(Cesium.Color.CYAN, 16).toDataURL(),
                verticalOrigin : Cesium.VerticalOrigin.BOTTOM
            }
        });


    }

    entities.resumeEvents();
    this._changed.raiseEvent(this);
    this._setLoading(false);
};

AirportDataSource.prototype._setLoading = function(isLoading) {
    if (this._isLoading !== isLoading) {
        this._isLoading = isLoading;
        this._loading.raiseEvent(this, isLoading);
    }
};


