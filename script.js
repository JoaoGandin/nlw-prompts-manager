// Chave para identificar os dados salvos pela nossa aplicação no navegador
const STORAGE_KEY = "prompts_storage"

// Estado para carregar os prompts salvos e exibir
const state = {
  prompts: [],
  selectedID: null,
}

// Seleção dos elementos HTML por ID
const elements = {
  promptTitle: document.getElementById("prompt-title"),
  promptContent: document.getElementById("prompt-content"),
  titleWrapper: document.getElementById("title-wrapper"),
  contentWrapper: document.getElementById("content-wrapper"),
  btnOpen: document.getElementById("btn-open"),
  btnCollapse: document.getElementById("btn-collapse"),
  sidebar: document.querySelector(".sidebar"),
  btnSave: document.getElementById("btn-save"),
  list: document.getElementById("prompt-list"),
  search: document.getElementById("search-input"),
  btnNew: document.getElementById("btn-new"),
  btnCopy: document.getElementById("btn-copy"),
}

// Atualiza o estado do wrapper conforme o conteúdo do elemento
function updateEditableWrapperState(element, wrapper) {
  // vai verificar se o elemento tem texto
  // se tiver, remove a classe is-empty
  // se não tiver, adiciona a classe is-empty
  const hasText = element.textContent.trim().length > 0

  wrapper.classList.toggle("is-empty", !hasText)
  // esse metodo toggle adiciona a classe se não existir e remove se existir
  // a exclamação ta fazendo uma negação, ou seja, se não tiver texto, adiciona a classe is-empty e se tiver remove a classe is-empty
}

// Funções para abrir e fechar a sidebar
function openSidebar() {
  elements.sidebar.classList.add("open")
  elements.sidebar.classList.remove("collapsed")
}

function closeSidebar() {
  elements.sidebar.classList.remove("open")
  elements.sidebar.classList.add("collapsed")
}

// Atualiza o estado de todos os elementos editáveis
function updateAllEditableStates() {
  updateEditableWrapperState(elements.promptTitle, elements.titleWrapper)
  updateEditableWrapperState(elements.promptContent, elements.contentWrapper)
}

// Adiciona ouvintes de evento para atualizar wrappers em tempo real
function attachAllEditableHandlers() {
  elements.promptTitle.addEventListener("input", function () {
    updateEditableWrapperState(elements.promptTitle, elements.titleWrapper)
  })
  elements.promptContent.addEventListener("input", function () {
    updateEditableWrapperState(elements.promptContent, elements.contentWrapper)
  })
}

function save() {
  const title = elements.promptTitle.textContent.trim()
  const content = elements.promptContent.innerHTML.trim()
  const hasContent = elements.promptContent.textContent.trim()

  // verifica se o título e o conteúdo não estão vazios
  if (!title || !hasContent) {
    alert("Título e conteúdo não podem estar vazios.")
    return
  }

  if (state.selectedID) {
    // Editando um prompt existente
    const existingPrompt = state.prompts.find((p) => p.id === state.selectedID)

    if (existingPrompt) {
      existingPrompt.title = title || "Sem título" // Atualiza o título
      existingPrompt.content = content || "Sem conteúdo" // Atualiza o conteúdo
    }
  } else {
    // Criando um novo prompt
    const newPrompt = {
      id: Date.now().toString(36), // pega o a data e hora atual e converte para string
      title, // Título do prompt
      content, // Conteúdo do prompt
    }

    state.prompts.unshift(newPrompt) // Adiciona o novo prompt no começo da lista
    state.selectedID = newPrompt.id // Seleciona o novo prompt
  }

  renderList(elements.search.value) // Re-renderiza a lista com o filtro atual
  persist() // Salva o estado atualizado no localStorage
  alert("Prompt salvo com sucesso!")
}

function persist() {
  try {
    // dentro do try ele tenta executar o código
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.prompts))
  } catch (error) {
    // se der erro, o catch captura o erro e executa o código dentro do catch ou exibir o erro
    console.log("Erro ao salvar no localStorage:", error)
  }
}

function load() {
  try {
    const storage = localStorage.getItem(STORAGE_KEY)
    state.prompts = storage ? JSON.parse(storage) : []
    // o ? é um operador ternário que funciona como um if e os : funciona como um else
    // se storage tiver valor, ele faz o parse, se não tiver, ele atribui um array vazio
    state.selectedID = null
  } catch (error) {
    console.log("Erro ao carregar do localStorage:", error)
  }
}

function createPromptItem(prompt) {
  const tmp = document.createElement("div")
  tmp.innerHTML = prompt.content
  return `
    <li class="prompt-item" data-id="${prompt.id}" data-action="select">
      <div class="prompt-item-content">
        <span class="prompt-item-title">${prompt.title}</span>
        <span class="prompt-item-description">${tmp.textContent}</span>
      </div>
      <button class="btn-icon" title="Remover" data-action="remove">
        <img src="assets/remove.svg" alt="Remover" class="icon icon-trash"/>
      </button>
    </li>
  `
}

function renderList(filterText = "") {
  const filteredPrompts = state.prompts
    .filter((prompt) =>
      prompt.title.toLowerCase().includes(filterText.toLowerCase().trim())
    )
    .map((p) => createPromptItem(p))
    .join("")

  elements.list.innerHTML = filteredPrompts
}

function newPrompt() {
  state.selectedID = null
  elements.promptTitle.textContent = ""
  elements.promptContent.innerHTML = ""
  updateAllEditableStates()
  elements.promptTitle.focus() // Foca no título para facilitar a digitação
}

function copySelected() {
  try {
    const content = elements.promptContent
    navigator.clipboard.writeText(content.innerText) // innerText pega o texto sem as tags HTMLw

    alert("Conteúdo copiado para a área de transferência!")
  } catch (error) {
    console.log("Erro ao copiar para a área de transferência:", error)
  }
}

// Eventos
elements.btnSave.addEventListener("click", save)
elements.btnNew.addEventListener("click", newPrompt)
elements.btnCopy.addEventListener("click", copySelected)

elements.search.addEventListener("input", function (event) {
  renderList(event.target.value)
})

elements.list.addEventListener("click", function (event) {
  const removeBtn = event.target.closest("[data-action='remove']")
  const item = event.target.closest("[data-id]")

  if (!item) return // se não tiver item, sai da função

  const id = item.getAttribute("data-id")
  state.selectedID = id

  if (removeBtn) {
    // Remover prompt
    state.prompts = state.prompts.filter((p) => p.id !== id)
    renderList(elements.search.value) // Re-renderiza a lista após a remoção
    persist() // Salva o estado atualizado no localStorage

    return
  }

  if (event.target.closest("[data-action='select']")) {
    const prompt = state.prompts.find((p) => p.id === id)

    if (prompt) {
      elements.promptTitle.textContent = prompt.title
      elements.promptContent.innerHTML = prompt.content
      updateAllEditableStates()
    }
  }
})

// Função de inicialização
function init() {
  load() // Carrega os prompts salvos
  renderList("") // Renderiza a lista de prompts
  attachAllEditableHandlers()
  updateAllEditableStates() // Adiciona os ouvintes de evento para os elementos editáveis

  // Estado inicial: sidebar aberta, botão de abrir oculto
  elements.sidebar.classList.remove("open")
  elements.sidebar.classList.remove("collapsed")

  // Eventos para abrir/fechar sidebar
  elements.btnOpen.addEventListener("click", openSidebar)
  elements.btnCollapse.addEventListener("click", closeSidebar)
}

// Executa a inicialização ao carregar o script
init()
