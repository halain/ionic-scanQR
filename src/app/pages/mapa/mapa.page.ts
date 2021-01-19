import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

//como esta importado el mapbox en el index le agrego este nombre para evitar error en el metodo donde es llamado
declare var mapboxgl:any;

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
})
export class MapaPage implements OnInit, AfterViewInit {

  lat: number;
  lng: number;

  constructor(private route: ActivatedRoute) { }
 

  ngOnInit() {
    console.log('init');
    let geo: any = this.route.snapshot.paramMap.get('geo');
    geo = geo.substring(4);
    geo = geo.split(','); //geo[0]=> lat geo[1]=>long
    this.lat = Number(geo[0]);
    this.lng = Number(geo[1]);
      
  }

  //se dispara despues de inicializado el componente, despues del noOnInit
  ngAfterViewInit() {
    console.log('cargar mapa, ', this.lat, this.lng);
    
    mapboxgl.accessToken = 'pk.eyJ1IjoiaGFsYWluIiwiYSI6ImNrazJzdjRyMDBlMzAycW51Z3EwMTZ3b2cifQ.nPW_24WhPbFBhNsZDut91Q';
    const map = new mapboxgl.Map({
      style: 'mapbox://styles/mapbox/light-v10',
      center: [this.lng, this.lat],
      zoom: 15.5,
      pitch: 45,
      bearing: -17.6,
      container: 'map',
      antialias: true
    });

    // The 'building' layer in the mapbox-streets vector source contains building-height
    // data from OpenStreetMap.
    map.on("load", () => {

      //para qeu el mapa coja las dimensiones del css
      map.resize();

      //marcador
      const marker = new mapboxgl.Marker()
        .setLngLat([this.lng, this.lat])
        .addTo(map);

      // Insert the layer beneath any symbol layer.
      const layers = map.getStyle().layers;

      let labelLayerId;
      for (let i = 0; i < layers.length; i++) {
        if (layers[i].type === "symbol" && layers[i].layout["text-field"]) {
          labelLayerId = layers[i].id;
          break;
        }
      }

      map.addLayer(
        {
          id: '3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 15,
          paint: {
            'fill-extrusion-color': '#aaa',

            // use an 'interpolate' expression to add a smooth transition effect to the
            // buildings as the user zooms in
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'height'],
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'min_height'],
            ],
            'fill-extrusion-opacity': 0.6,
          },
        },
        labelLayerId
      );
    });
  }

}
