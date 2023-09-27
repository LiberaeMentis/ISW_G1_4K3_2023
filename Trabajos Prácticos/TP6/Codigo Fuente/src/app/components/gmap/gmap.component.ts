import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MapGeocoder } from '@angular/google-maps';
import { MapDirectionsService } from '@angular/google-maps';
@Component({
  selector: 'app-gmap',
  templateUrl: './gmap.component.html',
  styleUrls: ['./gmap.component.scss']
})
export class GmapComponent implements OnChanges {
  @Input() ciudad: string = 'Villa Carlos Paz';
  @Input() calle: string = '';
  @Input() numero: string = '';
  @Input() desde: google.maps.LatLngLiteral | undefined;
  @Input() hasta: google.maps.LatLngLiteral | undefined;
  @Output() adress_component = new EventEmitter<google.maps.GeocoderAddressComponent[]>();
  @Output() ruta = new EventEmitter<number>();
  @Output() coordenadas = new EventEmitter<google.maps.LatLngLiteral>();
  @Output() existe = new EventEmitter<boolean>();
  apiLoaded: Observable<boolean>;
  markerOptions: google.maps.MarkerOptions = { draggable: false };
  markerPosition: google.maps.LatLngLiteral | undefined;
  zoom = 16;
  geocoder: MapGeocoder;
  center: google.maps.LatLngLiteral = { lat: -31.4252716, lng: -64.4972074 };
  mapDirectionsService: MapDirectionsService;
  addMarker(event: google.maps.MapMouseEvent) {
    this.markerPosition = event.latLng!.toJSON();

    this.coordenadas.emit(this.markerPosition);
    this.center = event.latLng!.toJSON();
    this.MostrarCalle(event.latLng!.toJSON());
  }
  constructor(httpClient: HttpClient, geocoder: MapGeocoder, mapDirectionsService: MapDirectionsService) {
    this.mapDirectionsService = mapDirectionsService;
    this.apiLoaded = httpClient.jsonp('https://maps.googleapis.com/maps/api/js?key=YOUR_KEY_HERE', 'callback').pipe(
      map(() => true),
      catchError(() => of(false)),
    );
    this.geocoder = geocoder;
  }
  ObtenerCoordenadas(): google.maps.LatLngLiteral {
    this.geocoder.geocode({
      address: this.numero + " " + this.calle + " , " + this.ciudad + ' , AR'
    }).subscribe(({ results }) => {
      this.markerPosition = results[0].geometry.location.toJSON();
    });
    return this.markerPosition!;

  }
  MostrarCalle(latLng: google.maps.LatLngLiteral) {

    this.geocoder.geocode({
      location: latLng
    }).subscribe(({ results }) => {
      console.log(results[0].address_components);
      this.adress_component.emit(results[0].address_components);
      console.log("estoy en mostrar calle")
      if (this.desde || this.hasta) {
        console.log("estoy en mostrar calle y en desde")
        this.CalcularValor();
      }



    }
    );
  }

  CalcularValor() {
    console.log("estoy en calcular valor")
    console.log(this.desde);
    console.log(this.markerPosition);
    let request;
    if (this.desde) {
      request = {
        destination: this.desde!,
        origin: this.markerPosition!,
        travelMode: google.maps.TravelMode.DRIVING
      };
    }
    else {
       request = {
        destination: this.markerPosition!,
        origin: this.hasta!,
        travelMode: google.maps.TravelMode.DRIVING
      };
    }
    console.log(request);
    this.mapDirectionsService.route(request).subscribe((results) => {
      console.log("estoy en la query");
      console.log(results);

      this.ruta.emit(results.result?.routes[0]?.legs[0]?.distance?.value);
    }
    );
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['ciudad'] || changes['calle'] || changes['numero']) {
      this.geocoder.geocode({
        address: `${this.numero} ${this.calle}, ${this.ciudad}, AR`
      }).subscribe(({ results }) => {
        console.log(results);
        let i = this.ValidarExistencia(results);
        this.markerPosition = results[i].geometry.location.toJSON();
        this.coordenadas.emit(this.markerPosition);
        if (this.desde || this.hasta) {
          this.CalcularValor();
        }
        this.center = results[i].geometry.location.toJSON();
      })

        ;
    }
  }

  ValidarExistencia(results: google.maps.GeocoderResult[]): number {
    let calleExiste = false;
    let numeroExiste = false;
    let ciudadExiste = false;
    let i = 0;
    let j = 0;
    if (results.length == 0) {
      console.log("no existe")
      this.existe.emit(false);
    }
    else {
      console.log("algo")
      console.log(results);
      results.forEach((result) => {

        if (!calleExiste || !numeroExiste || !ciudadExiste) {
          calleExiste = false;
          numeroExiste = false;
          ciudadExiste = false;
          result.address_components.forEach(element => {
            console.log("estoy en el foreach");
            console.log(element);
            if (element.long_name == this.numero) {
              numeroExiste = true;
            }
            if (element.long_name.toLowerCase() == this.calle.toLowerCase()) {
              calleExiste = true;
            }
            if (element.long_name == this.ciudad) {
              ciudadExiste = true;
            }
          });
        }
        if (calleExiste && numeroExiste && ciudadExiste) {
          j = i;
        }
        i++;
      })
    }
    if (calleExiste && numeroExiste && ciudadExiste) {
      console.log("existe");
      this.existe.emit(true);
      return j;
    } else {
      console.log("no existe")
      this.existe.emit(false);
      return 0;
    }

  }
}
