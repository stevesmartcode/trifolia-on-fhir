import {Component, Input, OnInit} from '@angular/core';
import {Coding, EventComponent} from '../../../../../../libs/tof-lib/src/lib/stu3/fhir';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Globals} from '../../../../../../libs/tof-lib/src/lib/globals';
import {FhirService} from '../../shared/fhir.service';

@Component({
  selector: 'app-fhir-messaging-event-modal',
  templateUrl: './messaging-event-modal.component.html',
  styleUrls: ['./messaging-event-modal.component.css']
})
export class FhirMessagingEventModalComponent implements OnInit {
  @Input() event: EventComponent;
  public messageEventCodes: Coding[] = [];

  public Globals = Globals;

  constructor(
    public activeModal: NgbActiveModal,
    private fhirService: FhirService) {

  }

  ngOnInit() {
    this.messageEventCodes = this.fhirService.getValueSetCodes('http://hl7.org/fhir/ValueSet/message-events');
  }
}
