<template>
  <div class="gisComponent" :style="style" id="cesiumContainer"></div>
</template>
<script>
import api from '@/api/base';
export default {
  data() {
    return {
      style: {},
      viewer: null
    };
  },
  mounted() {
    this.setScreen();
    window.addEventListener('resize', this.setScreen());
    this.$nextTick(() => {
      this.initMap();
    });
  },
  methods: {
    setScreen() {
      // 可视区域的尺
      let visibleWidth = window.innerWidth;
      let visibleHeight = window.innerHeight;
      this.style = {
        width: visibleWidth + 'px',
        height: visibleHeight + 'px'
      };
      // 手动配置的面板尺
      //   let manualWidth = 1920;
      //   let manualHeight = 1080;
      //   // 计算横向和纵向的缩放系数
      //   var widthPercentage = (1.0 * visibleWidth) / manualWidth;
      //   var heightPercentage = (1.0 * visibleHeight) / manualHeight;
      //   // 取得最小缩放系
      //   this.scale = Math.min(widthPercentage, heightPercentage);
    },
    initMap() {
      Cesium.Ion.defaultAccessToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkZDM2MTE2MS0xZGNjLTRiMzktYWU3ZS00NDIwNGE0NTJjYTEiLCJpZCI6NTM1NDQsImlhdCI6MTYxOTIzMTg3Mn0.BQTAdgSPIDl6JwVNdmPiWuKvBv5qxD4qyNDm2qMkvYE';
      this.viewer = new Cesium.Viewer('cesiumContainer', {
        geocoder: false,
        homeButton: false,
        sceneModePicker: '3D',
        scene3DOnly: true,
        baseLayerPicker: false,
        navigationHelpButton: false,
        selectionIndicator: false,
        animation: false,
        timeline: false,
        infoBox: false,
        imageryProvider: new Cesium.ArcGisMapServerImageryProvider({
          url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
          maximumLevel: 23
        })
      });
      this.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(103.823557, 36.058039, 6978702.439565099)
      });
      this.viewer.dataSources.add(
        Cesium.GeoJsonDataSource.load('./gis/data/china.json', {
          stroke: Cesium.Color.DARKSLATEBLUE,
          fill: new Cesium.Color(0, 0, 0, 0)
        })
      );
      this.gisClick();
      this.drawPoint();
    },
    async drawPoint() {
      let res = await api.get('./gis/data/china.json');
      if (res.status === 200) {
        let list = res.data.features;
        list.forEach((item, index) => {
          let location = item.properties.center;
          this.viewer.entities.add({
            id: `landmark${index}`,
            name: 'point-layer',
            position: Cesium.Cartesian3.fromDegrees(...location, 0),
            point: {
              color: Cesium.Color.WHITE,
              pixelSize: 5,
              outlineWidth: 2,
              outlineColor: Cesium.Color.RED
            },
            label: {
              show: true,
              text: item.properties.name,
              font: '14pt',
              fillColor: Cesium.Color.BLUE,
              pixelOffset: new Cesium.Cartesian2(0, -15)
            },
            option: {
              name: item.properties.name
            }
          });
        });
      }
    },
    gisClick() {
      let that = this;
      let scene = this.viewer.scene;
      let handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
      handler.setInputAction(function(event) {
        let pick = scene.pick(event.position);
        if (Cesium.defined(pick)) {
          var ellipsoid = scene.globe.ellipsoid;
          var height = ellipsoid.cartesianToCartographic(that.viewer.camera.position).height;
          // that.mapRotate();
          that.viewer.entities.add({
            id:'line',
            name:'线条',
            polyline:{
              positions: Cesium.Cartesian3.fromDegreesArray([103.823557, 36.058039,87.617733, 43.792818]),
              width: 2,
              material: Cesium.Color.RED,
              clampToGround:true,
            }
          })
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    mapRotate() {
      let that = this;
      var position = Cesium.Cartesian3.fromDegrees(103.823557, 36.058039, 600000);
      var pitch = Cesium.Math.toRadians(-90);
      var angle = 360 / 30;
      var distance = 50000;
      var startTime = Cesium.JulianDate.fromDate(new Date());
      that.viewer.clock.startTime = startTime.clone(); // 开始时间
      that.viewer.clock.currentTime = startTime.clone(); // 当前时间
      that.viewer.clock.clockRange = Cesium.ClockRange.CLAMPED; // 行为方式
      that.viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK; // 时钟设置为当前系统时间; 忽略所有其他设置。
      // 相机的当前heading
      var initialHeading = that.viewer.camera.heading;
      var Exection = function TimeExecution() {
        // 当前已经过去的时间，单位s
        var delTime = Cesium.JulianDate.secondsDifference(that.viewer.clock.currentTime, that.viewer.clock.startTime);
        var heading = Cesium.Math.toRadians(delTime * angle) + initialHeading;
        that.viewer.scene.camera.setView({
          destination: position, // 点的坐标
          orientation: {
            heading: heading,
            pitch: pitch,
            roll: 0.0
          }
        });
        that.viewer.scene.camera.moveBackward(distance);

        if (Cesium.JulianDate.compare(that.viewer.clock.currentTime, that.viewer.clock.stopTime) >= 0) {
          that.viewer.clock.onTick.removeEventListener(Exection);
        }
      };

      that.viewer.clock.onTick.addEventListener(Exection);
    }
  }
};
</script>
<style scoped>
.gisComponent {
  background: #004080;
}
</style>
