import { collection, addDoc, db, query, where, getDocs } from "./firebase.js";

export async function addClient(client) {
  try {
    return await addDoc(collection(db, "client"), { ...client });
  } catch (error) {
    console.error("Erro ao adicionar cliente: ", error);
    throw error;
  }
}

export async function queryClient() {
  try {
    const q = query(collection(db, "client"), where("isActive", "==", true));
    const querySnapshot = await getDocs(q);

    const clients = [];
    querySnapshot.forEach((doc) => {
      clients.push({ id: doc.id, ...doc.data() });
    });

    return clients;
  } catch (error) {
    console.error("Erro ao consultar clientes: ", error);
    throw error;
  }
}
