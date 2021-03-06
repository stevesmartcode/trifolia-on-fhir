import {Injectable} from '@angular/core';
import {AuditEvent, Bundle, Coding, EntryComponent, Identifier} from '../../../../../libs/tof-lib/src/lib/stu3/fhir';
import {HttpClient} from '@angular/common/http';
import {AuthService} from './auth.service';
import {Globals} from '../../../../../libs/tof-lib/src/lib/globals';
import {logging} from 'selenium-webdriver';
import Entry = logging.Entry;

@Injectable()
export class AuditEventService {
  public recentImplementationGuides = [];
  public recentStructureDefinitions = [];

  constructor(
    private http: HttpClient,
    private authService: AuthService) {

    // Wait for authentication to initialize
    this.authService.authChanged
      .subscribe(() => {
        // If a user is authenticated, search for AuditEvent resources associated with
        // the logged-in user to determine if they have any recent IGs or SDs
        if (this.authService.userProfile) {
          this.search(this.authService.userProfile.sub)
            .subscribe((res: Bundle) => {
              // Find recent ImplementationGuides in the results
              this.recentImplementationGuides = res.entry
                .filter((entry) => {
                  const auditEvent = <AuditEvent> entry.resource;
                  return !!(auditEvent.entity || []).find((entity) =>
                    entity.identifier &&
                    entity.identifier.system === Globals.FHIRUrls.ImplementationGuide);
                })
                .reduce((previous: EntryComponent[], current: EntryComponent) => {      // distinct
                  const auditEvent = <AuditEvent> current.resource;
                  const value = auditEvent.entity[0].identifier.value;
                  const found = previous.find((nextPrevious) => {
                    const nextAuditEvent = <AuditEvent> nextPrevious.resource;
                    const nextValue = nextAuditEvent.entity[0].identifier.value;
                    return nextValue === value;
                  });

                  if (!found) {
                    previous.push(auditEvent);
                  }

                  return previous;
                }, [])
                .reduce((previous: EntryComponent[], current: EntryComponent) => {      // next 5
                  if (previous.length < 5) {
                    previous.push(current);
                  }
                  return previous;
                }, [])
                .map((entry: EntryComponent) => (<AuditEvent>entry.resource).entity[0].identifier.value);

              // Find recent StructureDefinitions in the results
              this.recentStructureDefinitions = res.entry
                .filter((entry) => {
                  const auditEvent = <AuditEvent> entry.resource;
                  return !!(auditEvent.entity || []).find((entity) =>
                    entity.identifier &&
                    entity.identifier.system === Globals.FHIRUrls.StructureDefinition);
                })
                .reduce((previous: EntryComponent[], current: EntryComponent) => {      // distinct
                  const auditEvent = <AuditEvent> current.resource;
                  const value = auditEvent.entity[0].identifier.value;
                  const found = previous.find((nextPrevious) => {
                    const nextAuditEvent = <AuditEvent> nextPrevious.resource;
                    const nextValue = nextAuditEvent.entity[0].identifier.value;
                    return nextValue === value;
                  });

                  if (!found) {
                    previous.push(auditEvent);
                  }

                  return previous;
                }, [])
                .reduce((previous: EntryComponent[], current: EntryComponent) => {      // next 5
                  if (previous.length < 5) {
                    previous.push(current);
                  }
                  return previous;
                }, [])
                .map((entry) => (<AuditEvent>entry.resource).entity[0].identifier.value);
            });
        }
      });
  }

  getTypeCoding(typeCode: string): Coding {
    const coding: Coding = {
      system: 'http://hl7.org/fhir/ValueSet/audit-event-type',
      code: typeCode
    };

    switch (typeCode) {
      case '110100':
        coding.display = 'Audit event: Application Activity has taken place';
        break;
    }

    return coding;
  }

  /**
   * Creates an AuditEvent resource model based on the criteria specified,
   * defaulting some values to Trifolia-on-FHIR specific details (such as agent,
   * who is the logged-in user, and the source, which is always trifolia-on-fhir)
   * @param {string} typeCode The type of event
   * @param {Identifier} entityIdentifier The identifier of the entity being audited
   * @returns {AuditEvent} An AuditEvent model
   */
  getModel(typeCode: string, entityIdentifier?: Identifier) {
    let userId = null;

    if (this.authService.userProfile && this.authService.userProfile.sub) {
      const subSplit = this.authService.userProfile.sub.split('|');
      if (subSplit.length === 1) {
        userId = {
          value: this.authService.userProfile.sub
        };
      } else if (subSplit.length === 2) {
        userId = {
          system: subSplit[0],
          value: subSplit[1]
        };
      } else if (subSplit.length > 2) {
        userId = {
          value: this.authService.userProfile.sub.replace('|', '%7F')
        };
      }
    }

    const auditEvent: AuditEvent = {
      resourceType: 'AuditEvent',
      type: this.getTypeCoding(typeCode),
      recorded: new Date(),
      agent: [{
        requestor: false,
        userId: userId
      }],
      source: {
        identifier: {
          value: 'trifolia-on-fhir'
        }
      }
    };

    if (entityIdentifier) {
      auditEvent.entity = [{
        identifier: entityIdentifier
      }];
    }

    return auditEvent;
  }

  search(user: string) {
    let url = '/api/auditEvent?';

    if (user) {
      url += 'user=' + encodeURIComponent(user) + '&';
    }

    return this.http.get(url);
  }

  /**
   * Persists the AuditEvent resource as a new resource on the server
   * @param {AuditEvent} auditEvent The AuditEvent resource to save to the server
   * @returns {Observable<Object>} An observable that can be subscribed to, which will complete when the server has saved the AuditEvent
   */
  create(auditEvent: AuditEvent) {
    const results = this.http.post('/api/auditEvent', auditEvent);
    results.subscribe((res) => {
      // If an entity has been specified on the AuditEvent, it may be an ImplementationGuide
      // or an StructureDefinition, and we would want to add that to the list of recent IGs and SDs
      if (auditEvent.entity && auditEvent.entity.length > 0) {
        if (auditEvent.entity[0].identifier.system === Globals.FHIRUrls.ImplementationGuide) {
          const igId = auditEvent.entity[0].identifier.value;
          if (this.recentImplementationGuides.indexOf(igId) < 0) {
            this.recentImplementationGuides.push(igId);
          }
        }

        if (auditEvent.entity[0].identifier.system === Globals.FHIRUrls.StructureDefinition) {
          const sdId = auditEvent.entity[0].identifier.value;
          if (this.recentStructureDefinitions.indexOf(sdId) < 0) {
            this.recentStructureDefinitions.push(sdId);
          }
        }
      }
    }, (err) => {
      console.error('Error saving audit entry to server: ' + err);
    });
    return results;
  }
}
