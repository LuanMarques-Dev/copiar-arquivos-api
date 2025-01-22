const fs = require("fs");
const path = require("path");

const PASTA_ORIGEM_NFE = "\\\\IPDoServidorOuPc\\Caminho\\Da\\Pasta\\De\\Origem1";
const PASTA_ORIGEM_CTE = "\\\\IPDoServidorOuPc\\Caminho\\Da\\Pasta\\De\\Origem2";
const PASTA_DESTINO_NFE = "\\\\IPDoServidorOuPc\\Caminho\\Da\\gniwebaraplac\\De\\Destino";
const PASTA_DESTINO_CTE = "\\\\IPDoServidorOuPc\\Caminho\\Da\\gniwebaraplac\\De\\xmlcte";
const DELAY_ENTRE_VERIFICACOES = 1000;
const DELAY_ENTRE_ARQUIVOS = 15000;
const DIAS_LIMITE = 5;
const LOG_PATH = path.join(require("os").tmpdir(), "erros.log");

let arquivosProcessados = new Set();

const getLimiteData = () => {
  const hoje = new Date();
  const limite = new Date();
  limite.setDate(hoje.getDate() - DIAS_LIMITE);
  return { hoje, limite };
};

const logErro = (mensagem) => {
  const data = `${new Date().toISOString()} - ${mensagem}\n`;
  try {
    fs.appendFileSync(LOG_PATH, data, "utf8");
  } catch (err) {
    console.error(`Falha ao registrar o log: ${err.message}`);
  }
};

const copiarArquivo = (arquivo, destino) => {
  return new Promise((resolve, reject) => {
    const nomeArquivo = path.basename(arquivo);
    const caminhoDestino = path.join(destino, nomeArquivo);

    if (fs.existsSync(caminhoDestino)) {
      console.log(`Arquivo já existe na pasta de destino: ${nomeArquivo}`);
      return resolve(false);
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
      continue;
    }

    try {
      const stats = fs.statSync(arquivo);
      const dataModificacao = new Date(stats.mtime);

      if (dataModificacao >= limite && dataModificacao <= hoje) {
        const copiado = await copiarArquivo(arquivo, destino);
        if (copiado) {
          arquivosProcessados.add(arquivo);
          novosArquivosProcessados = true;

          await new Promise((r) => setTimeout(r, DELAY_ENTRE_ARQUIVOS));
        }
      }
    } catch (err) {
      logErro(`Erro ao processar ${arquivo}: ${err.message}`);
    }
  }

  return novosArquivosProcessados;
};

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

  setTimeout(verificarPastas, DELAY_ENTRE_VERIFICACOES);
};

const iniciarMonitoramento = () => {
  console.log(`Monitorando as pastas: NFe e CTe`);
  console.log(`Logs serão registrados em: ${LOG_PATH}`);
  verificarPastas();
};

process.on("uncaughtException", (err) => {
  logErro(`Erro não tratado: ${err.message}\n${err.stack}`);
});

process.on("unhandledRejection", (reason, promise) => {
  logErro(`Rejeição não tratada: ${reason}\nPromise: ${promise}`);
});

if (require.main === module) {
  iniciarMonitoramento();
}
