export class Client {
  constructor({
    name = "",
    phone = "",
    email = "",
    password = "",
    picture = "",
    type = "",
    gender = "",
    document = "",
  } = {}) {
    this.name = name;
    this.phone = phone;
    this.email = email;
    this.password = password;
    this.picture = picture;
    this.type = type;
    this.gender = gender;
    this.document = document;
  }
}
