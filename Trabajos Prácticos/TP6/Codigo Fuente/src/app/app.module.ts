import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { GoogleMapsModule } from '@angular/google-maps';
import { AppComponent } from './app.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from "ngx-spinner";
import { SpinnerComponent } from './components/spinner/spinner.component';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
import { GmapComponent } from './components/gmap/gmap.component';
@NgModule({
  declarations: [
    AppComponent,
    SpinnerComponent,
    GmapComponent

  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    GoogleMapsModule,
    HttpClientModule,
    HttpClientJsonpModule

  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
