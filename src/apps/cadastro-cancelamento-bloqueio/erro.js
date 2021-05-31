import { MSG_ERRO_SERVIDOR } from "../../shared/constantes/mensagens";

export const getMensagemErro409 = (codigo) => {
  switch (codigo) {
    case "79":
      return "Não foi encontrado código da operação de bloqueio válido.";
    case "80":
      return "O sistema não identificou para o CPF bloqueio ou cancelamento com o motivo informado. Por isso, não foi possível efetuar a liberação.";
    case "81":
      return "O sistema identificou que o CPF já possui um registro de cancelamento para o motivo informado e assim não é possível incluir o bloqueio solicitado.";
    case "82":
      return "Código de motivo nao foi encontrado na base para realização da operação de bloqueio.";
    case "83":
      return "O arquivo não atende o padrão definido para realizar operação de bloqueio, cancelamento ou liberação.";
    case "84":
      return "O arquivo informado excede o número de linhas permitidas.";
    case "85":
      return "Falha ao gerar arquivo CSV para download";
    case "86":
      return "Falha ao ler o arquivo CSV para upload.";
    case "91":
      return "O sistema identificou que o CPF já se encontra cancelado pelo motivo indicado.";
    case "92":
      return "O sistema identificou que o CPF já se encontra bloqueado pelo motivo indicado.";
    default:
      return MSG_ERRO_SERVIDOR;
  }
};
