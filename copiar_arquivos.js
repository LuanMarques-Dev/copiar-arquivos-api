const fs = require("fs");
const path = require("path");

// Configurações principais
const PASTA_ORIGEM_NFE = "\\\\IPDoServidorOuPc\\Caminho\\Da\\Pasta\\De\\Origem1";
const PASTA_ORIGEM_CTE = "\\\\IPDoServidorOuPc\\Caminho\\Da\\Pasta\\De\\Origem2";
const PASTA_DESTINO_NFE = "\\\\IPDoServidorOuPc\\Caminho\\Da\\gniwebaraplac\\De\\Destino";
const PASTA_DESTINO_CTE = "\\\\IPDoServidorOuPc\\Caminho\\Da\\gniwebaraplac\\De\\xmlcte";
const DELAY_ENTRE_VERIFICACOES = 1000; // Verifica novas alterações a cada 1 segundo
const DELAY_ENTRE_ARQUIVOS = 15000; // 15 segundos entre arquivos
const DIAS_LIMITE = 5; // Até 5 dias antes da data atual
const LOG_PATH = path.join(require("os").tmpdir(), "erros.log");

// Lista para rastrear arquivos processados
let arquivosProcessados = new Set();

// Função para obter a data de hoje e o limite (5 dias antes)
const getLimiteData = () => {
  const hoje = new Date();
  const limite = new Date();
  limite.setDate(hoje.getDate() - DIAS_LIMITE);
  return { hoje, limite };
};

// Função para registrar logs
const logErro = (mensagem) => {
  const data = `${new Date().toISOString()} - ${mensagem}\n`;
  try {
    fs.appendFileSync(LOG_PATH, data, "utf8");
  } catch (err) {
    console.error(`Falha ao registrar o log: ${err.message}`);
  }
};

// Função para copiar um arquivo
const copiarArquivo = (arquivo, destino) => {
  return new Promise((resolve, reject) => {
    const nomeArquivo = path.basename(arquivo);
    const caminhoDestino = path.join(destino, nomeArquivo);

    if (fs.existsSync(caminhoDestino)) {
      console.log(`Arquivo já existe na pasta de destino: ${nomeArquivo}`);
      return resolve(false); // Arquivo já existe
    }

    fs.copyFile(arquivo, caminhoDestino, (err) => {
      if (err) {
        logErro(`Erro ao copiar ${nomeArquivo}: ${err.message}`);
        return reject(err);
      }
      console.log(`Arquivo copiado: ${nomeArquivo}`);
      resolve(true);
    });
  });
};

// Função para processar arquivos de uma pasta
const processarPasta = async (origem, destino, tipo) => {
  const { hoje, limite } = getLimiteData();
  let arquivos;

  try {
    arquivos = fs.readdirSync(origem).map((arquivo) => path.join(origem, arquivo));
  } catch (err) {
    logErro(`Erro ao acessar a pasta ${origem}: ${err.message}`);
    return false;
  }

  let novosArquivosProcessados = false;

  for (const arquivo of arquivos) {
    if (arquivosProcessados.has(arquivo)) {
      continue; // Pula arquivos já processados
    }

    try {
      const stats = fs.statSync(arquivo);
      const dataModificacao = new Date(stats.mtime);

      // Verifica se o arquivo está no intervalo de datas permitido
      if (dataModificacao >= limite && dataModificacao <= hoje) {
        const copiado = await copiarArquivo(arquivo, destino);
        if (copiado) {
          arquivosProcessados.add(arquivo); // Marca o arquivo como processado
          novosArquivosProcessados = true;
          // Espera 15 segundos antes de processar o próximo arquivo
          await new Promise((r) => setTimeout(r, DELAY_ENTRE_ARQUIVOS));
        }
      }
    } catch (err) {
      logErro(`Erro ao processar ${arquivo}: ${err.message}`);
    }
  }

  return novosArquivosProcessados;
};

// Função principal para alternar entre as pastas
const verificarPastas = async () => {
  const pastaConfig = [
    { origem: PASTA_ORIGEM_NFE, destino: PASTA_DESTINO_NFE, tipo: "NFe" },
    { origem: PASTA_ORIGEM_CTE, destino: PASTA_DESTINO_CTE, tipo: "CTe" },
  ];

  let houveAlteracao = false;

  for (const { origem, destino, tipo } of pastaConfig) {
    const novosArquivos = await processarPasta(origem, destino, tipo);
    if (novosArquivos) {
      console.log(`Processamento concluído para a pasta ${tipo}.`);
      houveAlteracao = true;
    }
  }

  if (!houveAlteracao) {
    console.log(`Aguardando novos arquivos...`);
  }

  // Repetir o ciclo após um intervalo
  setTimeout(verificarPastas, DELAY_ENTRE_VERIFICACOES);
};

// Função principal
const iniciarMonitoramento = () => {
  console.log(`Monitorando as pastas: NFe e CTe`);
  console.log(`Logs serão registrados em: ${LOG_PATH}`);
  verificarPastas();
};

// Tratamento global de erros
process.on("uncaughtException", (err) => {
  logErro(`Erro não tratado: ${err.message}\n${err.stack}`);
});

process.on("unhandledRejection", (reason, promise) => {
  logErro(`Rejeição não tratada: ${reason}\nPromise: ${promise}`);
});

// Executar diretamente
if (require.main === module) {
  iniciarMonitoramento();
}
