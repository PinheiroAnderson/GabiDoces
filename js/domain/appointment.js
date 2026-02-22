export class Appointment {
  constructor({
    clientId = "",
    serviceId = "",
    date = "",
    time = "",
    status = "pending", // pending, confirmed, completed, cancelled
    notes = "",
  } = {}) {
    this.clientId = clientId;
    this.serviceId = serviceId;
    this.date = date;
    this.time = time;
    this.status = status;
    this.notes = notes;
  }
}