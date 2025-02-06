declare module 'leaflet-control-geocoder' {
    import * as L from 'leaflet';
  
    export interface GeocoderOptions {
      defaultMarkGeocode?: boolean;
      geocoder?: any;
    }
  
    export class Geocoder extends L.Control {
      constructor(options?: GeocoderOptions);
      geocode(query: string, callback: (results: any[]) => void): void;
      on(event: string, callback: (event: any) => void): void;
    }
  
    export namespace geocoders {
      class Nominatim {
        constructor(options?: any);
      }
    }
  }