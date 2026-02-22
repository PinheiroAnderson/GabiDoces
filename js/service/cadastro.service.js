import { addClient } from "./../infra/cadastro.repository.js";
import { createUserWithEmailAndPassword, auth } from "./../infra/firebase.js";

export const cadastroService = {
  add,
};

function add(client) {
  return createUserWithEmailAndPassword(auth, client.email, client.password)
    .then((userCredential) => {
      // Signed up
      const user = userCredential.user;
      console.log("Usuário criado no Auth:", user);
      // Add additional data to Firestore
      client.uid = user.uid; // Add Firebase UID
      return addClient(client);
    })
    .then((res) => {
      console.log("Cliente adicionado com sucesso:", res);
      return res;
    })
    .catch((error) => {
      console.error("Erro ao cadastrar cliente: ", error);
      let errorMessage = "Erro ao cadastrar cliente. Verifique os dados e tente novamente.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Este e-mail já está em uso.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "A senha deve ter pelo menos 6 caracteres.";
      }
      throw new Error(errorMessage);
    });
}
