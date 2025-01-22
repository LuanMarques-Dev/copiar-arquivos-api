<h1 align="center">📁 Monitor de Arquivos - NFe e CTe</h1>

<p align="center">
  Um sistema para monitoramento, processamento e cópia de arquivos XML de NFe e CTe entre pastas de origem e destino configuradas em uma rede local.
</p>

---

<h2>📋 Funcionalidades</h2>

<ul>
  <li>Monitoramento contínuo de pastas de origem configuradas.</li>
  <li>Processamento de arquivos XML de NFe e CTe.</li>
  <li>Cópia de arquivos para as pastas de destino configuradas.</li>
  <li>Validação de arquivos com base na data de modificação (últimos 5 dias).</li>
  <li>Registro de logs para erros e eventos importantes.</li>
</ul>

---

<h2>⚙️ Configurações</h2>

<p>As configurações principais estão no código e podem ser ajustadas conforme necessário:</p>

<pre>
<code>
// Caminhos de pastas
const PASTA_ORIGEM_NFE = "\\\\IPDoServidorOuPc\\Caminho\\Da\\Pasta\\De\\Origem1";
const PASTA_ORIGEM_CTE = "\\\\IPDoServidorOuPc\\Caminho\\Da\\Pasta\\De\\Origem2";
const PASTA_DESTINO_NFE = "\\\\IPDoServidorOuPc\\Caminho\\Da\\gniwebaraplac\\De\\Destino";
const PASTA_DESTINO_CTE = "\\\\IPDoServidorOuPc\\Caminho\\Da\\gniwebaraplac\\De\\xmlcte";

// Intervalos e limites
const DELAY_ENTRE_VERIFICACOES = 1000; // Verifica novas alterações a cada 1 segundo
const DELAY_ENTRE_ARQUIVOS = 15000;    // 15 segundos entre arquivos
const DIAS_LIMITE = 5;                 // Até 5 dias antes da data atual

// Caminho para os logs
const LOG_PATH = path.join(require("os").tmpdir(), "erros.log");
</code>
</pre>

---

<h2>📦 Estrutura do Projeto</h2>

<ul>
  <li><strong>PASTA_ORIGEM_NFE:</strong> Caminho da pasta de origem dos arquivos NFe.</li>
  <li><strong>PASTA_ORIGEM_CTE:</strong> Caminho da pasta de origem dos arquivos CTe.</li>
  <li><strong>PASTA_DESTINO_NFE:</strong> Caminho da pasta de destino dos arquivos NFe.</li>
  <li><strong>PASTA_DESTINO_CTE:</strong> Caminho da pasta de destino dos arquivos CTe.</li>
  <li><strong>LOG_PATH:</strong> Caminho para o arquivo de log de erros.</li>
</ul>

---

<h2>🛠️ Tecnologias Utilizadas</h2>

<ul>
  <li><strong>Node.js</strong> - Plataforma para execução de JavaScript no servidor.</li>
  <li><strong>fs</strong> - Módulo do Node.js para manipulação de arquivos.</li>
  <li><strong>path</strong> - Módulo do Node.js para manipulação de caminhos de arquivo.</li>
</ul>

---

<h2>🐞 Logs e Erros</h2>

<p>Os logs são armazenados no arquivo configurado em <code>LOG_PATH</code> e registram:</p>
<ul>
  <li>Erros ao acessar pastas ou copiar arquivos.</li>
  <li>Arquivos processados com sucesso.</li>
  <li>Exceções e rejeições não tratadas.</li>
</ul>

---

<p align="center">Desenvolvido por <strong>Luan Marques</strong></p>
