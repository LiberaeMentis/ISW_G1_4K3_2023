import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent {
 @Input() loading: boolean = false;
 @Input() confirmado: boolean = false;
 @Output() VolverAInicio = new EventEmitter<boolean>();
 Volver(){
    this.VolverAInicio.emit(true);
 }

}
