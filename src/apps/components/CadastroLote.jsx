import { Box } from "@material-ui/core";
import React from "react";
import { Field, Form } from "react-final-form";
import { validarObrigatoriedade } from "../../../shared/helper/validadores";
import { showError, showSuccess } from "../../../shared/helper/messages";
import AppDropzoneInput from "../../../shared/component/AppDropzoneInput";
import AppButton from "../../../shared/component/AppButton";
import NewdooApi from "../../../shared/clients/NewdooClient";
import AppLinearProgress from "../../../shared/component/AppLinearProgress";
import useLoading from "../../../shared/hooks/useLoading";
import { createDownload } from "../../../shared/helper/download";
import { trataErroDoAxios } from "../../../shared/helper/erro";
import { getMensagemErro409 } from "../erro";
import { formatarDataEHoraAtual } from "../../../shared/helper/utilitarioData";
import arquivoModelo from "../files/csv-modelo.csv";

export default function CadastroLote() {
  const onSubmitDados = async (values) => {
    let payload = new FormData();
    payload.append("arquivo", values.arquivo[0]);

    try {
      const retorno = await NewdooApi.postBloqueioCancelamentoLiberacaoLote(payload);
      createDownload(retorno, `Relatório de inclusão por lote ${formatarDataEHoraAtual()}.csv`);
      showSuccess("Cadastrado com sucesso.");
    } catch (e) {
      if (e.response?.status === 409) {
        const msg = getMensagemErro409(e.response.data?.codigo);
        showError(msg);
      } else {
        showError(trataErroDoAxios(e));
      }
    }
  };

  const [isLoadingonSubmitDados, onSubmitDadosWithLoading] = useLoading(onSubmitDados);

  return (
    <Box marginTop="20px">
      {isLoadingonSubmitDados && <AppLinearProgress />}
      <Form
        onSubmit={(values) => {
          onSubmitDadosWithLoading(values);
        }}
        render={({ handleSubmit, form, values }) => (
          <form
            onSubmit={(event) => {
              handleSubmit(event);
            }}>
            <p style={{ marginBottom: "10px", fontSize: "0.9em" }}>
              Arquivo (Tamanho máximo 5MB. Extensão suportada: .csv). Arquivo modelo:{" "}
              <a href={arquivoModelo} download="Arquivo CSV - modelo.csv">
                Download
              </a>
            </p>
            <Field name="arquivo" validate={validarObrigatoriedade}>
              {({ input: { value, onChange, ...input }, meta: { error, invalid, touched } }) => {
                return (
                  <AppDropzoneInput
                    accept={[".csv"]}
                    onChange={onChange}
                    {...input}
                    error={touched && invalid}
                    helperText={touched && error}
                  />
                );
              }}
            </Field>

            <Box marginTop="40px" textAlign="center">
              <AppButton type="submit" disabled={isLoadingonSubmitDados}>
                Enviar
              </AppButton>
            </Box>
          </form>
        )}></Form>
    </Box>
  );
}
