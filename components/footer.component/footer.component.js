export function footerComponentTemplate() {
  const footer = document.createElement("footer");
  footer.innerHTML = `
   <section class="footer-container">
        <div class="footer-credit text-center">
          <p>&copy; <span id="anoAtual"></span> Desenvolvido por Anderson Pinheiro</p>
        </div>
      </section>
  `;

  document.body.appendChild(footer);

  atualizarAno();
}

export function atualizarAno() {
  const anoElement = document.querySelector("#anoAtual");
  if (anoElement) {
    const anoAtual = new Date().getFullYear();
    anoElement.textContent = anoAtual;
  }
}
