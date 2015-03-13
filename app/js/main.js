/**
 * Created by root on 3/13/15.
 */

var dataSource = new AirportDataSource();
dataSource.loadUrl('app/data/airports.json');

//Create a Viewer instances and add the DataSource.
var viewer = new Cesium.Viewer('cesiumContainer', {
    animation : false,
    timeline : false
});
viewer.clock.shouldAnimate = false;
viewer.dataSources.add(dataSource);

viewer.camera.flyTo({
    destination : Cesium.Cartesian3.fromDegrees(-117.16, 32.71, 100000.0)
});
