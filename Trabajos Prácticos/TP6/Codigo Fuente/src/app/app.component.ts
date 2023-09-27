import { AfterViewInit, Component, ElementRef, HostListener } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

import { MapDirectionsService } from '@angular/google-maps';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'FrontEnd';
  salidaIzquierda = false;
  salidaDerecha = false;
  entradaIzquierda = false;
  entradaDerecha = false;
  vistaActual = 0;
  metodoPago = "Efectivo";
  imagenSubida = new Array<string>();
  submited = false;
  flipped = false;
  footer = false;
  loading = false;
  hastaCompletado = 0;
  coordenadasHasta: google.maps.LatLngLiteral | undefined;
  coordenadasDesde: google.maps.LatLngLiteral | undefined;
  precio = 0;
  distancia = 0;
  existeRutaLocal = true;
  existeRutaEntrega = true;
  pedidoForm!: FormGroup;
  localForm!: FormGroup;
  lugarEntregaForm!: FormGroup;
  tarjetaForm!: FormGroup;
  efectivoForm!: FormGroup;
  constructor() {
    this.SetearForms();
    this.lugarEntregaForm.controls["ciudad"].disable();
  }
  ExisteRutaLocal(existe: boolean) {
    console.log("existe ruta local estoy en esa funcion");
    console.log(existe);
    this.existeRutaLocal = existe;
  }
  ExisteRutaEntrega(existe: boolean) {
    this.existeRutaEntrega = existe;
  }
  AsignarCoordenadas(coordenadas: google.maps.LatLngLiteral) {
    this.coordenadasDesde = coordenadas;
  }
  AsignarCoordenadasHasta(coordenadas: google.maps.LatLngLiteral) {
    this.coordenadasHasta = coordenadas;
  }
  CalcularPrecioPorRuta(distancia: number) {
    console.log("distancia");
    this.precio = distancia / 100 * 50;
    this.distancia = distancia;
  }
  CallesDistintas() {
    if (this.localForm.controls["calle"].value! != this.lugarEntregaForm.controls["calle"].value!) {
      return true;
    }
    if (this.localForm.controls["numero"].value! != this.lugarEntregaForm.controls["numero"].value!) {
      return true;
    }
    return false;
  }
  HastaCompletado() {
    let hastaCompletado = 0;
    if (this.pedidoForm.invalid && this.hastaCompletado >= 1) {
      hastaCompletado = 1;
    }
    else if ((this.localForm.invalid || !this.existeRutaLocal) && this.hastaCompletado >= 2) {
      hastaCompletado = 2;
    }
    else if ((this.lugarEntregaForm.invalid || !this.existeRutaEntrega || !this.CallesDistintas()) && this.hastaCompletado >= 3) {
      hastaCompletado = 3;
    } else if (((this.metodoPago == "Tarjeta" && this.tarjetaForm.invalid) || (this.metodoPago == "Efectivo" && (this.efectivoForm.invalid || !this.isPrecioCorrecto(this.efectivoForm.controls["monto"].value)))) && this.hastaCompletado >= 5) {
      hastaCompletado = 5;
    }
    else if (((this.metodoPago == "Tarjeta" && this.tarjetaForm.invalid) || (this.metodoPago == "Efectivo" && this.efectivoForm.invalid)) && this.hastaCompletado >= 4) {
      hastaCompletado = 4;
    }
    else if (this.hastaCompletado > this.vistaActual) {
      hastaCompletado = this.hastaCompletado;
    }
    else {
      hastaCompletado = this.vistaActual;
    }
    return hastaCompletado;
  }

  ConseguirFechaActual() {
    var fecha = new Date();
    var dia = fecha.getDate();
    let diaString = dia.toString();
    var mes = fecha.getMonth() + 1;
    let mesString = mes.toString();
    var anio = fecha.getFullYear();
    if (dia < 10) {
      diaString = "0" + diaString;

    }
    if (mes < 10) {
      mesString = "0" + mesString;
    }
    let fe = anio + "-" + mesString + "-" + diaString;
    return fe;
  }
  ValidarMayorFechaActual(fecha: string) {
    let fechaActual = new Date();
    let fechaDate = new Date(fecha);
    //aumentar el día del mes en 1
    fechaDate.setDate(fechaDate.getDate() + 1);
    if (fechaDate.getFullYear() > fechaActual.getFullYear()) {
      return true;
    }
    if (fechaDate.getFullYear() == fechaActual.getFullYear() && fechaDate.getMonth() > fechaActual.getMonth()) {
      return true;
    }
    if (fechaDate.getFullYear() == fechaActual.getFullYear() && fechaDate.getMonth() == fechaActual.getMonth() && fechaDate.getDate() > fechaActual.getDate()) {
      return true;
    }
    if (fechaDate.getMonth() == fechaActual.getMonth() && fechaDate.getDate() == fechaActual.getDate() && fechaDate.getFullYear() == fechaActual.getFullYear()) {
      return true;
    }
    return false;
  }
  ValidarMesMayorActual(mesyaño: string) {
    let fechaActual = new Date();
    let fechaDate = new Date(mesyaño);
    //aumentar el día del mes en 1
    fechaDate.setDate(fechaDate.getDate() + 1);
    if (fechaDate.getFullYear() > fechaActual.getFullYear()) {
      return true;
    }
    if (fechaDate.getFullYear() == fechaActual.getFullYear() && fechaDate.getMonth() >= fechaActual.getMonth()) {
      return true;
    }
    return false;


  }
  MesValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      return this.ValidarMesMayorActual(control.value) ? null : { mes: { value: control.value } };
    };
  }
  CambiarVista(vista: number) {
    if (vista == 0) {
      let confirmoVueltaInicio = confirm("Esta seguro que desea volver al inicio? todos los datos que haya ingresado se perderan");
      if (confirmoVueltaInicio) {
        this.Terminar(true);
      }
      return;
    }
    if (this.vistaActual == 2) {
      this.lugarEntregaForm.controls["ciudad"].setValue(this.localForm.controls["ciudad"].value!);
    }
    if (vista == 6) {
      if (this.metodoPago == "Efectivo" && this.efectivoForm.invalid) {
        vista = 5;
      }
    }
    this.salidaIzquierda = true;
    this.submited = false;
    if (vista > this.hastaCompletado) {
      this.hastaCompletado = vista;
    }
    if (this.pedidoForm.controls["imagen"].value != '') {
      this.pedidoForm.controls["imagen"].setValue('');
    }
    setTimeout(() => {
      this.salidaIzquierda = false;
      this.vistaActual = vista;

    }, 500);

  }
  ExisteImagen() {
    //me fijo si imagen subida esta vacio
    if (this.imagenSubida.length == 0) {
      return false;
    }
    return true;

  }
  EliminarImagen() {
    this.imagenSubida = new Array<string>();
    this.pedidoForm.controls["imagen"].setValue('');
  }
  TotalPago() {
    return this.precio;
  }
  MetodoDePago(metodo: string) {
    this.metodoPago = metodo;
    this.CambiarVista(5);
  }
  TieneErrores(form: FormGroup, control: string) {
    return form.controls[control].invalid && (form.controls[control].dirty || form.controls[control].touched || this.submited);
  }

  Error(form: FormGroup, control: string, error: string) {
    return this.TieneErrores(form, control) && form.controls[control].hasError(error)
  }
  QuitarRequired() {
    this.lugarEntregaForm.controls["fecha"].clearValidators();
    this.lugarEntregaForm.controls["fecha"].updateValueAndValidity();
    this.lugarEntregaForm.controls["hora"].clearValidators();

    this.lugarEntregaForm.controls["hora"].updateValueAndValidity();
  }
  AgregarRequired() {
    this.lugarEntregaForm.controls["fecha"].setValidators([Validators.required, this.FechaValidator(), this.SemanaValidator()]);
    this.lugarEntregaForm.controls["fecha"].updateValueAndValidity();
    this.lugarEntregaForm.controls["hora"].setValidators([Validators.required, this.AtRightTimeValidator()]);
    this.lugarEntregaForm.controls["hora"].updateValueAndValidity();
  }
  NumeroTarjeta(numeroIngresado: string) {
    let numero: string = "";
    for (let i = 0; i < 16; i++) {
      if (i % 4 == 0 && i !== 0) {
        numero += "  ";
      }
      if (numeroIngresado.toString().length > i) {
        numero += numeroIngresado.toString()[i].toString();
      }
      else {
        numero += "X";
      }

    }
    return numero;
  }

  Vencimiento() {
    let vencimiento = this.tarjetaForm.controls["vencimiento"].value;
    let mes = vencimiento!.substring(0, 2);
    let anio = vencimiento!.substring(2, 4);
    return mes + "/" + anio;
  }

  Visa() {
    return this.tarjetaForm.controls["numero"].value!.toString()[0] == "4";
  }
  MasterCard() {
    return this.tarjetaForm.controls["numero"].value!.toString()[0] == "5";
  }

  isVisa(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return this.isVisaCard(control.value.toString()) ? null : { isvisa: { value: control.value } };
    };
  }
  FechaValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return this.ValidarMayorFechaActual(control.value) ? null : { fecha: { value: control.value } };
    };
  }
  isSameCityValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return this.isSameCity(control.value.toString()) ? null : { issamecity: { value: control.value } };
    };
  }
  AtRightTimeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return this.isRightTime(control.value.toString()) ? null : { righttime: { value: control.value } };
    };
  }
  isRightTime(hora: string) {
    if (hora) {
      let date = new Date();
      console.log(date);
      if (this.lugarEntregaForm.controls["fecha"].value! == this.ConseguirFechaActual()) {
        console.log("es hoy");
        let horaActual = date.getHours();
        console.log(horaActual);
        let minutosActual = date.getMinutes();
        console.log(minutosActual);
        let horaIngresada = parseInt(hora.substring(0, 2));
        console.log(horaIngresada);
        let minutosIngresados = parseInt(hora.substring(3, 5));
        console.log(minutosIngresados);
        if (horaIngresada < horaActual + 1) {
          return false;
        }
        else if (horaIngresada == horaActual + 1 && minutosIngresados < minutosActual) {
          return false;
        }
      }
      return true;
    }
    return false;
  }
  isSameCity(city: string): boolean {
    if (city) {
      // que empieze con 4
      if (city == this.localForm.controls["ciudad"].value) {
        return true;
      }
    }
    return false;
  }
  isVisaCard(cardNumber: string): boolean {
    if (cardNumber) {
      // que empieze con 4
      if (cardNumber.length == 0) {
        return false;
      }

      if (cardNumber[0] !== '4') {
        return false;
      }
      else {
        return true;
      }
    }
    return false;
  }

  @HostListener('change', ['$event'])
  onChange(event: any) {
    if (event.target.id == "imagen") {
      if (event.target.files.length > 0) {
        const file = event.target.files[0];
        const maxSizeMB = 5;
        const maxSizeBytes = maxSizeMB * 1024 * 1024; // Convertir a bytes
        //document.getElementById("imagen-previsualizada")!.setAttribute('src', this.imagenSubida);
        // Validar el tamaño máximo en MB (por ejemplo, 5 MB)
        if (file.size > maxSizeBytes) {
          alert(`El archivo ${file.name} excede el tamaño máximo de ${maxSizeMB} MB.`);
          return;
        } else {
          this.imagenSubida.push(URL.createObjectURL(file));
          console.log(this.imagenSubida);
        }
      }
    }
  }

  MesyAnioActual() {
    let fecha = new Date();
    let mes = fecha.getMonth() + 1;
    let anio = fecha.getFullYear().toString();
    let mesString = mes.toString();
    if (mes < 10) {
      mesString = "0" + mesString;
    }
    return anio + "-" + mesString;
  }
  confirmado = false;
  Confirmar() {
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      this.confirmado = true;
    }, 3500);

  }

  SetearForms() {
    this.pedidoForm = new FormGroup({
      objetos: new FormControl('', [Validators.required, Validators.maxLength(1200)]),
      imagen: new FormControl('')
    });
    this.localForm = new FormGroup({
      calle: new FormControl('', [Validators.required, Validators.maxLength(120)]),
      numero: new FormControl('', [Validators.required, Validators.pattern('[0-9]{1,7}')]),
      ciudad: new FormControl('', [Validators.required, Validators.maxLength(120)]),
      referencia: new FormControl('', [Validators.maxLength(120)])
    });
    this.lugarEntregaForm = new FormGroup({
      calle: new FormControl('', [Validators.required, Validators.maxLength(120)]),
      numero: new FormControl('', [Validators.required, Validators.pattern('[0-9]{1,7}')]),
      ciudad: new FormControl('', [Validators.required, Validators.maxLength(120), this.isSameCityValidator()]),
      referencia: new FormControl('', [Validators.maxLength(120)]),
      entrega: new FormControl('lo-antes-posible', [Validators.maxLength(120)]),
      fecha: new FormControl(this.ConseguirFechaActual(), []),
      hora: new FormControl('', [])
    });
    this.tarjetaForm = new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.maxLength(40)]),
      numero: new FormControl('', [Validators.required, Validators.pattern('[0-9]{16,16}'), this.isVisa()]),
      vencimiento: new FormControl("", [Validators.required, Validators.maxLength(120), this.MesValidator()]),
      codigo: new FormControl('', [Validators.required, Validators.pattern('[0-9]{3,3}')]),
    });

    this.efectivoForm = new FormGroup({
      monto: new FormControl('', [Validators.required, Validators.pattern('[0-9]{1,7}(?:\.[0-9]{1,2})?'), this.PrecioValidator()]),
    });
  }
  Terminar(e: boolean) {

    //drop every change on the forms
    this.vistaActual = 0;
    this.hastaCompletado = 0;
    this.metodoPago = "Efectivo";
    this.submited = false;
    this.imagenSubida = new Array<string>();
    this.loading = false;
    this.confirmado = false;
    this.salidaIzquierda = false;
    this.salidaDerecha = false;
    this.entradaIzquierda = false;
    this.entradaDerecha = false;
    this.flipped = false;
    this.footer = false;
    this.coordenadasHasta = undefined;
    this.coordenadasDesde = undefined;
    this.precio = 0;
    this.distancia = 0;
    this.existeRutaLocal = true;
    this.existeRutaEntrega = true;
    this.SetearForms();

  }
  FormatearFecha(fecha: string) {
    let dia = fecha.substring(8, 10);
    let mes = fecha.substring(5, 7);
    let anio = fecha.substring(0, 4);
    return dia + "/" + mes + "/" + anio;

  }
  DeCoordenadasANombre(direcciones: google.maps.GeocoderAddressComponent[], form: FormGroup, entrega = false) {
    direcciones.forEach((direccion) => {
      if (direccion.types.includes("street_number")) {
        form.controls["numero"].setValue(direccion.long_name);
        form.controls["numero"].markAsTouched();
      }
      if (direccion.types.includes("locality") && !entrega) {
        form.controls["ciudad"].setValue(direccion.long_name);
        form.controls["ciudad"].markAsTouched();
      }
      if (direccion.types.includes("route")) {
        form.controls["calle"].setValue(direccion.long_name);
        form.controls["calle"].markAsTouched();
      }

    });
  }
  PrecioValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      return this.isPrecioCorrecto(control.value) ? null : { 'mayor-semana': { value: control.value } };
    };
  }
  isPrecioCorrecto(valorefectivo: string) {
    if (valorefectivo) {
      if (parseFloat(valorefectivo) < this.precio) {
        return false;
      }
    }
    return true;
  }
  SemanaValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      return this.ValidarUnaSemana(control.value) ? null : { 'mayor-semana': { value: control.value } };
    };
  }
  ValidarUnaSemana(fecha: string) {
    let fechaActual = new Date();
    let fechaDate = new Date(fecha);
    fechaActual.setHours(0, 0, 0, 0);
    // saber si la fecha date es 8 dias mayor a la fecha actual
    if (fechaDate.getTime() > fechaActual.getTime() + 7 * 24 * 60 * 60 * 1000) {
      return false;
    }
    return true;

  }
}
